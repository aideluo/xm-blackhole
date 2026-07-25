/* @refresh reload */
/**
 * 应用入口 — Tauri 产品标准启动流程
 */
import { render } from 'solid-js/web'
import { Route } from '@solidjs/router'
import { initTheme } from '@xm/theme'
import { ToastContainer, XmRouter } from '@xm/ui'
import { bootstrapBrand } from '@xm/brand'
import '@xm/tokens/css'
import 'virtual:uno.css'
import { initLogger } from '@xm/logger'
import App from './App'

// 尽早初始化日志
initLogger({ appKey: 'xm-blackhole', source: 'xm-blackhole-web' })

// 初始化主题
initTheme()

// 动态接管品牌 Favicon + 标题
bootstrapBrand('xm-blackhole')

render(
  () => (
    <>
      <XmRouter>
        <Route path="/" component={App} />
        {/* TODO: 添加更多路由 */}
      </XmRouter>
      <ToastContainer />
    </>
  ),
  document.getElementById('root')!
)
