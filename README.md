# Baseline Overlay

A Vite plugin that displays baseline compatibility warnings directly in your browser during development.

## Features

- **Real-time API detection** - Scans JavaScript and CSS files for potentially non-baseline APIs
- **Browser compatibility information** - Shows which browsers support each API
- **Spec documentation links** - Direct links to web standards documentation
- **Live reload integration** - Updates warnings as you code

## Installation

```bash
npm install vite-plugin-baseline-overlay
```

## Usage

### Basic Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import baselineOverlay from 'vite-plugin-baseline-overlay'

export default defineConfig({
  plugins: [react(), baselineOverlay()],
})
```

## How it Works

The plugin works by:

1. **Scanning your source files** for JavaScript and CSS APIs during development
2. **Checking compatibility** against the web-features database to determine if APIs are baseline
3. **Displaying warnings** in an overlay when non-baseline APIs are detected
4. **Providing detailed information** including browser support and spec documentation

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

### 1.0.0

- Initial release
- Browser compatibility warnings
- WebSocket communication
- Support for JavaScript and CSS scanning
