import { parse } from '@babel/parser'

function traverse(
  node: unknown,
  apis: Array<{ api: string; line: number; filename: string }>,
  filename: string,
  lines: string[]
) {
  if (!node || typeof node !== 'object') return

  const nodeObj = node as Record<string, unknown>

  if (nodeObj.type === 'MemberExpression') {
    const object = nodeObj.object as Record<string, unknown>
    const property = nodeObj.property as Record<string, unknown>
    if (object.type === 'Identifier' && property.type === 'Identifier') {
      const line = (nodeObj.loc as any)?.start?.line || 0
      const apiName = `${object.name}.${property.name}`

      if (
        apiName.startsWith('navigator.') ||
        apiName.startsWith('keyboard.') ||
        apiName.startsWith('document.request') ||
        apiName.startsWith('document.exit') ||
        apiName.startsWith('window.request') ||
        apiName.startsWith('window.cancel') ||
        apiName === 'fetch' ||
        apiName === 'CSS.supports' ||
        apiName === 'CSS.has'
      ) {
        // Debug: log the actual line content to verify
        const actualLine = lines[line - 1] || 'N/A'
        console.log(
          `🔍 Detected ${apiName} at line ${line}: "${actualLine.trim()}"`
        )
        apis.push({ api: apiName, line, filename })
      }
    }
  }

  if (nodeObj.type === 'Identifier') {
    const name = nodeObj.name as string
  }

  for (const key in node) {
    if (node && typeof node === 'object' && key in node) {
      const nodeValue = (node as Record<string, unknown>)[key]
      if (nodeValue && typeof nodeValue === 'object') {
        if (Array.isArray(nodeValue)) {
          nodeValue.forEach((child: unknown) =>
            traverse(child, apis, filename, lines)
          )
        } else {
          traverse(nodeValue, apis, filename, lines)
        }
      }
    }
  }
}

export function scanJS(
  code: string,
  filename: string
): Array<{ api: string; line: number; filename: string }> {
  const apis: Array<{ api: string; line: number; filename: string }> = []
  const lines = code.split('\n')

  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      ranges: true,
      tokens: true,
    })

    traverse(ast, apis, filename, lines)
  } catch (error) {
    // Silently handle parsing errors
  }

  return apis
}
