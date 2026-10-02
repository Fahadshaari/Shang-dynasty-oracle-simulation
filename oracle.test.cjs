const test = require('node:test');
const assert = require('node:assert/strict');
const X = require('../dist/engine.js');
const Turtle = require('../dist/turtle.js');
const { toMetrics } = require('../examples/quantify.cjs');

const question = '所谋之事，其可成乎？';
const instant = new Date('2026-10-01T15:47:50Z');
const input = { question, topic:'general', birthDate:'2000-01-01', birthTime:'12:30', birthPlace:'上海', birthZone:'Asia/Shanghai', unknownTime:false };

test('固定时刻的历法和传统示例可复算', () => {
  const c = X.calculateTimeChart(instant);
  assert.equal(c.beijing, '2026-10-01 23:47:50');
  assert.equal(c.month, 8); assert.equal(c.day, 21);
  assert.equal(c.small.name, '赤口'); assert.equal(c.six.general, '辰');
  assert.equal(c.meihua.original.longName, '雷风恒');
  assert.equal(c.meihua.changed.longName, '雷天大壮');
  const traditional = X.meihua(5, 12, 17, 9);
  assert.equal(traditional.original.longName, '泽火革');
  assert.equal(traditional.moving, 1);
  assert.equal(traditional.changed.longName, '泽山咸');
});

test('北京时间午夜与时辰交界会更新课盘', () => {
  const before = X.calculateTimeChart(new Date('2026-10-01T15:59:59Z'));
  const midnight = X.calculateTimeChart(new Date('2026-10-01T16:00:00Z'));
  const nextHour = X.calculateTimeChart(new Date('2026-10-01T17:00:00Z'));
  assert.equal(before.day, 21); assert.equal(midnight.day, 22);
  assert.equal(midnight.hour, '子'); assert.equal(nextHour.hour, '丑');
  assert.notDeepEqual(midnight.small, nextHour.small);
});

test('出生地时区遵循冬夏时间、空档与重复小时', () => {
  assert.equal(X.localToInstant('2000-01-01','12:00','America/New_York').instant.toISOString(), '2000-01-01T17:00:00.000Z');
  assert.equal(X.localToInstant('2000-07-01','12:00','America/New_York').instant.toISOString(), '2000-07-01T16:00:00.000Z');
  assert.throws(() => X.localToInstant('2026-03-08','02:30','America/New_York'), /空档/);
  const repeated = X.localToInstant('2026-11-01','01:30','America/New_York');
  assert.equal(repeated.ambiguous, true);
  assert.equal(repeated.instant.toISOString(), '2026-11-01T05:30:00.000Z');
});

test('主问卜与龟甲共享同一课盘，沿用后不受新时钟影响', () => {
  const { birth, reading, ...chart } = X.calculate(input, instant);
  assert.deepEqual(chart, X.calculateTimeChart(instant));
  const original = Turtle.draw(question, instant);
  const later = new Date('2026-10-02T05:22:00Z');
  const shared = Turtle.draw(question, later, { question, chart });
  assert.equal(shared.source, 'main'); assert.equal(shared.timestamp, instant.toISOString());
  assert.deepEqual(shared.paths, original.paths); assert.equal(shared.judgment, original.judgment);
  const different = Turtle.draw('此行可往乎？', later, { question, chart });
  assert.equal(different.source, 'current'); assert.equal(different.timestamp, later.toISOString());
});

test('课盘不变时重复灼甲完全一致，秒数不是随机种子', () => {
  const first = Turtle.draw(question, instant);
  assert.deepEqual(first, Turtle.draw(question, instant));
  const later = Turtle.draw(question, new Date('2026-10-01T15:58:20Z'));
  for (const key of ['paths','marker','basis','judgment','omenIndex']) assert.deepEqual(first[key], later[key]);
});

test('三法分歧保留交兆，真实时间样本覆盖三个兆类', () => {
  const result = Turtle.draw(question, instant);
  assert.equal(result.name, '交兆');
  assert.equal(result.basis[0].direction, -1); assert.equal(result.basis[2].direction, 1);
  assert.match(result.agreement.reason, /相左/);
  const outcomes = new Set();
  for (let hour = 0; hour < 48; hour++) outcomes.add(Turtle.draw(question, new Date(Date.UTC(2026,9,1,hour))).name);
  assert.deepEqual([...outcomes].sort(), ['交兆','敛兆','舒兆'].sort());
});

test('同兆类中四课影响旁支；动爻控制主纹标记', () => {
  const base = Turtle.draw(question, new Date('2026-10-01T16:00:00Z'));
  const changed = structuredClone(base.chart);
  changed.six.lessons.forEach(lesson => { lesson.relation = 'same'; });
  const moreOpen = Turtle.makeOmen(question, changed);
  assert.equal(moreOpen.name, base.name); assert.notDeepEqual(moreOpen.paths, base.paths);
  const moved = structuredClone(base.chart); moved.meihua.moving = 3;
  const newMarker = Turtle.makeOmen(question, moved);
  assert.deepEqual(newMarker.paths, base.paths); assert.notDeepEqual(newMarker.marker, base.marker);
});

test('数值导出与页面计算一致，并遵守取值范围', () => {
  const chart = X.calculateTimeChart(instant), result = Turtle.makeOmen(question, chart), m = toMetrics(chart);
  assert.equal(m.omenName, result.name); assert.equal(m.branchSpread, result.spread);
  assert.equal(m.openMethods + m.closedMethods + m.neutralMethods, 3);
  assert.equal(m.sixOpenLessons + m.sixClosedLessons + m.sixNeutralLessons, 4);
  assert(m.branchSpread >= 0.8 && m.branchSpread <= 1.2);
  assert(m.meiMoving >= 1 && m.meiMoving <= 6);
});

test('时辰不详时不编造日柱、时柱或日主', () => {
  const r = X.calculate({ ...input, unknownTime:true, birthTime:'' }, instant);
  assert.equal(r.birth.dayElement, null);
  assert.equal(r.birth.pillars[2].value, '未定'); assert.equal(r.birth.pillars[3].value, '未定');
});

test('无效日期、未来生辰、超长问题会被拒绝', () => {
  assert.throws(() => X.calculate(input, new Date('invalid')), /起课时间无效/);
  assert.throws(() => X.calculate({ ...input, birthDate:'2100-01-01' }, instant), /不能晚于/);
  assert.throws(() => X.localToInstant('2001-02-30','12:00','Asia/Shanghai'), /日期或时间无效/);
  assert.throws(() => Turtle.draw('问'.repeat(301), instant), /1–300/);
  assert.throws(() => Turtle.draw('', instant), /1–300/);
});
