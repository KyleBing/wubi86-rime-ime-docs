# 玫枫五笔

基于 [rime-wubi86-jidian](https://github.com/KyleBing/rime-wubi86-jidian) 的说明和下载站，用 VitePress 构建。

| 页面 | 内容 |
| --- | --- |
| `docs/index.md` | 首页和打字示意 |
| `docs/macos.md` | macOS 输入法与 1.1.1 安装包 |
| `docs/ios.md` | iOS 键盘 |
| `docs/windows.md` | Windows 后续版本 |
| `docs/android.md` | Android 可能会做 |
| `docs/pain.md` | 各端都会有的造词、同步、标点和日期 |
| `docs/guide/` | 从 macOS 输入法仓库迁来的使用说明 |

```bash
npm install
npm run docs:dev
```

推到 `main` 后，GitHub Actions 会构建并部署到 GitHub Pages。

同步到线上网站：

```bash
./scripts/update_site.sh
```

脚本会构建站点并放到 `https://kylebing.cn/wubi/`，同时删掉旧的 `/var/www/html/wubi/macos`。

## 线上路径

五笔相关的东西都挂在 `kylebing.cn/wubi/` 下，按前缀区分：

| 地址 | 内容 |
| --- | --- |
| `https://kylebing.cn/wubi/` | 本站（VitePress，构建时 `DOCS_BASE=/wubi/`） |
| `https://kylebing.cn/wubi/portal/` | 五笔接口服务（`portal-wubi-go`，nginx 保留前缀反代） |
| `https://kylebing.cn/wubi/manager/` | 管理后台（hash 路由，注册页 `/wubi/manager/#/register`） |
| `https://kylebing.cn/wubi/macos/` | 旧的 macOS 说明站，已并入本站，部署脚本会删掉 |

客户端默认请求地址是 `https://kylebing.cn/wubi/portal/`；`/wubi/` 根路径留给本站，不要再用作接口前缀。

安装包和更新清单都不放在本站：所有下载内容只在各输入法仓库的 Releases 里，
页面上的链接直接指向 `releases/latest/download/...`。站点只托管说明文字和图片。
