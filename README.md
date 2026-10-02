# 玄契 · 殷风问卜

殷商暗黑风格的传统术数娱乐网站：红、白、黑为主色，青铜圆目露齿面具、龟腹甲与灼卜动画；问事后同时呈现文言卜辞、白话释义和可检查的计算依据。

这是截至 **2026-10-02** 的完整可运行项目，包含当前网站的全部 HTML、CSS、JavaScript、图片、历法库，以及新增的中文技术文档、数值导出示例和 GitHub Pages 发布配置。浏览网站不需要登录 GPT，也不需要 OpenAI API Key。

## 包含什么

| 模块 | 已有计算与输出 | 实现位置 |
| --- | --- | --- |
| 北京时间 | 自动读取设备当前时间，固定转换 UTC+8；点击起课时固定本次时刻 | `dist/engine.js`、`dist/app.js` |
| 小六壬 | 农历月、日、时顺数六宫，展示落宫和算式 | `smallRen()` |
| 六壬四课 | 中气月将、月将加时、天地盘、十干寄宫、四课五行生克 | `sixRen()` |
| 梅花易数 | 年月日时取数、本卦、变卦、动爻、体用生克 | `meihua()` |
| 四柱 | 出生时间及 IANA 时区换算、年/月/日/时柱、五行与纳音 | `birthChart()` |
| 龟甲合参 | 三法固定映射成舒兆/敛兆/交兆；四课决定旁支收展，动爻决定红圈位置 | `dist/turtle.js` |
| 可视化 | 六宫选中态、四课上下排列、天地盘对照、六爻图、四柱卡、SVG 兆纹和火点动画 | `dist/app.js`、`dist/turtle.js`、两份 CSS |
| 量化导出 | 方向编码、四课净和、三法计数、卦数、动爻、裂纹伸缩系数；支持 CSV | `examples/quantify.cjs`、`export-series.cjs` |

**范围说明：**六壬目前是天地盘与四课，未实现三传、十二天将及九宗门。龟甲映射为本站公开的现代合参规则，并非复原的殷商断兆法。数值属于规则编码与几何参数，不是事件成功率或经验证的预测模型。

## 本地运行

安装 Node.js 22 或更新版本后，在本项目根目录运行：

```bash
npm start
```

打开 `http://127.0.0.1:4173`。无需 `npm install`，项目不依赖 npm 第三方包。

也可以在 `dist` 目录运行 `python3 -m http.server 4173`。直接打开 `dist/index.html` 可体验多数功能，但完整预览建议使用本地服务器。

## 上传 GitHub 并免费发布

1. 解压，进入 `xuanqi-github` 文件夹。
2. 在 GitHub 新建 **Public** 仓库，例如 `xuanqi-oracle`。
3. 将本文件夹内的全部内容放到仓库根目录，包含 `.github/workflows/pages.yml`。不要只上传 ZIP 文件，也不要再套一层同名文件夹。
4. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
5. 在 **Actions** 中运行 `Publish Xuanqi to GitHub Pages`；以后推送到 `main` 会自动发布。

免费公开仓库支持 GitHub Pages。发布后的常见地址格式是 `https://你的用户名.github.io/仓库名/`，实际地址以 GitHub Pages 页面显示为准。详见 [部署说明](docs/DEPLOYMENT.md)。

## 验证与取数

```bash
npm run check
npm test
node examples/calculate.cjs > result.json
node examples/export-series.cjs 2026-10-01T00:00:00Z 24 120 > series.csv
```

最后一条命令从指定 UTC 时刻起，每 120 分钟生成一行，共 24 行。CSV 可直接用 Excel、Python 或其他图表工具读取。问题与示例生辰都是演示输入。

## 文件导航

| 目录 / 文件 | 用途 |
| --- | --- |
| `dist/` | 可直接部署的网站全部文件 |
| `dist/assets/` | 两张艺术图片、完整历法代码和其 MIT 许可证 |
| `docs/ALGORITHMS.md` | 全部公式、编码、五行映射与龟兆决策 |
| `docs/VISUALIZATION.md` | 可视化实现、数据对应、动画与样式修改入口 |
| `docs/API.md` | 浏览器 / Node 调用方式、输入输出、关联课盘接口 |
| `docs/DEPLOYMENT.md` | GitHub 上传、免费 Pages 发布与常见问题 |
| `docs/PROJECT-NOTES.md` | 当前版本、依赖、边界、已做验证及后续修改入口 |
| `examples/` | 单次完整结果、批量数值导出及固定样例文件 |
| `scripts/` | 本地服务器与资源检查 |
| `tests/` | 可复算的历法、时区、联动与几何回归检查 |
| `.github/workflows/pages.yml` | GitHub Pages 自动发布 |
| `THIRD_PARTY_NOTICES.md` | 历法库与图片、字体来源说明 |

## 数据与许可

计算均在浏览器本地完成，问事与生辰不上传、不保存。唯一外部样式请求是 Google Fonts 字体；字体不可用时使用系统字体，计算不受影响。正文中的参考链接只在点击后访问。

历法库 `lunar-javascript` 使用 MIT 许可证，原文已保留。原创代码尚未指定对外开源许可证；`package.json` 标记为 `UNLICENSED`，你可在决定公开授权方式后添加自己的许可证。

## 技术与规则参考

- [GitHub Pages 官方工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [lunar-javascript](https://github.com/6tail/lunar-javascript)
- [《六壬大全》卷一](https://zh.wikisource.org/wiki/六壬大全_(四庫全書本)/卷01)
- [《梅花易数》卷一](https://ctext.org/wiki.pl?chapter=867487&if=gb)

本项目用于文化体验与娱乐，文言为现代拟作。
