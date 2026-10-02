// Run: node examples/calculate.cjs
// The birth details below are fictional demonstration input.
const X = require('../dist/engine.js');
const Turtle = require('../dist/turtle.js');
const input = {
  question: '所谋之事，其可成乎？', topic: 'general',
  birthDate: '2000-01-01', birthTime: '12:30',
  birthPlace: '上海', birthZone: 'Asia/Shanghai', unknownTime: false
};
const result = X.calculate(input, new Date('2026-10-01T15:47:50Z'));
const { birth, reading, ...chart } = result;
// Even though the second call is later, the same question reuses the original chart.
const turtle = Turtle.draw(input.question, new Date('2026-10-02T05:22:00Z'), { question:input.question, chart });
console.log(JSON.stringify({ input, main:result, turtle }, null, 2));
