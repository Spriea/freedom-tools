# 一休工具频道目录发布

> 2026-11-06 专项修复更新：两个 JSON 已通过 GitHub 连接仅提交到 Spriea/freedom-tools 的 main，Pages build and deployment 已成功，通过本机 7890 代理实测两地址 200 JSON。推荐 0 个；基础资料 8 个、可播地址 0 个。下方“GitHub 404/未推送”是上一轮历史状态。当前本地 origin 实为 Spriea/privacy-policy，未改变它，也没有从此工作区盲目 push。完整记录见 ToolboxOne/Docs/V106_IPTV_SEARCH_SEPARATION_20261106.md。


这里只托管频道元数据，不托管、代理或转播节目视频。更新时间：2026-11-06。

## 本轮实际部署状态

- 主源：`https://www.freedomtools.top/apps/yixiu-tools/iptv/catalog-v1.json`
- 备用：`https://spriea.github.io/freedom-tools/apps/yixiu-tools/iptv/catalog-v1.json`
- 复用成都 ECS 上已经运行的 Caddy，目录 `/var/www/freedomtools/apps/yixiu-tools/iptv/`。没有安装其他 Web 服务器，没有重启服务或修改既有 Caddy 配置。
- 已把两个 JSON 原子写入服务器。服务器本机以正常 TLS 验证请求主源得到 200，Caddy 提供 ETag、Last-Modified。
- Mac 的 curl 和 Chrome 仍出现连接中断。安全组 80/443 已开放，UFW 未启用。不能把服务器本机 200 当成国内用户网络验收通过，也尚未部署 OSS/CDN。
- GitHub Pages 地址本轮检查仍为 404。文件已准备在此仓库，但遵守“不 commit/push”要求，未发布 GitHub Pages。
- 备案概览曾显示“管局审核中”。尚未取得该域名已完成备案的证据；不绕过接入限制，不把它认定为所有网络错误的已证实根因。

## 当前内容

`catalog-v1.json`：Schema 1 / revision 1，8 个 CCTV 基础资料条目，无播放 URL、未核实授权、不是推荐频道。可离线搜索台名，不能据此宣称已提供可直接播放的电视服务。

`recommendations-v1.json`：旧客户端兼容端点，沿用原推荐格式，channels 为空。不能把新目录模型直接复制到旧端点。本轮也已部署到自有服务器，但没有新增推荐内容。

现有 QA 的 Apple HLS 工程测试视频仅用于测试，不在这些发布文件里，不是电视推荐。

## 新目录格式

顶层：schema、revision、publishedAt、expiresAt、channels。日期为 ISO-8601 UTC。

每个频道：稳定 id、name、group、可选 logo / streamURL、metadata、enabled、可选 aliases。
metadata 包含 tvgID、country、region、languages、categories、origin、authorization、sourceURL、许可核实记录和最近响应检查信息。

- origin：official / community；public JSON 禁止 user。用户自定义来源在设备端另行保存。
- authorization：verified / unverified。公开列表或能播放不等于授权。
- 只有 official + verified 且具有许可依据、许可链接、署名、核实人、核实日期及有效期时，才可设置 recommended=true。
- 推荐的 streamURL 必须是实际 HTTPS 媒体流，不是网页或 M3U 频道清单。另行保留能够证明商业 App 原生播放、地域及署名限制的资料；客户端字段检查不能替代人工授权核实。
- 有地域限制但客户端不能落实准入控制的来源，不得启用推荐。
- lastCheckedAt / lastResponseFailed 仅表示响应检查，不表示完成许可核实，也不表示 AVPlayer 实际播放成功。

## 更新和撤回

1. 执行 `python3 apps/yixiu-tools/iptv/validate_catalog.py apps/yixiu-tools/iptv/catalog-v1.json`。
2. 内容变化必须增加 revision，并更新 publishedAt / expiresAt。不要复用相同版本发布不同内容。
3. 验证 HTTPS、JSON MIME、字节一致和 ETag / 304；保留上一版可回退文件。发布使用同目录临时文件 + 原子替换，不覆盖其他网站文件。
4. channels=[] 或 enabled=false 可撤回频道。客户端离线无法立即收到撤回；它在操作时重新检查目录和许可时效。过期公共目录仍可查看资料，但不再提供播放/保存。
5. 客户端最多每小时自动检查一次，支持用户手动检查；主源失败尝试备用源。仅校验成功且缓存落盘后替换目录，失败保留旧目录。
6. 20000 个公共条目 / 8MB 上限；用户来源另有 200 个 / 20000 条索引安全上限。这不是承诺已验证此规模 UI 性能。

未来迁移 OSS/CDN 时，复用相同路径、HTTPS 和模型，配置 App 的 `IPTVCatalogPrimaryURL`。本轮未创建付费资源，未获取或保存云访问密钥。
