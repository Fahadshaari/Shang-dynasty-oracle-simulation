# 放到 GitHub 与免费发布

此项目是静态网站，部署目录为 `dist`，没有后端、数据库、环境密钥或服务器构建步骤。

## 方案 A：GitHub Desktop 上传

1. 解压 ZIP，将里面的 `xuanqi-github` 文件夹作为项目根目录；根目录应能看到 `README.md`、`package.json`、`dist`、`docs` 等。
2. 用 GitHub Desktop 创建本地仓库，目录选这个文件夹；提交所有文件，然后 Publish repository。
3. 若要用 GitHub Free 的 Pages，将仓库设为 Public。
4. 仓库默认分支用 `main`；进入 Settings → Pages，将 Source 选为 GitHub Actions。
5. 在 Actions 页面找到 `Publish Xuanqi to GitHub Pages`，点击 Run workflow。发布成功后，从 Settings → Pages 获取真实网址。

## 方案 B：使用 Git 命令

先在 GitHub 创建空仓库，再在解压后的项目根目录执行。最后一行仓库 URL 请替换为你自己的：

```bash
git init -b main
git add .
git commit -m "Add Xuanqi oracle website and documented calculation engine"
git remote add origin https://github.com/YOUR_USERNAME/xuanqi-oracle.git
git push -u origin main
```

然后按方案 A 的第 4–5 步开启 Pages。Git 凭据使用你自己的 GitHub 登录流程，不需要在源码里放令牌。

## 方案 C：网页上传文件

GitHub 新建仓库后，Add file → Upload files，上传解压后的内容。应保持所有子目录结构，特别是 `.github/workflows/pages.yml`。如果文件选择器隐藏以点开头的目录，可用 GitHub 网页的 Create new file，输入 `.github/workflows/pages.yml`，复制本包内同名文件的内容。

不要只上传压缩包本身；不要把项目再嵌套一层 `xuanqi-github`，否则工作流找不到根目录的 `dist` 和 `scripts`。

## 发布工作流

`.github/workflows/pages.yml` 会在推送到 `main` 或手动触发时：

1. 检出仓库并设置 Node.js 24。
2. 检查静态资源、DOM 目标和 JavaScript 语法。
3. 运行算法和联动回归检查。
4. 将 `dist` 作为静态产物上传并发布到 GitHub Pages。

不需要安装 npm 依赖，不需要构建工具。`pages:write` 和 `id-token:write` 是 Pages 发布需要的仓库工作流权限，使用 GitHub 自动提供的凭据。

## 地址和子目录

普通项目通常位于 `https://YOUR_USERNAME.github.io/REPOSITORY/`。这里的名字只是格式示例，真实网址由你的账户和仓库决定。

本导出包已经把网页引用改为 `./style.css`、`./engine.js`、`./assets/...`。因此在 `/REPOSITORY/` 子路径下，图片和脚本仍从正确目录读取；也兼容其他主域名根目录托管。

## 其他静态托管

若以后迁移到 Netlify、Cloudflare Pages 或其他支持静态文件上传的服务，部署 `dist` 文件夹的**内容**即可。构建命令留空；发布目录选 `dist`。平台账户、免费额度和地址以其当时提供的方案为准。

## 常见问题

| 现象 | 检查项 |
| --- | --- |
| GitHub 只显示源码 | 需要启用 Settings → Pages；源码仓库不是发布后网页 |
| 没有自动运行 | 工作流触发分支是 `main`；检查你的默认分支及工作流文件路径 |
| 提示 Pages 不可用 | 确认当前账户方案和仓库可见性；免费 Pages 使用 Public 仓库 |
| 图片 / JS 404 | 确认上传了全部 `dist/assets`，且 HTML 中本地引用仍为相对路径 |
| 部署了旧内容 | 查看最新一次 Actions 是否成功，刷新网页缓存 |
| 字体与截图略有差异 | Google Fonts 无法访问时会自动使用本机衬线字体 |
| “历法未载入” | 检查 `assets/lunar.js` 是否完整，以及脚本加载顺序 |

官方依据（整理于 2026-10-02）：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[setup-node](https://github.com/actions/setup-node)。本包已做本地验证；尚未在你的 GitHub 账户中实际运行发布流程。
