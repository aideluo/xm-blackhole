import { createSignal } from 'solid-js'
import { toast, Dialog, BrandLogo, Tooltip } from '@xm/ui'
import { isDark } from '@xm/theme'
import { isTauri } from '@xm/utils'
import { initWindowState, XmDesktopFrame } from '@xm/shell'
import { AuthGate } from '@xm/auth'
import { SidebarUserWidget } from '@xm/auth/ui'
import { BlackholeCanvas } from './components/BlackholeCanvas'
import { DropZone } from './components/DropZone'
import { StatsDashboard } from './components/StatsDashboard'

if (isTauri()) initWindowState()

export default function App() {
  const [canvasState, setCanvasState] = createSignal<'idle' | 'hovering' | 'absorbing' | 'success'>('idle')
  const [themeColor, setThemeColor] = createSignal<'purple' | 'gold' | 'cyan'>('purple')
  const [controlCenterOpen, setControlCenterOpen] = createSignal(false)

  const [absorbedCount, setAbsorbedCount] = createSignal(12)
  const [destroyedBytes, setDestroyedBytes] = createSignal(1024 * 1024 * 48)
  const [bot4LeadsCount, setBot4LeadsCount] = createSignal(38)

  const handleActionSelect = (actionType: 'trash' | 'privacy' | 'bot4' | 'knowbox', payload: { names: string[]; count: number }) => {
    setCanvasState('absorbing')

    setTimeout(() => {
      setCanvasState('success')
      setAbsorbedCount((c) => c + payload.count)

      switch (actionType) {
        case 'trash':
          toast.success(`已成功将 ${payload.count} 项送入系统回收站`)
          break
        case 'privacy':
          setDestroyedBytes((b) => b + payload.count * 1024 * 512)
          toast.success(`物理擦除完成，出具安全销毁凭证 #${Math.floor(Math.random() * 89000 + 10000)}`)
          break
        case 'bot4':
          setBot4LeadsCount((l) => l + payload.count * 5)
          toast.success(`Bot4 自动化已接收，正在后台自动加粉引流`)
          break
        case 'knowbox':
          toast.success(`AI 知识卡片生成成功，已同步至 Knowbox 个人库`)
          break
      }

      setTimeout(() => {
        setCanvasState('idle')
      }, 1000)
    }, 1200)
  }

  return (
    <XmDesktopFrame
      productKey="xm-blackhole"
      theme="dark"
      transparent={true}
      hideShellBar={true}
      bgClass="bg-transparent"
      disableAutoPadding={true}
    >
      <AuthGate productKey="xm-blackhole" loginMode="remote">
        {/* ═══ 桌面无边框全透明容器 (桌面图标与窗口无遮挡透出) ═══ */}
        <div class="h-full w-full flex items-center justify-center bg-transparent select-none">
          <DropZone
            onActionSelect={handleActionSelect}
            onHoverStateChange={(isHover) => {
              if (canvasState() !== 'absorbing') {
                setCanvasState(isHover ? 'hovering' : 'idle')
              }
            }}
            onOpenSettings={() => setControlCenterOpen(true)}
          >
            {/* 桌面纯黑洞粒子 Canvas (保持纯净美观无气泡遮挡，双击呼出控制面板，按住可任意拖动) */}
            <div>
              <BlackholeCanvas
                state={canvasState()}
                themeColor={themeColor()}
                onDblClick={() => setControlCenterOpen(true)}
              />
            </div>
          </DropZone>

          {/* ═══ 控制中心弹窗 (适配极致毛玻璃 glass 效果，避免常态遮挡桌面) ═══ */}
          <Dialog
            open={controlCenterOpen()}
            title="暗核工坊 · 控制中心"
            cancelText="关闭"
            glass={true}
            maskClosable={true}
            onClose={() => setControlCenterOpen(false)}
            onCancel={() => setControlCenterOpen(false)}
            onOpenChange={(open) => setControlCenterOpen(open)}
          >
            <div class="flex flex-col gap-4 py-2">
              {/* 头部产品与账户挂件 (适配毛玻璃 backdrop-blur-md) */}
              <div class="flex items-center justify-between p-3 rounded-xl bg-[rgba(15,23,42,0.45)] backdrop-blur-md border border-white/10">
                <div class="flex items-center gap-2">
                  <BrandLogo size={24} slug="xm-blackhole" />
                  <div>
                    <div class="text-sm font-700 text-purple-300">暗核工坊 (Desktop Engine)</div>
                    <div class="text-xs text-white/70">桌面穿透引力黑洞 · 零窗口遮挡</div>
                  </div>
                </div>
                <div class="scale-90">
                  <SidebarUserWidget config={{ productName: 'xm-blackhole' }} profileMode="remote" />
                </div>
              </div>

              {/* 统计仪表盘与特权解锁 */}
              <StatsDashboard
                absorbedCount={absorbedCount()}
                destroyedBytes={destroyedBytes()}
                bot4LeadsCount={bot4LeadsCount()}
                themeColor={themeColor()}
                onThemeChange={(t) => setThemeColor(t)}
              />
            </div>
          </Dialog>
        </div>
      </AuthGate>
    </XmDesktopFrame>
  )
}
