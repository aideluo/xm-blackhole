import { createSignal } from 'solid-js'
import { Card, CurveButton, toast, Dialog } from '@xm/ui'
import { usePayGate } from '@xm/pay-gate'

export interface StatsDashboardProps {
  absorbedCount: number
  destroyedBytes: number
  bot4LeadsCount: number
  themeColor: 'purple' | 'gold' | 'cyan'
  onThemeChange: (theme: 'purple' | 'gold' | 'cyan') => void
}

export function StatsDashboard(props: StatsDashboardProps) {
  const [payModalOpen, setPayModalOpen] = createSignal(false)
  const [payLoading, setPayLoading] = createSignal(false)
  const payGate = usePayGate()

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handlePay = async () => {
    setPayLoading(true)
    try {
      const ok = await payGate.open({
        product: 'xm-blackhole',
        sku: 'pro_yearly',
        priceFen: 19900,
        name: '暗核工坊 Pro 专业版 (年度)',
        desc: '解锁物理级数据粉碎、Bot4私域批量加粉与专属星云主题皮肤'
      })
      if (ok) {
        toast.success('特权解锁成功！感谢支持。')
        setPayModalOpen(false)
      }
    } catch (err) {
      toast.error(`支付发起失败: ${err}`)
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div class="w-full flex flex-col gap-3 select-none">
      {/* 🌟 核心统计卡片 (重构排版：绝对垂直居中 + 单行数字单位锁 + 绝不换行) */}
      <div class="grid grid-cols-3 gap-2">
        {/* 卡片1：吞噬文件 */}
        <Card
          variant="glass"
          class="relative overflow-hidden !bg-[rgba(15,23,42,0.55)] backdrop-blur-xl border border-white/10 shadow-lg shadow-purple-950/30 p-2 px-1.5 h-[72px] flex flex-col items-center justify-center gap-1.5 text-center rounded-xl transition-all duration-300 hover:border-purple-400/50 hover:!bg-[rgba(15,23,42,0.75)] group"
        >
          {/* 上方：高亮发光统计数字 */}
          <div class="w-full flex items-center justify-center text-[15px] font-800 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] tracking-tight leading-none whitespace-nowrap flex-nowrap shrink-0">
            <span>{props.absorbedCount}</span>
            <span class="text-[11px] font-600 opacity-80 ml-0.5">个</span>
          </div>
          {/* 下方：图标与单行绝不换行文字 */}
          <div class="w-full flex items-center justify-center gap-1 text-[11px] text-white/80 font-500 whitespace-nowrap flex-nowrap shrink-0">
            <span class="i-carbon-clean text-purple-400 text-xs shrink-0" />
            <span class="whitespace-nowrap">吞噬文件</span>
          </div>
        </Card>

        {/* 卡片2：粉碎体积 */}
        <Card
          variant="glass"
          class="relative overflow-hidden !bg-[rgba(15,23,42,0.55)] backdrop-blur-xl border border-white/10 shadow-lg shadow-cyan-950/30 p-2 px-1.5 h-[72px] flex flex-col items-center justify-center gap-1.5 text-center rounded-xl transition-all duration-300 hover:border-cyan-400/50 hover:!bg-[rgba(15,23,42,0.75)] group"
        >
          {/* 上方：高亮发光统计数字与 MB/KB 单位 (100% 强锁同行，绝对垂直居中) */}
          <div class="w-full flex items-center justify-center text-[15px] font-800 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] tracking-tight leading-none whitespace-nowrap flex-nowrap shrink-0">
            <span>{formatSize(props.destroyedBytes)}</span>
          </div>
          {/* 下方：图标与单行绝不换行文字 */}
          <div class="w-full flex items-center justify-center gap-1 text-[11px] text-white/80 font-500 whitespace-nowrap flex-nowrap shrink-0">
            <span class="i-carbon-trash-can text-cyan-400 text-xs shrink-0" />
            <span class="whitespace-nowrap">粉碎体积</span>
          </div>
        </Card>

        {/* 卡片3：Bot4吸金 */}
        <Card
          variant="glass"
          class="relative overflow-hidden !bg-[rgba(15,23,42,0.55)] backdrop-blur-xl border border-white/10 shadow-lg shadow-emerald-950/30 p-2 px-1.5 h-[72px] flex flex-col items-center justify-center gap-1.5 text-center rounded-xl transition-all duration-300 hover:border-emerald-400/50 hover:!bg-[rgba(15,23,42,0.75)] group"
        >
          {/* 上方：高亮发光统计数字 */}
          <div class="w-full flex items-center justify-center text-[15px] font-800 text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] tracking-tight leading-none whitespace-nowrap flex-nowrap shrink-0">
            <span>{props.bot4LeadsCount}</span>
            <span class="text-[11px] font-600 opacity-80 ml-0.5">人</span>
          </div>
          {/* 下方：图标与单行绝不换行文字 */}
          <div class="w-full flex items-center justify-center gap-1 text-[11px] text-white/80 font-500 whitespace-nowrap flex-nowrap shrink-0">
            <span class="i-carbon-user-follow text-emerald-400 text-xs shrink-0" />
            <span class="whitespace-nowrap">Bot4吸金</span>
          </div>
        </Card>
      </div>

      {/* 🌟 主题切换与 Pro 会员栏 (默认毛玻璃 + CurveButton 动态彩虹 Canvas 光效按钮) */}
      <div class="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[rgba(15,23,42,0.55)] backdrop-blur-xl border border-white/10 shadow-lg shadow-purple-950/30">
        <div class="flex items-center gap-2">
          <span class="text-xs text-white/80 font-500 whitespace-nowrap">黑洞皮肤:</span>
          <button
            onClick={() => props.onThemeChange('purple')}
            class={`w-5 h-5 rounded-full bg-purple-500 border-2 transition-all ${props.themeColor === 'purple' ? 'border-white scale-110 shadow-lg shadow-purple-500/50' : 'border-transparent opacity-70 hover:opacity-100'}`}
            title="星云紫"
          />
          <button
            onClick={() => props.onThemeChange('gold')}
            class={`w-5 h-5 rounded-full bg-amber-500 border-2 transition-all ${props.themeColor === 'gold' ? 'border-white scale-110 shadow-lg shadow-amber-500/50' : 'border-transparent opacity-70 hover:opacity-100'}`}
            title="赛博金"
          />
          <button
            onClick={() => props.onThemeChange('cyan')}
            class={`w-5 h-5 rounded-full bg-cyan-500 border-2 transition-all ${props.themeColor === 'cyan' ? 'border-white scale-110 shadow-lg shadow-cyan-500/50' : 'border-transparent opacity-70 hover:opacity-100'}`}
            title="虚空青"
          />
        </div>

        {/* 🌟 极致 CurveButton 彩虹动态流光 Canvas 按钮 */}
        <CurveButton
          active={true}
          noShift={true}
          btnWidth="136px"
          colors={['#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#10b981']}
          onClick={() => setPayModalOpen(true)}
        >
          <div class="flex items-center gap-1.5 justify-center text-xs font-600 text-white whitespace-nowrap">
            <span class="i-carbon-star-filled text-amber-300 shrink-0" />
            <span>解锁 Pro 特权</span>
          </div>
        </CurveButton>
      </div>

      {/* 解锁对话框 - 适配毛玻璃 glass={true} 效果 */}
      <Dialog
        open={payModalOpen()}
        title="解锁暗核工坊 Pro 专业特权"
        okText="立即解锁 (199元/年)"
        cancelText="取消"
        glass={true}
        maskClosable={true}
        okLoading={payLoading()}
        onOk={handlePay}
        onClose={() => setPayModalOpen(false)}
        onCancel={() => setPayModalOpen(false)}
      >
        <div class="flex flex-col gap-3 py-2 text-sm text-[var(--text-primary)]">
          <div class="p-3 rounded-lg bg-[var(--brand-10)] text-xs text-[var(--brand)]">
            暗核工坊 Pro 能够无缝联动 xm-bot4 私域自动化与物理级数据擦除引擎。
          </div>
          <ul class="flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
            <li class="flex items-center gap-2">
              <span class="i-carbon-checkmark text-emerald-400" />
              <span>物理级覆盖粉碎，防止数据复原</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="i-carbon-checkmark text-emerald-400" />
              <span>无限制 Bot4 私域自动加粉与死粉清洗</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="i-carbon-checkmark text-emerald-400" />
              <span>解锁全套赛博金/虚空青动态粒子引擎皮肤</span>
            </li>
          </ul>
        </div>
      </Dialog>
    </div>
  )
}
