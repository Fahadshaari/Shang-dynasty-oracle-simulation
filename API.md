# 代码接口与数据结构

## 浏览器加载

`index.html` 依次以 `defer` 加载：

1. `assets/lunar.js`：提供 `Solar` 等历法对象。
2. `engine.js`：提供 `window.Xuanqi`。
3. `app.js`：主表单、北京时间时钟与课盘渲染。
4. `turtle.js`：提供 `window.TurtleOracle` 并挂载龟甲交互。

`engine.js` 和 `turtle.js` 也导出 CommonJS，因此可在 Node 中直接 `require()`。

## 主问卜

```js
const X = require('../dist/engine.js');
const result = X.calculate({
  question: '所谋之事，其可成乎？',
  topic: 'general',
  birthDate: '2000-01-01',
  birthTime: '12:30',
  birthPlace: '上海',
  birthZone: 'Asia/Shanghai',
  unknownTime: false
}, new Date('2026-10-01T15:47:50Z'));
```

| 输入 | 约定 |
| --- | --- |
| `question` | 非空字符串，最多 300 字符 |
| `topic` | `general / study / career / love / travel` |
| `birthDate` | 当地公历 `YYYY-MM-DD`，1900–2100 年范围 |
| `birthTime` | 当地民用时间 `HH:mm`；时辰不详时可为空 |
| `birthPlace` | 非空地点文字，最多 100 字符 |
| `birthZone` | 明确的 IANA 时区，如 `Asia/Shanghai`、`America/New_York` |
| `unknownTime` | 布尔值 |
| 第二参数 `now` | 可选；默认当前 `new Date()`。固定它即可复算 |

API 以 `birthZone` 为实际换算依据，不会根据 `birthPlace` 自动查询时区。常见城市别名提示是在 `app.js` 的 UI 层完成；未知地点应由使用者核对时区。

主要返回字段：

```text
timestamp, beijing, lunar, month, day, yearNumber, hourNumber, hour, leap
small: monthIndex, dayIndex, index, name, monthPalace, dayPalace
six: day, stem, branch, host, general, generalName, qi, qiDate,
     hour, shift, heaven[12], lessons[4], relation
meihua: subtotal, total, moving,
        original{upper,lower,name,longName,bits[6]}, changed{...},
        body{name,nature,element,bits[3]}, use{...}, relation
birth: pillars[4], dayElement, instant, beijing, ambiguous, unknownTime
reading: classical, translation, practical, topic, rhythm, meiName, meiText
```

出生时辰明确时还返回 `birth.dayStem`；未知时辰时相关值不指定。细节可查看随附 `examples/sample-result.json`。

## 只计算时间课盘

```js
const chart = X.calculateTimeChart(new Date('2026-10-01T15:47:50Z'));
```

不需要生辰或问题。返回上述字段中除 `birth`、`reading` 外的部分。小六壬、六壬四课和梅花易数均在这一步计算。

## 龟甲接口

```js
const Turtle = require('../dist/turtle.js');
const time = new Date('2026-10-01T15:47:50Z');
const r1 = Turtle.draw('所谋之事，其可成乎？', time);
const r2 = Turtle.makeOmen('所谋之事，其可成乎？', X.calculateTimeChart(time));
```

- `draw(question, now?, mainCast?)`：验证问题，优先复用匹配的主问卜课盘，否则计算新时间课盘。
- `makeOmen(question, chart, source?)`：使用已合法生成的课盘，构造全部龟兆输出；`source` 默认为 `current`。这是内部/开发接口，不负责校验任意手写课盘的全部字段。
- `summarize(chart)`：返回三法方向、四课净和、方向计数、兆类索引和理由。
- `diagramPaths(omenIndex, balance, moving)`：返回路径、红圈坐标及伸缩系数，参数来自合法合参结果。
- `linkedChart(question, mainCast)`：完全匹配去除首尾空格后的问题时返回历史课盘，否则返回空值。
- `mount()`：挂载当前 HTML 的龟卜 UI，返回 `cast/reset/getResult`。

`draw()` / `makeOmen()` 的主要输出：

```text
question, timestamp, beijing, day, hour, source, chart,
agreement{small,six,mei,balance,lessonCounts,open,closed,neutral,omenIndex,reason},
basis[3]{method,value,direction,directionText,detail},
omenIndex, name, verdict, shape,
paths[string], marker{x,y,line}, spread,
preface, charge, judgment, translation, verification
```

完整复用示例：

```js
const { birth, reading, ...chart } = result;
const r = Turtle.draw('所谋之事，其可成乎？', new Date(), {
  question: '所谋之事，其可成乎？',
  chart
});
// r.source === 'main'；r.timestamp 仍为原主问卜的 timestamp。
```

不要将不同问题或不同起课时间的计算部分拼接成一张课盘。

## 页面内存联动

主问卜 `render()` 设置 `window.XuanqiLastCast`，再派发 `xuanqi:cast` 事件。龟甲监听它以更新“沿用上方课盘”提示。所有状态仅在内存中，刷新后清空；没有 Cookie、LocalStorage、数据库或上传接口。

## 可选浏览器原生工具

仅当浏览器提供 `document.modelContext.registerTool` 时，页面注册 `cast_xuanqi_oracle` 和 `cast_turtle_oracle`。它们调用同一计算和渲染逻辑；普通浏览器没有这一能力时，表单仍照常工作。该接口不是 OpenAI API，也不要求 GPT 登录。
