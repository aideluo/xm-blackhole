// ═══ 使用说明 ═══
// 1. 复制本模板到 products/ 目录
// 2. 将 productKey 改为新产品 slug，并在 brand/registry/products.json 登记 id
// 3. 到 docs/registry/ports.md 注册端口
import { createXmViteConfig } from '@xm/vite-config'

export default createXmViteConfig({
  productKey: 'xm-blackhole',
})
