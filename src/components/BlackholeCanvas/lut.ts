export interface BlackholeCanvasProps {
  state: 'idle' | 'hovering' | 'absorbing' | 'success'
  themeColor: 'purple' | 'gold' | 'cyan'
  onAbsorbComplete?: () => void
  onDblClick?: () => void
}

export interface SpiralParticle {
  angle: number
  radius: number
  maxRadius: number
  speed: number
  size: number
  color: string
  alpha: number
  spiralFactor: number
}

export interface DeepSpaceStar {
  angle: number
  radius: number
  speed: number
  size: number
  color: string
  alpha: number
  twinkleFreq: number
  twinklePhase: number
}

// 🌟【预计算几何引力映射表】：静态初始化 360x360 全量像素点的数学方程，彻底消灭拖拽卡顿
export const MAP_SIZE = 360
export const CX = 180
export const CY = 180
export const TOTAL_PIXELS = MAP_SIZE * MAP_SIZE

export const isWarpZone = new Uint8Array(TOTAL_PIXELS)
export const pullRatios = new Float32Array(TOTAL_PIXELS)
export const warpDists = new Float32Array(TOTAL_PIXELS)
export const baseAngles = new Float32Array(TOTAL_PIXELS)
export const edgeAlphas = new Float32Array(TOTAL_PIXELS)

for (let y = 0; y < MAP_SIZE; y++) {
  for (let x = 0; x < MAP_SIZE; x++) {
    const idx = y * MAP_SIZE + x
    const dx = x - CX
    const dy = y - CY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist <= 38) {
      isWarpZone[idx] = 0 // 内核视界透明
    } else if (dist < 172) {
      isWarpZone[idx] = 1 // 引力透镜扭曲区
      const pull = Math.pow((172 - dist) / 134, 1.8)
      pullRatios[idx] = pull
      warpDists[idx] = dist * (1.0 + 0.38 * pull)
      baseAngles[idx] = Math.atan2(dy, dx)
      edgeAlphas[idx] = dist > 152 ? (172 - dist) / 20 : 1.0
    } else {
      isWarpZone[idx] = 2 // 外围透明
    }
  }
}

// 高清双线性插值采样 (Bilinear Sampling)，彻底消除马赛克与齿状锯齿
export const sampleBilinear = (src: Uint8ClampedArray, w: number, h: number, fx: number, fy: number) => {
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(w - 1, x0 + 1)
  const y1 = Math.min(h - 1, y0 + 1)
  const dx = fx - x0
  const dy = fy - y0

  const idx00 = (y0 * w + x0) * 4
  const idx10 = (y0 * w + x1) * 4
  const idx01 = (y1 * w + x0) * 4
  const idx11 = (y1 * w + x1) * 4

  const r = (1 - dx) * (1 - dy) * src[idx00] + dx * (1 - dy) * src[idx10] + (1 - dx) * dy * src[idx01] + dx * dy * src[idx11]
  const g = (1 - dx) * (1 - dy) * src[idx00 + 1] + dx * (1 - dy) * src[idx10 + 1] + (1 - dx) * dy * src[idx01 + 1] + dx * dy * src[idx11 + 1]
  const b = (1 - dx) * (1 - dy) * src[idx00 + 2] + dx * (1 - dy) * src[idx10 + 2] + (1 - dx) * dy * src[idx01 + 2] + dx * dy * src[idx11 + 2]
  const a = (1 - dx) * (1 - dy) * src[idx00 + 3] + dx * (1 - dy) * src[idx10 + 3] + (1 - dx) * dy * src[idx01 + 3] + dx * dy * src[idx11 + 3]

  return [r, g, b, a]
}
