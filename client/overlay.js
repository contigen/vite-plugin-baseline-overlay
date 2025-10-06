console.log('Baseline Overlay script loaded!')

const container = document.createElement('div')
container.id = 'baseline-overlay'
document.body.appendChild(container)

let warnings = []

function createOverlay() {
  if (warnings.length === 0) {
    container.innerHTML = `
      <div style="
        position: fixed;
        bottom: 16px;
        right: 16px;
        background-color: rgba(0, 0, 0, 0.95);
        color: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        max-width: 450px;
        max-height: 70vh;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 13px;
        z-index: 9999;
        border: 2px solid #fbbf24;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div style="
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #000;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span>⚠️</span>
          <span>No Baseline Issues</span>
        </div>
        <div style="
          padding: 12px 20px;
          color: #9ca3af;
          font-size: 11px;
          text-align: center;
        ">
          💡 All APIs are baseline compatible!
        </div>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div style="
      position: fixed;
      bottom: 16px;
      right: 16px;
      background-color: rgba(0, 0, 0, 0.95);
      color: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      max-width: 450px;
      max-height: 70vh;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 13px;
      z-index: 9999;
      border: 2px solid #fbbf24;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    ">
      <div style="
        padding: 16px 20px 12px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #000;
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>⚠️</span>
        <span>Baseline Issues (${warnings.length})</span>
      </div>

      <div style="
        max-height: 400px;
        overflow-y: auto;
        padding: 0;
      ">
        ${warnings
          .map(
            w => `
          <div style="
            padding: 12px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: background-color 0.2s ease;
            cursor: pointer;
          " onmouseenter="this.style.backgroundColor='rgba(255, 255, 255, 0.05)'" onmouseleave="this.style.backgroundColor='transparent'">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;
            ">
              <span style="
                color: #fbbf24;
                font-weight: bold;
                font-size: 12px;
                min-width: 60px;
              ">${w.api}</span>
              <span style="color: #9ca3af">→</span>
              <span style="
                color: #f87171;
                font-size: 12px;
                padding: 2px 6px;
                background-color: rgba(248, 113, 113, 0.1);
                border-radius: 4px;
                border: 1px solid rgba(248, 113, 113, 0.2);
              ">${w.status}</span>
              ${
                w.line > 0
                  ? `
                <span style="
                  color: #6b7280;
                  font-size: 10px;
                  padding: 1px 4px;
                  background-color: rgba(107, 114, 128, 0.1);
                  border-radius: 3px;
                  border: 1px solid rgba(107, 114, 128, 0.2);
                ">Line ${w.line}</span>
              `
                  : ''
              }
            </div>

            <div style="
              font-size: 10px;
              color: #6b7280;
              margin-bottom: 4px;
              padding: 2px 6px;
              background-color: rgba(107, 114, 128, 0.1);
              border-radius: 3px;
              border: 1px solid rgba(107, 114, 128, 0.2);
              font-family: monospace;
            ">
              📁 ${w.filename.split('/').pop()}
            </div>

            ${
              w.supportedBrowsers &&
              w.supportedBrowsers !== 'Unknown' &&
              w.supportedBrowsers !== 'None'
                ? `
              <div style="
                font-size: 10px;
                color: #10b981;
                margin-bottom: 4px;
                padding: 2px 6px;
                background-color: rgba(16, 185, 129, 0.1);
                border-radius: 3px;
                border: 1px solid rgba(16, 185, 129, 0.2);
              ">
                ✅ ${w.supportedBrowsers}
              </div>
            `
                : ''
            }

            ${
              w.unsupportedBrowsers &&
              w.unsupportedBrowsers !== 'Unknown' &&
              w.unsupportedBrowsers !== 'None'
                ? `
              <div style="
                font-size: 10px;
                color: #ef4444;
                margin-bottom: 4px;
                padding: 2px 6px;
                background-color: rgba(239, 68, 68, 0.1);
                border-radius: 3px;
                border: 1px solid rgba(239, 68, 68, 0.2);
              ">
                ❌ ${w.unsupportedBrowsers}
              </div>
            `
                : ''
            }

            ${
              w.spec && w.spec !== 'Unknown'
                ? `
              <a href="${w.spec}" target="_blank" rel="noreferrer" style="
                color: #60a5fa;
                text-decoration: none;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background-color: rgba(96, 165, 250, 0.1);
                border-radius: 4px;
                border: 1px solid rgba(96, 165, 250, 0.2);
                transition: all 0.2s ease;
                max-width: fit-content;
              " onmouseenter="this.style.backgroundColor='rgba(96, 165, 250, 0.2)'; this.style.textDecoration='underline'" onmouseleave="this.style.backgroundColor='rgba(96, 165, 250, 0.1)'; this.style.textDecoration='none'">
                Spec Docs
              </a>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>

      <div style="
        padding: 12px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.3);
        color: #9ca3af;
        font-size: 11px;
        text-align: center;
      ">
        💡 These APIs may not be supported in all browsers
      </div>
    </div>
  `
}

function setupWebSocket() {
  console.log('🔌 Setting up WebSocket connection...')

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}`

  const ws = new WebSocket(wsUrl)
  let timeoutId

  timeoutId = setTimeout(() => {
    console.log('⏰ WebSocket timeout, falling back to polling...')
    ws.close()

    const pollForWarnings = () => {
      console.log('📡 Polling for warnings...')
      fetch('/api/baseline-warnings')
        .then(res => res.json())
        .then(data => {
          console.log('📨 Received warnings:', data)
          if (data && data.length > 0) {
            warnings = data
            createOverlay()
          } else {
            warnings = []
            createOverlay()
          }
        })
        .catch(err => {
          console.log('❌ Polling error:', err)
        })
    }

    // Poll immediately and then every 5 seconds
    pollForWarnings()
    const pollInterval = setInterval(pollForWarnings, 5000)
    return () => clearInterval(pollInterval)
  }, 3000)

  ws.onopen = () => {
    console.log('✅ WebSocket connected')
    clearTimeout(timeoutId)
  }

  ws.onerror = err => {
    console.log('❌ WebSocket error:', err)
    clearTimeout(timeoutId)
  }

  ws.onclose = event => {
    console.log('❌ WebSocket closed:', event.code, event.reason)
    clearTimeout(timeoutId)
  }

  ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data)
      console.log('📨 WebSocket message:', msg)
      if (msg.type === 'custom' && msg.event === 'baseline:warnings') {
        console.log('⚠️ Received baseline warnings:', msg.data)
        warnings = msg.data
        createOverlay()
      }
    } catch (err) {
      console.log('❌ Error parsing WebSocket message:', err)
    }
  }

  return () => {
    clearTimeout(timeoutId)
    ws.close()
  }
}

// Start immediately
console.log('🚀 Starting overlay setup...')
setupWebSocket()

export default function Overlay() {
  console.log('Baseline Overlay function called!')
}
