# RxFlare for VS Code

**Official Visual Studio Code Extension for RxFlare — Reactive State Management for Flutter and Dart.**

RxFlare for VS Code is the official development extension for the RxFlare ecosystem. It provides intelligent Dart snippets, project code generators, and productivity tools to help developers build Flutter applications faster with clean and consistent architecture.

## Features

- **Code Generation** — Generate Pages, Controllers, Models, and complete Feature modules.
- **Reactive Programming Snippets** — Quickly write reactive variables, collections, builders, and listeners.
- **State Management** — Simplify reactive state management with `RxState` and `RxBuilder`.
- **Dependency Injection** — Easily register and retrieve dependencies using `RxDI` and `RxProvider`.
- **Async State Handling** — Quickly implement reactive asynchronous operations.
- **Resource Management** — Generate common resource disposal patterns.
- **Productivity Tools** — Reduce repetitive code and maintain consistent project structures.

## Commands

Open the Command Palette (`Ctrl + Shift + P`) and search for `RxFlare`.

| Command | Description |
|---|---|
| `RxFlare: Create Page + Controller` | Generate a Page and its Controller |
| `RxFlare: Create Controller` | Generate a Controller |
| `RxFlare: Create Page` | Generate a Page |
| `RxFlare: Create Model` | Generate a Model |
| `RxFlare: Create Feature` | Generate a complete Feature module |

## Dart Code Snippets

RxFlare provides intelligent Dart snippets for frequently used APIs.

Type a snippet prefix in a Dart file and select the suggested completion.

### Reactive Values

| Prefix | Description |
|---|---|
| `rx` | Create a reactive variable |
| `rxlist` | Create a reactive List |
| `rxmap` | Create a reactive Map |
| `rxset` | Create a reactive Set |
| `rxupdate` | Update a reactive value |

### Reactive Widgets

| Prefix | Description |
|---|---|
| `rxbuilder` | Create an RxBuilder widget |
| `rxstate` | Create an RxState class |
| `rxprovider` | Create an RxProvider widget |

### Dependency Injection

| Prefix | Description |
|---|---|
| `rxput` | Register a dependency with RxDI |
| `rxfind` | Retrieve a dependency with RxDI |
| `rxlazyput` | Register a lazy dependency |

### Reactive Listeners

| Prefix | Description |
|---|---|
| `rxlisten` | Listen to reactive value changes |
| `rxever` | Create a reactive listener |
| `rxonce` | Listen for the first matching change |

### Async Operations

| Prefix | Description |
|---|---|
| `rxfuture` | Create a reactive Future operation |
| `rxasync` | Generate an asynchronous state handling pattern |

### Resource Management

| Prefix | Description |
|---|---|
| `rxdispose` | Generate a dispose method |
| `rxcontroller` | Generate a Controller template |

*Note: Snippet prefixes should match the actual prefixes registered in the extension.*

## Examples

### 1. Reactive Value

```dart
final count = 0.rx;

// Update the value
count.value++;
```

### 2. Reactive Collection

```dart
final users = <String>[].rx;

// Update the collection
users.add('RxFlare');
```

### 3. Reactive Widget

```dart
RxBuilder(
  builder: (context) {
    return Text('Count: ${count.value}');
  },
);
```

### 4. Dependency Injection

```dart
// Register a dependency
RxDI.put<CounterController>(
  CounterController(),
);

// Retrieve a dependency
final controller = RxDI.find<CounterController>();
```

### 5. RxProvider

```dart
RxProvider<CounterController>(
  dependency: CounterController(),
  child: const MyPage(),
);
```

## Requirements

- Visual Studio Code 1.85.0 or later
- Dart extension
- Flutter project using RxFlare

## Installation

1. Open Visual Studio Code.
2. Open the Extensions view.
3. Search for **RxFlare**.
4. Click **Install**.

## RxFlare Ecosystem

- [RxFlare on pub.dev](https://pub.dev/packages/rxflare)
- [RxFlare on GitHub](https://github.com/msfm2018/rxflare)

## Feedback and Issues

Found a bug or have a feature request?

Please open an issue in the [RxFlare VS Code Extension repository](https://github.com/msfm2018).

## License

MIT License.