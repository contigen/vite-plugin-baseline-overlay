import { Plugin } from 'vite'
import { scanJS } from './js-scanner'
import { scanCSS } from './css-scanner'
import { checkBaseline } from './baseline-checker'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SRC_CODE_DIR = import.meta.dirname + '/src'

export default function baselineOverlayPlugin(): Plugin {
  let allWarnings: {
    api: string
    status: string
    spec: string
    line: number
    filename: string
    supportedBrowsers: string
    unsupportedBrowsers: string
  }[] = []
  let server: { ws: { send: (data: unknown) => void } } | null = null

  return {
    name: 'vite-plugin-baseline-overlay',

    async load(id) {
      if (id === '/@baseline-overlay') {
        const overlayPath = join(__dirname, '../client/overlay.js')
        const overlayCode = readFileSync(overlayPath, 'utf-8')
        return overlayCode
      }

      return null
    },

    async transform(code, id) {
      if (id.includes(SRC_CODE_DIR) && !id.includes('node_modules')) {
        try {
          // Read the original file to get accurate line numbers
          const fs = await import('fs')
          const originalCode = fs.readFileSync(id, 'utf-8')

          let apis: Array<{ api: string; line: number; filename: string }> = []

          if (
            id.endsWith('.ts') ||
            id.endsWith('.js') ||
            id.endsWith('.jsx') ||
            id.endsWith('.tsx')
          ) {
            apis = scanJS(originalCode, id)
          }
          if (id.endsWith('.css')) {
            apis = scanCSS(originalCode, id)
          }

          if (apis.length) {
            const newWarnings = checkBaseline(apis)
            if (newWarnings.length) {
              allWarnings = allWarnings.filter(w => w.filename !== id)
              allWarnings = [...allWarnings, ...newWarnings]

              if (server && server.ws) {
                server.ws.send({
                  type: 'custom',
                  event: 'baseline:warnings',
                  data: allWarnings,
                })
              }
            }
          }
        } catch (error) {}
      }

      return code
    },

    configureServer(devServer) {
      server = devServer

      devServer.middlewares.use('/api/baseline-warnings', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(allWarnings))
      })

      devServer.ws.on('connection', () => {
        if (allWarnings.length) {
          devServer.ws.send({
            type: 'custom',
            event: 'baseline:warnings',
            data: allWarnings,
          })
        }
      })
    },

    transformIndexHtml(html) {
      return html.replace(
        '</body>',
        `<script type="module" src="/@baseline-overlay"></script></body>`
      )
    },

    resolveId(id) {
      if (id === '/@baseline-overlay') return id
    },
  }
}
