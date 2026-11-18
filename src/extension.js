const vscode = require('vscode');

function activate(context) {
    console.log('RxFlare extension activated.');

    const commands = [
        vscode.commands.registerCommand(
            'rxflare.welcome',
            showWelcome
        ),

        vscode.commands.registerCommand(
            'rxflare.createController',
            createController
        ),

        vscode.commands.registerCommand(
            'rxflare.createPage',
            createPage
        ),

        vscode.commands.registerCommand(
            'rxflare.createPageWithController',
            createPageWithController
        ),

        vscode.commands.registerCommand(
            'rxflare.createModel',
            createModel
        ),

        vscode.commands.registerCommand(
            'rxflare.createFeature',
            createFeature
        )
    ];

    context.subscriptions.push(...commands);
}

function showWelcome() {
    vscode.window.showInformationMessage(
        'Welcome to RxFlare! 🚀'
    );
}

/* -------------------------------------------------------------------------- */
/* Project                                                                    */
/* -------------------------------------------------------------------------- */

async function getFlutterProjectRoot() {
    const workspaceFolders =
        vscode.workspace.workspaceFolders;

    if (!workspaceFolders ||
        workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            'Please open a Flutter project first.'
        );

        return null;
    }

    const root = workspaceFolders[0].uri;

    const pubspec = vscode.Uri.joinPath(
        root,
        'pubspec.yaml'
    );

    const lib = vscode.Uri.joinPath(
        root,
        'lib'
    );

    try {
        await vscode.workspace.fs.stat(pubspec);
        await vscode.workspace.fs.stat(lib);

        return root;
    } catch {
        vscode.window.showErrorMessage(
            'The current workspace is not a Flutter project. pubspec.yaml or lib/ was not found.'
        );

        return null;
    }
}

async function getOutputFolder(type) {
    const root = await getFlutterProjectRoot();

    if (!root) {
        return null;
    }

    const directories = {
        controller: 'controllers',
        page: 'pages',
        model: 'models'
    };

    const directoryName = directories[type];

    const folder = vscode.Uri.joinPath(
        root,
        'lib',
        directoryName
    );

    try {
        await vscode.workspace.fs.createDirectory(folder);

        return folder;
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to create ${directoryName}/: ${error.message}`
        );

        return null;
    }
}

/* -------------------------------------------------------------------------- */
/* Controller                                                                  */
/* -------------------------------------------------------------------------- */

async function createController() {
    const folder =
        await getOutputFolder('controller');

    if (!folder) {
        return;
    }

    const name = await askClassName(
        'Controller',
        'HomeController'
    );

    if (!name) {
        return;
    }

    await createFile(
        folder,
        `${toSnakeCase(name)}.dart`,
        controllerTemplate(name)
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

async function createPage() {
    const folder =
        await getOutputFolder('page');

    if (!folder) {
        return;
    }

    const name = await askClassName(
        'Page',
        'HomePage'
    );

    if (!name) {
        return;
    }

    await createFile(
        folder,
        `${toSnakeCase(name)}.dart`,
        pageTemplate(name)
    );
}

/* -------------------------------------------------------------------------- */
/* Page + Controller                                                           */
/* -------------------------------------------------------------------------- */

async function createPageWithController() {
    const root =
        await getFlutterProjectRoot();

    if (!root) {
        return;
    }

    const pageFolder = vscode.Uri.joinPath(
        root,
        'lib',
        'pages'
    );

    const controllerFolder = vscode.Uri.joinPath(
        root,
        'lib',
        'controllers'
    );

    await vscode.workspace.fs.createDirectory(
        pageFolder
    );

    await vscode.workspace.fs.createDirectory(
        controllerFolder
    );

    const pageName = await askClassName(
        'Page',
        'HomePage'
    );

    if (!pageName) {
        return;
    }

    const controllerName = pageName.endsWith('Page')
        ? `${pageName.replace(/Page$/, '')}Controller`
        : `${pageName}Controller`;

    const pageFileName =
        `${toSnakeCase(pageName)}.dart`;

    const controllerFileName =
        `${toSnakeCase(controllerName)}.dart`;

    const pageUri = vscode.Uri.joinPath(
        pageFolder,
        pageFileName
    );

    const controllerUri = vscode.Uri.joinPath(
        controllerFolder,
        controllerFileName
    );

    if (
        await fileExists(pageUri) ||
        await fileExists(controllerUri)
    ) {
        const result =
            await vscode.window.showWarningMessage(
                'One or more files already exist. Overwrite them?',
                'Overwrite',
                'Cancel'
            );

        if (result !== 'Overwrite') {
            return;
        }
    }

    const pageContent =
        pageWithControllerTemplate(
            pageName,
            controllerName,
            `../controllers/${controllerFileName}`
        );

    const controllerContent =
        controllerTemplate(controllerName);

    try {
        await vscode.workspace.fs.writeFile(
            controllerUri,
            Buffer.from(controllerContent, 'utf8')
        );

        await vscode.workspace.fs.writeFile(
            pageUri,
            Buffer.from(pageContent, 'utf8')
        );

        const document =
            await vscode.workspace.openTextDocument(
                pageUri
            );

        await vscode.window.showTextDocument(
            document
        );

        vscode.window.showInformationMessage(
            `RxFlare: ${pageFileName} and ${controllerFileName} created!`
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to create files: ${error.message}`
        );
    }
}

/* -------------------------------------------------------------------------- */
/* Model                                                                       */
/* -------------------------------------------------------------------------- */

async function createModel() {
    const folder =
        await getOutputFolder('model');

    if (!folder) {
        return;
    }

    const name = await askClassName(
        'Model',
        'UserModel'
    );

    if (!name) {
        return;
    }

    await createFile(
        folder,
        `${toSnakeCase(name)}.dart`,
        modelTemplate(name)
    );
}

/* -------------------------------------------------------------------------- */
/* Feature                                                                     */
/* -------------------------------------------------------------------------- */

async function createFeature() {
    const root =
        await getFlutterProjectRoot();

    if (!root) {
        return;
    }

    const featureName =
        await askFeatureName();

    if (!featureName) {
        return;
    }

    const featureFolder = vscode.Uri.joinPath(
        root,
        'lib',
        'features',
        featureName
    );

    try {
        await vscode.workspace.fs.createDirectory(
            featureFolder
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to create feature folder: ${error.message}`
        );

        return;
    }

    const pageName =
        `${toPascalCase(featureName)}Page`;

    const controllerName =
        `${toPascalCase(featureName)}Controller`;

    const modelName =
        `${toPascalCase(featureName)}Model`;

    const pageFileName =
        `${featureName}_page.dart`;

    const controllerFileName =
        `${featureName}_controller.dart`;

    const modelFileName =
        `${featureName}_model.dart`;

    const pageUri = vscode.Uri.joinPath(
        featureFolder,
        pageFileName
    );

    const controllerUri = vscode.Uri.joinPath(
        featureFolder,
        controllerFileName
    );

    const modelUri = vscode.Uri.joinPath(
        featureFolder,
        modelFileName
    );

    const exists =
        await fileExists(pageUri) ||
        await fileExists(controllerUri) ||
        await fileExists(modelUri);

    if (exists) {
        const result =
            await vscode.window.showWarningMessage(
                `The feature "${featureName}" already contains one or more files. Overwrite them?`,
                'Overwrite',
                'Cancel'
            );

        if (result !== 'Overwrite') {
            return;
        }
    }

    const pageContent =
        featurePageTemplate(
            pageName,
            controllerName,
            controllerFileName
        );

    const controllerContent =
        featureControllerTemplate(
            controllerName,
            modelName,
            modelFileName
        );

    const modelContent =
        featureModelTemplate(modelName);

    try {
        await vscode.workspace.fs.writeFile(
            pageUri,
            Buffer.from(pageContent, 'utf8')
        );

        await vscode.workspace.fs.writeFile(
            controllerUri,
            Buffer.from(controllerContent, 'utf8')
        );

        await vscode.workspace.fs.writeFile(
            modelUri,
            Buffer.from(modelContent, 'utf8')
        );

        const document =
            await vscode.workspace.openTextDocument(
                pageUri
            );

        await vscode.window.showTextDocument(
            document
        );

        vscode.window.showInformationMessage(
            `RxFlare: Feature "${featureName}" created successfully!`
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to create feature: ${error.message}`
        );
    }
}

async function askFeatureName() {
    return vscode.window.showInputBox({
        prompt: 'Enter feature name',
        placeHolder: 'user',
        validateInput: (value) => {
            const name = value.trim().toLowerCase();

            if (!name) {
                return 'Feature name cannot be empty.';
            }

            if (!/^[a-z][a-z0-9_]*$/.test(name)) {
                return (
                    'Use a simple name such as user, home, profile or user_profile.'
                );
            }

            return null;
        }
    });
}

/* -------------------------------------------------------------------------- */
/* Input                                                                       */
/* -------------------------------------------------------------------------- */

async function askClassName(type, defaultValue) {
    return vscode.window.showInputBox({
        prompt: `Enter ${type} class name`,
        value: defaultValue,
        validateInput: (value) => {
            if (!value) {
                return 'Class name cannot be empty.';
            }

            if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
                return (
                    'Use a valid Dart class name, for example HomePage.'
                );
            }

            return null;
        }
    });
}

/* -------------------------------------------------------------------------- */
/* File                                                                        */
/* -------------------------------------------------------------------------- */

async function createFile(
    folder,
    fileName,
    content
) {
    const fileUri =
        vscode.Uri.joinPath(
            folder,
            fileName
        );

    try {
        if (await fileExists(fileUri)) {
            const result =
                await vscode.window.showWarningMessage(
                    `${fileName} already exists. Overwrite it?`,
                    'Overwrite',
                    'Cancel'
                );

            if (result !== 'Overwrite') {
                return;
            }
        }

        await vscode.workspace.fs.writeFile(
            fileUri,
            Buffer.from(content, 'utf8')
        );

        const document =
            await vscode.workspace.openTextDocument(
                fileUri
            );

        await vscode.window.showTextDocument(
            document
        );

        vscode.window.showInformationMessage(
            `RxFlare: ${fileName} created successfully!`
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to create file: ${error.message}`
        );
    }
}

async function fileExists(uri) {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                   */
/* -------------------------------------------------------------------------- */

function controllerTemplate(name) {
    return `import 'package:rxflare/rxflare.dart';

class ${name} {
  final count = 0.rx;

  void increment() {
    count.value++;
  }

  void dispose() {
    count.dispose();
  }
}
`;
}

function pageTemplate(name) {
    const title = name.replace(/Page$/, '');

    return `import 'package:material_ui/material_ui.dart';

class ${name} extends StatelessWidget {
  const ${name}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${title}'),
      ),
      body: const Center(
        child: Text('Welcome to ${title}'),
      ),
    );
  }
}
`;
}

function pageWithControllerTemplate(
    pageName,
    controllerName,
    controllerImport
) {
    const title =
        pageName.replace(/Page$/, '');

    return `import 'package:material_ui/material_ui.dart';
import 'package:rxflare/rxflare.dart';

import '${controllerImport}';

class ${pageName} extends StatefulWidget {
  const ${pageName}({super.key});

  @override
  State<${pageName}> createState() =>
      _${pageName}State();
}

class _${pageName}State extends State<${pageName}> {
  late final ${controllerName} controller;

  @override
  void initState() {
    super.initState();
    controller = ${controllerName}();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${title}'),
      ),
      body: Rx(
        () => Center(
          child: Text(
            controller.count.value.toString(),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
`;
}

function modelTemplate(name) {
    return `class ${name} {
  final String id;
  final String name;

  const ${name}({
    required this.id,
    required this.name,
  });
}
`;
}

function featurePageTemplate(
    pageName,
    controllerName,
    controllerFileName
) {
    const title =
        pageName.replace(/Page$/, '');

    return `import 'package:material_ui/material_ui.dart';
import 'package:rxflare/rxflare.dart';

import '${controllerFileName}';

class ${pageName} extends StatefulWidget {
  const ${pageName}({super.key});

  @override
  State<${pageName}> createState() =>
      _${pageName}State();
}

class _${pageName}State extends State<${pageName}> {
  late final ${controllerName} controller;

  @override
  void initState() {
    super.initState();
    controller = ${controllerName}();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${title}'),
      ),
      body: Rx(
        () => Center(
          child: Text(
            controller.count.value.toString(),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
`;
}

function featureControllerTemplate(
    controllerName,
    modelName,
    modelFileName
) {
    return `import 'package:rxflare/rxflare.dart';

import '${modelFileName}';

class ${controllerName} {
  final count = 0.rx;

  ${modelName}? model;

  void increment() {
    count.value++;
  }

  void dispose() {
    count.dispose();
  }
}
`;
}

function featureModelTemplate(name) {
    return `class ${name} {
  final String id;
  final String name;

  const ${name}({
    required this.id,
    required this.name,
  });
}
`;
}

/* -------------------------------------------------------------------------- */
/* Naming                                                                      */
/* -------------------------------------------------------------------------- */

function toPascalCase(value) {
    return value
        .split('_')
        .filter((part) => part.length > 0)
        .map(
            (part) =>
                part[0].toUpperCase() +
                part.substring(1)
        )
        .join('');
}

function toSnakeCase(value) {
    return value
        .replace(
            /([a-z0-9])([A-Z])/g,
            '$1_$2'
        )
        .replace(
            /([A-Z])([A-Z][a-z])/g,
            '$1_$2'
        )
        .toLowerCase();
}

function deactivate() {
    console.log(
        'RxFlare extension deactivated.'
    );
}

module.exports = {
    activate,
    deactivate
};