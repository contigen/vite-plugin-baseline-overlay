import { features } from 'web-features'

export function checkBaseline(
  apis: Array<{ api: string; line: number; filename: string }>
) {
  const warnings: {
    api: string
    status: string
    spec: string
    line: number
    filename: string
    supportedBrowsers: string
    unsupportedBrowsers: string
  }[] = []

  const webFeatures = Object.values(features)

  apis.forEach(({ api, line, filename }) => {
    const feature = webFeatures.find(f => {
      if (
        typeof f !== 'object' ||
        !('name' in f) ||
        typeof f.name !== 'string'
      ) {
        return false
      }

      const featureName = f.name.toLowerCase()
      const apiName = api.toLowerCase()

      if (featureName.includes(apiName) || apiName.includes(featureName)) {
        return true
      }

      if ('compat_features' in f && Array.isArray(f.compat_features)) {
        const match = f.compat_features.some(
          compat =>
            compat.toLowerCase().includes(apiName) ||
            apiName.includes(compat.toLowerCase())
        )
        return match
      }

      return false
    })

    if (
      feature &&
      'status' in feature &&
      'baseline' in feature.status &&
      !feature.status.baseline
    ) {
      let supportedBrowsers = 'Unknown'
      let unsupportedBrowsers = 'Unknown'

      if (
        feature &&
        'status' in feature &&
        feature.status &&
        'support' in feature.status
      ) {
        const support = feature.status.support as Record<string, string>
        const supported = []
        const unsupported = []

        if (support.chrome) {
          supported.push(`Chrome ${support.chrome}`)
        } else {
          unsupported.push('Chrome')
        }

        if (support.firefox) {
          supported.push(`Firefox ${support.firefox}`)
        } else {
          unsupported.push('Firefox')
        }

        if (support.safari) {
          supported.push(`Safari ${support.safari}`)
        } else {
          unsupported.push('Safari')
        }

        if (support.edge) {
          supported.push(`Edge ${support.edge}`)
        } else {
          unsupported.push('Edge')
        }
        if (support.chrome_android) {
          supported.push(`Chrome Android ${support.chrome_android}`)
        } else {
          unsupported.push('Chrome Android')
        }
        if (support.firefox_android) {
          supported.push(`Firefox Android ${support.firefox_android}`)
        } else {
          unsupported.push('Firefox Android')
        }

        supportedBrowsers = supported.length > 0 ? supported.join(', ') : 'None'
        unsupportedBrowsers =
          unsupported.length > 0 ? unsupported.join(', ') : 'None'
      }

      const specUrl = feature.spec?.[0] || 'Unknown'

      warnings.push({
        api,
        status: feature.status.baseline.toString(),
        spec: specUrl,
        line,
        filename,
        supportedBrowsers,
        unsupportedBrowsers,
      })
    }
  })

  return warnings
}
