import postcss from 'postcss'

export function scanCSS(
  code: string,
  filename: string
): Array<{ api: string; line: number; filename: string }> {
  const apis: Array<{ api: string; line: number; filename: string }> = []
  const root = postcss.parse(code)

  root.walkDecls(decl => {
    const prop = decl.prop
    const value = decl.value
    if (prop && prop.length > 0) {
      apis.push({
        api: `CSS.${prop}`,
        line: decl.source?.start?.line || 0,
        filename,
      })
    }
  })

  root.walkRules(rule => {
    const selector = rule.selector
    if (selector && selector.length > 0) {
      apis.push({
        api: `CSS.${selector}`,
        line: rule.source?.start?.line || 0,
        filename,
      })
    }
  })

  return apis
}
