# SVG Mono Compress - VSCode Extension

English | [简体中文](./README.md)

A VSCode extension for SVG compression and monochrome icon conversion (`currentColor`), powered by SVGO.

## Features

- **SVG Compression**: Reduce SVG file size using SVGO
- **Monochrome Conversion**: Convert SVG files into icon-like monochrome style that follows text color
- **Batch Processing**: Process multiple SVG files at once
- **Smart Filtering**: Automatically ignores non-SVG files
- **Config Support**: Supports project-level `svgo.config.js`
- **Context Menu**: Available directly in VSCode Explorer right-click menu

## Installation

### Install from VS Code Marketplace

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for `SVG Mono Compress`
4. Click Install

### Install from VSIX

1. Download the `.vsix` file
2. Press `Ctrl+Shift+P` in VSCode
3. Run `Extensions: Install from VSIX`
4. Select the `.vsix` file

## Usage

### Basic Usage

1. Right-click an SVG file in Explorer
2. Choose one of the commands:
   - **Compress SVG**
   - **Compress as Monochrome SVG**

### Batch Processing

1. Select multiple SVG files
2. Right-click and choose a compression command
3. The extension processes files sequentially and shows summary results

### Custom SVGO Config

Create `svgo.config.js` in your project root:

```js
module.exports = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
};
```

## Notes

- "Compress as Monochrome SVG" is designed for icon-style monochrome output.
- Complex effects like gradients, patterns, and multi-color layers may be simplified or removed.
- Best for icon assets, not for illustration-style SVGs that must preserve rich visual details.

## Development and Release

Developer-focused docs are in [development.md](./development.md).

## License

MIT License. See [LICENSE](./LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
