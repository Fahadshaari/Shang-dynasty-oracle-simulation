# 可视化实现与修改入口

所有可视化都随项目提供源码，不依赖图片生成接口、在线 AI 模型、Canvas 库或图表付费服务。青铜面具和腹甲底图为本地 WebP；卦爻、天地盘、兆纹由 HTML/CSS/SVG 实时渲染。

## 数据对应关系

| 画面 | 计算数据 | 渲染位置 | 表达方式 |
| --- | --- | --- | --- |
| 六宫 | `result.small.index/name` | `app.js → render()` | 六个宫位中给命中项加 `selected` 类 |
| 六壬四课 | `result.six.lessons` | `app.js → render()` | 每课上神在上、下神在下，附生克关系 |
| 天地盘 | `result.six.heaven`、`X.ZHI` | `#calculation-details` | 十二列天盘/地盘对照表 |
| 本卦与变卦 | `meihua.original/changed.bits` | `app.js → hexView()` | 阳爻一条、阴爻两段；本卦动爻加色 |
| 四柱 | `result.birth.pillars` | `#birth-chart` | 年月日时四卡及五行、纳音 |
| 龟甲兆类 | `TurtleOracle.summarize(chart)` | `turtle.js → render()` | 舒、敛、交及三个判兆依据卡片 |
| 兆纹 | `diagramPaths()` 的 `paths` | `crackDiagram()` | SVG 折线，主纹较粗、旁支较细 |
| 动爻 | `diagramPaths()` 的 `marker` | `crackDiagram()` | 主纹指定段中点的红圈 |
| 灼甲 | `cast()` 的状态 | `turtle.css` | 火点、裂纹描线、冷却颜色变化 |

## 六爻图的方向

计算数组中的 `bits[0]` 是最下方初爻，`bits[5]` 是最上方上爻。HTML 按从上至下排列，所以 `hexView()` 渲染前会将数组反转：

```js
[...hex.bits].reverse().map((bit, i) => {
  const isMoving = moving === 6 - i;
  // bit=1: 一个 i 元素，实线；bit=0: 两个 i 元素，中间留空。
});
```

修改视觉样式时保留这个顺序，避免卦图上下颠倒。

## 兆纹从哪里来

`OMENS[0/1/2].paths` 保存完整模板坐标，三个兆类各有一条主纹与若干旁支。每条路径是 `[x,y]` 点数组；主纹的七个点构成六段。规则生成输出后才进入 SVG，不是随机抽取一张裂纹图片。

```js
const chart = Xuanqi.calculateTimeChart(new Date('2026-10-01T15:47:50Z'));
const omen = TurtleOracle.makeOmen('所谋之事，其可成乎？', chart);
// omen.paths: ['M500 580 L...', ...]
// omen.marker: {x, y, line: 1..6}
// omen.spread: 0.8..1.2
```

向 `<svg viewBox="0 0 1000 1000">` 依次添加：

```js
const NS = 'http://www.w3.org/2000/svg';
for (const d of omen.paths) {
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#42231c');
  svg.appendChild(path);
}
const marker = document.createElementNS(NS, 'circle');
marker.setAttribute('cx', omen.marker.x);
marker.setAttribute('cy', omen.marker.y);
marker.setAttribute('r', '9');
marker.setAttribute('fill', '#d84424');
svg.appendChild(marker);
```

实际页面的 `crackDiagram()` 另加主/旁支类名、描边动画、延迟及无障碍说明。修改几何时应保证旁支首点仍与主纹上的某一点相接；保留主纹七个点，才能正确对应六个动爻位置。

## 动画状态

`cast()` 首先完成输入验证、固定时间及全部计算，然后开始动画：

1. `heating`：点亮甲上的火点，暂时禁用输入和重复提交。
2. 约 380ms 后添加兆纹，CSS `stroke-dashoffset` 从 1 过渡到 0。
3. 路径按序相差约 170ms 显现；描边由朱红冷却为深棕。
4. 再等待约 1550ms，展示判辞、翻译和三法依据。
5. 结束后解除禁用。动画时间不参与计算。

系统设置 `prefers-reduced-motion: reduce` 时跳过 JavaScript 等待和相关 CSS 动画。页面仍展示同一计算结果。

## 美术、样式与布局

- `dist/style.css`：主站色彩、字体、青铜面具区域、主问卜和卦图；文件开头的 CSS 变量控制整体配色。
- `dist/turtle.css`：龟甲区、火点、SVG、判兆卡和手机布局。
- `dist/assets/ritual-roundeyes.webp`：圆眼、露齿、卷角的青铜面具主视觉。
- `dist/assets/turtle-plastron.webp`：带透明背景的浅色龟腹甲底图。
- `dist/index.html`：所有表单、可视区域、说明、标签、参考链接和脚本加载次序。

手机版会将龟甲/输入双栏和依据卡片改为单栏。红圈在 SVG 内随腹甲一起缩放，不能改成固定页面像素定位。

## 文案与交互

文言和白话为规则化模板。主问卜的模板在 `engine.js` 的 `PALACE_COPY`、`MEI_COPY`、`SIX_COPY`、`ACTIONS` 和 `reading()`；龟卜的模板在 `turtle.js` 的 `OMENS`、`makeOmen()`。

用户问题通过 `textContent` 写入龟卜页面；主问卜对必要的 HTML 字符插值转义。不要把用户原始问题拼入 `innerHTML`。

## 需要额外统计图时

`examples/export-series.cjs` 已提供批量数值。可以据此做六宫类别时间线、四课方向数量条形图、八卦矩阵、动爻位置分布。当前线上界面没有雷达运势分数、吉凶百分比或概率曲线；那些不是现有算法的输出。
