# Freedom Tools

Freedom Tools 是一个静态应用展示站点，用于集中展示移动端应用、隐私政策、使用条款和技术支持页面。

## 当前应用

- 一休工具 / Yixiu Tools / 一休ツール：167 个工具、16 个分类，提供八种语言的应用介绍、完整工具目录、隐私政策及帮助与反馈（`apps/yixiu-tools/`）。App Store ID：6817578515，商店可用性以发布地区为准。工具介绍不展示价格或付费权益。

- Aquarium Log：暂未上线，提供产品主页、隐私政策和技术支持页面。
- Floating Clock Pro：已上线，提供产品主页、App Store 下载、隐私政策、使用条款和技术支持页面。
- 暗格 - 私密空间：暂未上线，提供产品主页、隐私政策、使用条款和技术支持页面。

## 本地预览

项目不依赖构建工具，使用任意静态文件服务器即可预览。例如：

```bash
python3 -m http.server 8000
```

然后打开 <http://localhost:8000/>。

## 目录结构

```text
index.html                 站点首页
assets/                    首页应用图标
apps/<app>/                各应用的产品页与政策页面
```

项目中的 App Store 状态和链接以首页及对应应用产品页为准。应用上线状态变化时，应同步更新相关入口，避免保留不可用下载链接。

## 一休工具多语言目录

支持简体中文、繁体中文、英语、日语、韩语、德语、法语、西班牙语。首页另有葡萄牙语和俄语摘要，详情页支持的语言以选择器为准。

`apps/yixiu-tools/content.js` 保存网站介绍及帮助文案；`catalog.js` 只包含工具名称、简介与分类，不包含价格或权益信息。更新 iOS 工具后，从网站根目录执行：

```bash
python3 scripts/export-yixiu-catalog.py ../ToolboxOne
```

该脚本只读取 iOS 工程的注册顺序和 String Catalog，不修改 iOS 源码。新增工具时应同步检查脚本中的实际工具与分类数量校验。
