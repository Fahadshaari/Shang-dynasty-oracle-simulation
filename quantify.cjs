// Numeric labels and rule counts, NOT estimated probabilities of real events.
const Turtle = require('../dist/turtle.js');

function toMetrics(chart) {
  const a = Turtle.summarize(chart);
  return {
    timestamp: chart.timestamp, beijing: chart.beijing,
    lunarMonth: chart.month, lunarDay: chart.day, hourNumber: chart.hourNumber,
    smallIndex: chart.small.index, smallName: chart.small.name, smallDirection: a.small,
    sixShift: chart.six.shift, sixBalance: a.balance, sixDirection: a.six,
    sixOpenLessons: a.lessonCounts.open, sixClosedLessons: a.lessonCounts.closed,
    sixNeutralLessons: a.lessonCounts.neutral,
    meiUpper: chart.meihua.original.upper, meiLower: chart.meihua.original.lower,
    meiMoving: chart.meihua.moving, meiRelation: chart.meihua.relation, meiDirection: a.mei,
    openMethods: a.open, closedMethods: a.closed, neutralMethods: a.neutral,
    omenIndex: a.omenIndex, omenName: Turtle.OMENS[a.omenIndex].name,
    branchSpread: 1 + 0.05 * a.balance
  };
}
module.exports = { toMetrics };
