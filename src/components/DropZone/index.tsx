import { createSignal, Show } from 'solid-js'
import { toast } from '@xm/ui'
import { getCurrentWindow } from '@tauri-apps/api/window'

export interface DropZoneProps {
  children?: any
  onActionSelect: (actionType: 'trash' | 'privacy' | 'bot4' | 'knowbox', payload: { names: string[]; count: number }) => void
  onHoverStateChange: (isHovering: boolean) => void
  onOpenSettings: () => void
}

export function DropZone(props: DropZoneProps) {
  const [isDragging, setIsDragging] = createSignal(false)
  const [draggedFiles, setDraggedFiles] = createSignal<string[]>([])

  let lastClickTime = 0
  let isPointerDown = false
  let startX = 0
  let startY = 0
  let hasInitiatedDrag = false

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return

    const now = Date.now()
    // 🌟【双击 100% 触发弹窗】：判定连续两次点击时间差 < 360ms
    if (now - lastClickTime < 360) {
      e.preventDefault()
      e.stopPropagation()
      lastClickTime = 0
      isPointerDown = false
      hasInitiatedDrag = false
      props.onOpenSettings()
      return
    }

    lastClickTime = now
    isPointerDown = true
    hasInitiatedDrag = false
    startX = e.clientX
    startY = e.clientY
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isPointerDown || hasInitiatedDrag) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.hypot(dx, dy) > 3) {
      hasInitiatedDrag = true
      isPointerDown = false
      if ((window as any).__TAURI_INTERNALS__) {
        void getCurrentWindow().startDragging().catch(() => {})
      }
    }
  }

  const handlePointerUp = () => {
    isPointerDown = false
    hasInitiatedDrag = false
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    props.onHoverStateChange(true)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.relatedTarget === null) {
      setIsDragging(false)
      props.onHoverStateChange(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    props.onHoverStateChange(false)

    const files = e.dataTransfer?.files
    const names: string[] = []

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        names.push(files[i].name)
      }
    } else {
      const text = e.dataTransfer?.getData('text') || '拖入的文本片段'
      names.push(text.slice(0, 20) + (text.length > 20 ? '...' : ''))
    }

    setDraggedFiles(names)
    toast.info(`暗核已引力捕获 ${names.length} 项，请选择处理动作`)
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      class="relative w-full h-full flex flex-col items-center justify-center select-none bg-transparent"
    >
      {/* 黑洞主体插槽：采用延迟位移检测，完美平衡拖拽与 100% 极速双击响应 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDblClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          props.onOpenSettings()
        }}
        class="relative cursor-move"
      >
        {props.children}
      </div>

      {/* 拖拽释放动作轮盘 */}
      <Show when={draggedFiles().length > 0}>
        <div class="absolute inset-0 bg-[rgba(3,7,18,0.85)] backdrop-blur-md rounded-full flex flex-col items-center justify-center p-4 gap-3 animate-fade-in border border-purple-500/30">
          <div class="text-xs text-purple-300 font-600">
            已捕获 {draggedFiles().length} 个项目
          </div>

          <div class="grid grid-cols-2 gap-2 w-full max-w-[260px]">
            <button
              onClick={() => {
                props.onActionSelect('trash', { names: draggedFiles(), count: draggedFiles().length })
                setDraggedFiles([])
              }}
              class="flex items-center gap-1.5 p-2 rounded-xl bg-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.4)] text-red-300 text-xs font-500 border border-red-500/40"
            >
              <span class="i-carbon-trash-can text-sm" />
              <span>移入回收站</span>
            </button>

            <button
              onClick={() => {
                props.onActionSelect('privacy', { names: draggedFiles(), count: draggedFiles().length })
                setDraggedFiles([])
              }}
              class="flex items-center gap-1.5 p-2 rounded-xl bg-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.4)] text-purple-200 text-xs font-500 border border-purple-500/40"
            >
              <span class="i-carbon-locked text-sm" />
              <span>物理彻底粉碎</span>
            </button>

            <button
              onClick={() => {
                props.onActionSelect('bot4', { names: draggedFiles(), count: draggedFiles().length })
                setDraggedFiles([])
              }}
              class="flex items-center gap-1.5 p-2 rounded-xl bg-[rgba(16,185,129,0.2)] hover:bg-[rgba(16,185,129,0.4)] text-emerald-300 text-xs font-500 border border-emerald-500/40"
            >
              <span class="i-carbon-user-follow text-sm" />
              <span>Bot4私域吸金</span>
            </button>

            <button
              onClick={() => {
                props.onActionSelect('knowbox', { names: draggedFiles(), count: draggedFiles().length })
                setDraggedFiles([])
              }}
              class="flex items-center gap-1.5 p-2 rounded-xl bg-[rgba(59,130,246,0.2)] hover:bg-[rgba(59,130,246,0.4)] text-blue-300 text-xs font-500 border border-blue-500/40"
            >
              <span class="i-carbon-notebook text-sm" />
              <span>AI知识库提取</span>
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}
