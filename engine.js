/* 玄契 — deterministic traditional calendar calculations.
 * Calendar: lunar-javascript (MIT; bundled license in assets).
 * Six Ren scope: month-general, earth/heaven plates and four lessons only.
 * No random selection, no claim of empirical predictive validity.
 */
(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./assets/lunar.js').Solar:root.Solar);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Xuanqi=api;})(typeof window!=='undefined'?window:globalThis,function(Solar){
  'use strict';
  const ZHI=[...'子丑寅卯辰巳午未申酉戌亥'],GAN=[...'甲乙丙丁戊己庚辛壬癸'];
  const GAN_E=[...'木木火火土土金金水水'],ZHI_E=[...'水土木木土火火土金金土水'];
  const GENERATES={木:'火',火:'土',土:'金',金:'水',水:'木'},CONTROLS={木:'土',土:'水',水:'火',火:'金',金:'木'};
  const PALACES=['大安','留连','速喜','赤口','小吉','空亡'];
  const TRIGRAMS=[null,{name:'乾',nature:'天',element:'金',bits:[1,1,1]},{name:'兑',nature:'泽',element:'金',bits:[1,1,0]},{name:'离',nature:'火',element:'火',bits:[1,0,1]},{name:'震',nature:'雷',element:'木',bits:[1,0,0]},{name:'巽',nature:'风',element:'木',bits:[0,1,1]},{name:'坎',nature:'水',element:'水',bits:[0,1,0]},{name:'艮',nature:'山',element:'土',bits:[0,0,1]},{name:'坤',nature:'地',element:'土',bits:[0,0,0]}];
  // Rows = upper trigram, columns = lower trigram, in Early Heaven number order.
  const HEX_NAMES=[['乾','履','同人','无妄','姤','讼','遁','否'],['夬','兑','革','随','大过','困','咸','萃'],['大有','睽','离','噬嗑','鼎','未济','旅','晋'],['大壮','归妹','丰','震','恒','解','小过','豫'],['小畜','中孚','家人','益','巽','涣','渐','观'],['需','节','既济','屯','井','坎','蹇','比'],['大畜','损','贲','颐','蛊','蒙','艮','剥'],['泰','临','明夷','复','升','师','谦','坤']];
  const QI_GENERAL={冬至:1,大寒:0,雨水:11,春分:10,谷雨:9,小满:8,夏至:7,大暑:6,处暑:5,秋分:4,霜降:3,小雪:2};
  const GENERAL_NAMES=['神后','大吉','功曹','太冲','天罡','太乙','胜光','小吉','传送','从魁','河魁','登明'];
  const HOSTS=[2,4,5,7,5,7,8,10,11,1];
  const mod=(n,d)=>((n%d)+d)%d;
  const pad=n=>String(n).padStart(2,'0');
  function beijingParts(date){const d=new Date(date.getTime()+8*3600000);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate(),hour:d.getUTCHours(),minute:d.getUTCMinutes(),second:d.getUTCSeconds()};}
  function formatParts(p){return `${p.year}-${pad(p.month)}-${pad(p.day)} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;}
  function solarAt(instant){const p=beijingParts(instant);return Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,p.second);}
  function partsInZone(instant,zone){const f=new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});return Object.fromEntries(f.formatToParts(instant).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));}
  function wallMillis(p){return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second||0);}
  function localToInstant(date,time,zone){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw new Error('请填写完整的出生日期与时间。');
    const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number),parts={year,month,day,hour,minute,second:0},naive=wallMillis(parts),check=new Date(naive);
    if(year<1900||year>2100||check.getUTCFullYear()!==year||check.getUTCMonth()+1!==month||check.getUTCDate()!==day||hour>23||minute>59)throw new Error('出生日期或时间无效，请检查。');
    try{new Intl.DateTimeFormat('en',{timeZone:zone}).format(check);}catch{throw new Error('无法识别这个时区，请选择出生地时区或填写有效的 IANA 名称。');}
    const offsets=new Set();for(const h of [-36,-12,0,12,36]){const sample=new Date(naive+h*3600000);offsets.add(wallMillis(partsInZone(sample,zone))-sample.getTime());}
    const matches=[...offsets].map(offset=>naive-offset).filter(t=>wallMillis(partsInZone(new Date(t),zone))===naive).sort((a,b)=>a-b);
    if(!matches.length)throw new Error('这个当地时刻处于夏令时跳转造成的空档，或该日期在当地不存在，请核对出生记录。');
    return {instant:new Date(matches[0]),ambiguous:matches.length>1};
  }
  function element(char){return GAN.includes(char)?GAN_E[GAN.indexOf(char)]:ZHI_E[ZHI.indexOf(char)];}
  function relation(self,other){if(self===other)return 'same';if(GENERATES[other]===self)return 'supported';if(GENERATES[self]===other)return 'outflow';if(CONTROLS[other]===self)return 'pressure';return 'control';}
  const RELATION_TEXT={same:'比和',supported:'上生下',outflow:'下生上',pressure:'上克下',control:'下克上'};
  function smallRen(month,day,hourNumber){const m=mod(month-1,6),d=mod(m+day-1,6),h=mod(d+hourNumber-1,6);return {monthIndex:m,dayIndex:d,index:h,name:PALACES[h],monthPalace:PALACES[m],dayPalace:PALACES[d]};}
  function sixRen(lunar,hourIndex){
    const qi=lunar.getPrevQi(false),general=QI_GENERAL[qi.getName()];if(general===undefined)throw new Error('中气月将计算未完成，请重新起课。');
    const day=lunar.getDayInGanZhiExact2(),stem=GAN.indexOf(day[0]),branch=ZHI.indexOf(day[1]),shift=mod(general-hourIndex,12),heaven=ZHI.map((_,i)=>mod(i+shift,12));
    const one=heaven[HOSTS[stem]],two=heaven[one],three=heaven[branch],four=heaven[three];
    const lessons=[[day[0],ZHI[one]],[ZHI[one],ZHI[two]],[day[1],ZHI[three]],[ZHI[three],ZHI[four]]].map(([lower,upper])=>({lower,upper,relation:relation(element(lower),element(upper)),lowerElement:element(lower),upperElement:element(upper)}));
    return {day,stem,branch,host:ZHI[HOSTS[stem]],general:ZHI[general],generalName:GENERAL_NAMES[general],qi:qi.getName(),qiDate:qi.getSolar().toYmdHms(),hour:ZHI[hourIndex],shift,heaven:heaven.map(i=>ZHI[i]),lessons,relation:lessons[0].relation};
  }
  function hexagram(upper,lower){return {upper,lower,name:HEX_NAMES[upper-1][lower-1],longName:upper===lower?`${TRIGRAMS[upper].name}为${TRIGRAMS[upper].nature}`:`${TRIGRAMS[upper].nature}${TRIGRAMS[lower].nature}${HEX_NAMES[upper-1][lower-1]}`,bits:[...TRIGRAMS[lower].bits,...TRIGRAMS[upper].bits]};}
  function meihua(yearNumber,month,day,hourNumber){
    const subtotal=yearNumber+month+day,total=subtotal+hourNumber,upper=mod(subtotal-1,8)+1,lower=mod(total-1,8)+1,moving=mod(total-1,6)+1,original=hexagram(upper,lower),changedBits=[...original.bits];changedBits[moving-1]=1-changedBits[moving-1];
    const find=bits=>TRIGRAMS.findIndex(t=>t&&t.bits.join('')===bits.join(''));
    const changed=hexagram(find(changedBits.slice(3)),find(changedBits.slice(0,3))),body=moving<=3?TRIGRAMS[upper]:TRIGRAMS[lower],use=moving<=3?TRIGRAMS[lower]:TRIGRAMS[upper];
    return {subtotal,total,moving,original,changed,body,use,relation:relation(body.element,use.element)};
  }
  function getPillars(date){const b=solarAt(date).getLunar().getEightChar();b.setSect(2);return ['Year','Month','Day','Time'].map(key=>({label:{Year:'年柱',Month:'月柱',Day:'日柱',Time:'时柱'}[key],value:b['get'+key](),elements:b['get'+key+'WuXing'](),nayin:b['get'+key+'NaYin']()}));}
  function birthChart(input,now){
    if(input.unknownTime){
      const start=localToInstant(input.birthDate,'00:00',input.birthZone),end=localToInstant(input.birthDate,'23:59',input.birthZone);
      if(start.instant>now)throw new Error('出生日期不能晚于今天。');
      const a=getPillars(start.instant),b=getPillars(end.instant),pillars=a.map((p,i)=>i>=2||p.value!==b[i].value?{label:p.label,value:'未定',elements:'—',nayin:'时辰不详'}:p);
      return {pillars,dayElement:null,instant:null,beijing:'时辰不详，不指定换算后的出生时刻',ambiguous:false,unknownTime:true};
    }
    const resolved=localToInstant(input.birthDate,input.birthTime,input.birthZone);if(resolved.instant>now)throw new Error('出生时间不能晚于此刻。');
    const pillars=getPillars(resolved.instant);return {pillars,dayElement:element(pillars[2].value[0]),dayStem:pillars[2].value[0],instant:resolved.instant.toISOString(),beijing:formatParts(beijingParts(resolved.instant)),ambiguous:resolved.ambiguous,unknownTime:false};
  }
  const PALACE_COPY=[
    {classical:'象得大安，守正而行。根固于下，枝乃向明。',meaning:'大安取安定、渐进之象，可以把注意力放在稳定的节奏与已有基础上。',rhythm:'稳中求进'},
    {classical:'象得留连，往复未定。毋迫其成，先理其端。',meaning:'留连取停顿、反复之象。若事情尚未明朗，可先整理卡点，给沟通和准备留出余地。',rhythm:'缓而有序'},
    {classical:'象得速喜，风动有声。见机而作，毋失其衡。',meaning:'速喜取回应、行动之象。可以把已经准备好的小步骤付诸行动，及时确认反馈。',rhythm:'主动回应'},
    {classical:'象得赤口，言多易歧。敛锋明辨，和而不随。',meaning:'赤口在传统中关联言语与分歧，可作为提醒：说清事实和边界，避免把猜测当成结论。',rhythm:'慎言明辨'},
    {classical:'象得小吉，涓流成川。相与有助，积微而前。',meaning:'小吉取小成、协力之象。先完成一个可实现的小目标，适当向可信任的人寻求具体帮助。',rhythm:'积小而成'},
    {classical:'象得空亡，虚实未分。暂留余地，待证而行。',meaning:'空亡取未定、信息不足之象，并不意味着坏事会发生。先核对你掌握的信息，再决定是否投入。',rhythm:'留白待明'}
  ];
  const MEI_COPY={same:{name:'体用比和',classical:'体用相和，循序可为。',text:'梅花卦体用比和，意象上强调配合与连续性。'},supported:{name:'用生体',classical:'用来生体，善纳其助。',text:'梅花卦用生体，意象上适合借助现有资源与外部支持。'},outflow:{name:'体生用',classical:'体生于用，量力而施。',text:'梅花卦体生用，提醒你关注时间与精力的投入是否可持续。'},pressure:{name:'用克体',classical:'用来克体，审势而动。',text:'梅花卦用克体，可以借此检查外部限制，保留调整方案。'},control:{name:'体克用',classical:'体能制用，有度乃成。',text:'梅花卦体克用，意象上偏向主动处理问题，同时注意可控范围。'}};
  const SIX_COPY={same:'六壬第一课上下比和，可取内外协调之意。',supported:'六壬第一课上生下，可把外部帮助作为观察重点。',outflow:'六壬第一课下生上，可留意自己的付出与消耗。',pressure:'六壬第一课上克下，可先辨认规则或环境带来的压力。',control:'六壬第一课下克上，可思考主动争取时需要跨越的阻力。'};
  const ELEMENT_COPY={木:'如木舒枝，先立一小目标，再渐次展开。',火:'如火有光，把意图说清楚，也给热情留一点余地。',土:'如土承物，把计划落成一件具体、可完成的事。',金:'如金有度，厘清标准和边界，再作取舍。',水:'如水因势，先收集信息，再选择合适的路径。'};
  const ACTIONS={
    general:['把所问之事拆成一个今天就能完成的小步骤。','写下反复犹豫的一个原因，再找一条能验证它的信息。','选择一个已经准备好的行动，做完后观察真实反馈。','把事实、猜测和情绪分开写下，下一次表达只先谈事实。','向一个可信任的人提出一个具体、容易回答的问题。','列出尚未知道的三件事，先查清最关键的一件。'],
    study:['用一段固定时间复习最基础的概念，再独立做一道题。','找出一道反复出错的题，标出从哪一步开始不理解。','完成并提交已经准备好的练习，及时获取反馈。','把疑问写成一句具体的问题，再向老师或同学确认。','和同学各讲解一个知识点，检查自己是否真的理解。','先核对要求、截止日期和已知条件，再安排学习顺序。'],
    career:['整理一项已经完成的工作，把成果与下一步写清楚。','确认等待的是谁的回复、哪份材料，以及可跟进的时间。','把准备好的简历、方案或消息推进一步，记录真实回应。','沟通职责和期望时使用具体事例，先确认再承诺。','向合适的人寻求一次具体的反馈，先改善一个小环节。','查清岗位、项目或合作的实际条件，暂缓信息不足的承诺。'],
    love:['选择一件轻松的小事共同完成，观察相处时的真实感受。','给彼此一点空间，先辨认自己真正需要沟通的是什么。','用一句坦诚、没有施压的话表达心意，并尊重对方回应。','用“我的感受是……”代替指责，讨论一个具体分歧。','表达一次具体的感谢或关心，让关系回到日常互动中。','把对方明确说过的话与自己的猜测分开，不替别人决定心意。'],
    travel:['先确认日期、路线与住宿，保留充足的衔接时间。','核对尚未确认的环节，并准备一个可替换的行程。','处理已经确定的准备事项，以实时信息确认出行安排。','与同行者提前说清预算、节奏及各自的需求。','请熟悉目的地的人提供一条具体建议，再核实信息。','查清证件、交通和当地安排，信息不足时先保留弹性。']
  };
  function inferredTopic(question,selected){if(selected!=='general')return selected;if(/复习|学习|考试|学校|学业|作业|论文|成绩|课程|留学/.test(question))return 'study';if(/工作|面试|实习|事业|项目|求职|升职|录用|offer/i.test(question))return 'career';if(/感情|恋爱|男友|女友|伴侣|复合|喜欢我|婚姻|分手/.test(question))return 'love';if(/出行|旅行|旅游|回国|航班|签证|搬家/.test(question))return 'travel';return 'general';}
  function reading(result,input){const p=PALACE_COPY[result.small.index],m=MEI_COPY[result.meihua.relation],b=result.birth,topic=inferredTopic(input.question,input.topic);const delicate=/生病|疾病|胸痛|癌|怀孕|死亡|寿命|治疗|药物|诊断|股票|投资|基金|贷款|诉讼|官司|手术/.test(input.question);
    return {classical:`维${result.six.day}日，${result.hour}时，贞问所念。${p.classical}${m.classical}吉凶非命，进止在人。`,translation:`${p.meaning}${SIX_COPY[result.six.relation]}${m.text}${b.dayElement?`出生四柱的日主为${b.dayStem}${b.dayElement}，此处只借其五行意象作自我观照，不推定性格或命运。`: '出生时辰不详，日主参照留空。'}`,practical:delicate?'这类问题请以可核实的现实信息和相应专业意见为依据；本次课象不提供诊断、投资建议或事件结果预测。':`${ACTIONS[topic][result.small.index]}${b.dayElement?ELEMENT_COPY[b.dayElement]:''}`,topic,rhythm:p.rhythm,meiName:m.name,meiText:m.text};
  }
  // Both the main reading and turtle diagrams consume this exact time chart.
  function calculateTimeChart(now=new Date()){
    if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw new Error('起课时间无效。');
    const p=beijingParts(now);if(p.year<1900||p.year>2100)throw new Error('当前支持 1900–2100 年的起课时间，请检查设备时钟。');
    const lunar=solarAt(now).getLunar(),month=Math.abs(lunar.getMonth()),day=lunar.getDay(),hourIndex=Math.floor((p.hour+1)/2)%12,yearNumber=ZHI.indexOf(lunar.getYearZhi())+1;
    return {timestamp:now.toISOString(),beijing:formatParts(p),lunar:lunar.toString(),month,day,yearNumber,hourNumber:hourIndex+1,hour:ZHI[hourIndex],leap:lunar.getMonth()<0,small:smallRen(month,day,hourIndex+1),six:sixRen(lunar,hourIndex),meihua:meihua(yearNumber,month,day,hourIndex+1)};
  }
  function calculate(input,now=new Date()){
    if(!input||typeof input!=='object')throw new Error('请先填写问卜信息。');
    if(typeof input.question!=='string'||!input.question.trim()||input.question.length>300)throw new Error('请写下 1–300 字的问题。');
    if(typeof input.birthPlace!=='string'||!input.birthPlace.trim()||input.birthPlace.length>100)throw new Error('请填写出生地点。');
    if(!['general','study','career','love','travel'].includes(input.topic))throw new Error('请选择有效的问事类别。');
    const result={...calculateTimeChart(now),birth:birthChart(input,now)};result.reading=reading(result,input);return result;
  }
  return {calculate,calculateTimeChart,beijingParts,formatParts,solarAt,localToInstant,smallRen,meihua,sixRen,PALACES,TRIGRAMS,ZHI,RELATION_TEXT,ELEMENT_COPY,MEI_COPY};
});
