/* Modern Shang-inspired turtle-plastron interaction. Omen, text and geometry
 * are deterministic views of the shared time chart, not ancient crack rules.
 * No animal materials, remote services, persistence or personal-data uploads.
 */
(function(root,factory){
  const X=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Xuanqi;
  const api=factory(X);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else{root.TurtleOracle=api;api.mount();}
})(typeof window!=='undefined'?window:globalThis,function(X){
  'use strict';
  const OMENS=[
    {name:'舒兆',verdict:'可试',shape:'主纹舒展 · 二支分出',classical:'兆舒。占曰：可试。所谋宜渐，毋遽求成；先行其小，以观其应。',meaning:'这次模拟呈现舒展的兆纹，本站将它拟作“可试”。你可以把问题拆成一个小步骤，先行动、再观察实际反馈；它并不表示事情一定顺利。',paths:[[[500,580],[503,529],[492,488],[506,449],[497,404],[509,356],[506,297]],[[503,529],[547,511],[587,477],[642,458]],[[506,449],[468,422],[428,409],[399,376]]]},
    {name:'敛兆',verdict:'宜守',shape:'主纹收敛 · 短支内聚',classical:'兆敛。占曰：宜守。毋躁于行，先固其本；备其所缺，而后有为。',meaning:'这次模拟呈现收敛的兆纹，本站将它拟作“宜守”。可以借此检查准备是否充分、边界是否清楚，先处理欠缺的条件，再决定下一步。',paths:[[[500,580],[491,550],[502,522],[490,489],[498,456],[496,435],[494,416]],[[502,522],[465,526],[441,550],[430,569]],[[490,489],[526,495],[550,519],[557,544]]]},
    {name:'交兆',verdict:'未明',shape:'主纹曲折 · 旁支交错',classical:'兆交。占曰：未明。两端未定，毋以意决；审其虚实，俟证而行。',meaning:'这次模拟呈现交错的兆纹，本站将它拟作“未明”。这不代表坏事将发生，只适合提醒自己：分清事实和猜测，找出还缺少哪条信息。',paths:[[[500,580],[482,539],[504,497],[491,456],[519,411],[507,369],[537,331]],[[482,539],[439,515],[411,473],[386,458]],[[504,497],[545,478],[575,487],[621,460]],[[491,456],[461,436],[436,453],[414,428]],[[519,411],[554,393],[579,363]]]}
  ];
  const sensitive=/疾病|胸痛|癌|怀孕|死亡|寿命|治疗|药物|诊断|自杀|自残|股票|投资|基金|贷款|诉讼|官司|手术/;
  // These visualization mappings are authored for this site and disclosed in the UI.
  const PALACE_DIRECTION=[1,-1,1,-1,1,0];
  const RELATION_DIRECTION={same:1,supported:1,outflow:-1,pressure:-1,control:0};
  const DIRECTION_TEXT={'1':'舒向','-1':'敛向','0':'未定'};
  const LINE_NAMES=['初','二','三','四','五','上'];
  function validateQuestion(question){if(typeof question!=='string'||!question.trim()||question.trim().length>300)throw new Error('请写下 1–300 字的一件事，再执火灼甲。');return question.trim();}
  function summarize(chart){
    const small=PALACE_DIRECTION[chart.small.index],relations=chart.six.lessons.map(l=>RELATION_DIRECTION[l.relation]);
    const balance=relations.reduce((sum,n)=>sum+n,0),six=Math.sign(balance),mei=RELATION_DIRECTION[chart.meihua.relation];
    const directions=[small,six,mei],open=directions.filter(n=>n===1).length,closed=directions.filter(n=>n===-1).length;
    const omenIndex=open>=2&&closed===0?0:closed>=2&&open===0?1:2;
    const reason=omenIndex===0?'至少两法取舒向，且无敛向，故合为舒兆。':omenIndex===1?'至少两法取敛向，且无舒向，故合为敛兆。':open&&closed?'三法取向相左，故合为交兆，保留分歧。':'同向依据不足两法，故合为交兆，暂留未定。';
    const lessonCounts={open:relations.filter(n=>n===1).length,closed:relations.filter(n=>n===-1).length,neutral:relations.filter(n=>n===0).length};
    return {small,six,mei,balance,lessonCounts,open,closed,neutral:3-open-closed,omenIndex,reason};
  }
  function diagramPaths(omenIndex,balance,moving){
    const main=OMENS[omenIndex].paths[0],spread=1+balance*.05;
    // Four-lesson balance changes branch spread; the moving line marks one of
    // six bottom-to-top main segments. No seed, hash, jitter or entropy source.
    const points=OMENS[omenIndex].paths.map((path,i)=>path.map(([x,y])=>[i?Math.round((path[0][0]+(x-path[0][0])*spread)*10)/10:x,y]));
    const a=main[moving-1],b=main[moving];
    return {paths:points.map(path=>path.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ')),marker:{x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,line:moving},spread};
  }
  function linkedChart(question,mainCast){return mainCast&&mainCast.question===question.trim()?mainCast.chart:null;}
  function makeOmen(question,chart,source='current'){
    question=validateQuestion(question);
    const agreement=summarize(chart),omenIndex=agreement.omenIndex,omen=OMENS[omenIndex],mei=chart.meihua,day=chart.six.day,hour=chart.hour;
    const diagram=diagramPaths(omenIndex,agreement.balance,mei.moving),count=agreement.lessonCounts;
    const basis=[
      {method:'小六壬',value:chart.small.name,direction:agreement.small,detail:`农历${chart.month}月${chart.day}日 · ${hour}时；${chart.small.monthPalace} → ${chart.small.dayPalace} → ${chart.small.name}。`},
      {method:'六壬四课',value:`${chart.six.general}将加${hour}时`,direction:agreement.six,detail:`${chart.six.lessons.map((l,i)=>`${['一','二','三','四'][i]}课 ${l.upper}/${l.lower} ${X.RELATION_TEXT[l.relation]}`).join('；')}。舒向${count.open}课、敛向${count.closed}课、未定${count.neutral}课，以多者定向。`},
      {method:'梅花易数',value:`${mei.original.longName} → ${mei.changed.longName}`,direction:agreement.mei,detail:`${LINE_NAMES[mei.moving-1]}爻动 · 体${mei.body.name}${mei.body.element} / 用${mei.use.name}${mei.use.element} · ${X.MEI_COPY[mei.relation].name}。`}
    ].map(b=>({...b,directionText:DIRECTION_TEXT[b.direction]}));
    const plain=question.replace(/^贞\s*[：:]\s*/,'').replace(/[？?。\s]+$/,'');
    const classical=`小壬得${chart.small.name}，四课${{'1':'生和为多','-1':'克泄为多','0':'取象未定'}[agreement.six]}。卦得${mei.original.name}，${LINE_NAMES[mei.moving-1]}爻动，之${mei.changed.name}。${omen.classical}`;
    const translation=`小六壬落${chart.small.name}，取${basis[0].directionText}；六壬四课合取${basis[1].directionText}；梅花${X.MEI_COPY[mei.relation].name}，取${basis[2].directionText}。${agreement.reason}${omen.meaning}`;
    return {question,beijing:chart.beijing,timestamp:chart.timestamp,day,hour,source,chart,agreement,basis,omenIndex,name:omen.name,verdict:omen.verdict,shape:omen.shape,...diagram,preface:`${day}卜，于${hour}时。`,charge:`贞：${plain||question}？`,judgment:sensitive.test(question)?'此问关乎身家，卜不决之。审实求证，毋以兆定。':classical,translation:sensitive.test(question)?'这件事需要可核实的信息与相应专业意见。这里仅记录问题、展示由课盘映射的兆纹，不用卜兆作诊断、投资判断或事件预测。':translation,verification:'未验。俟事后书之。'};
  }
  function draw(question,now=new Date(),mainCast=null){
    question=validateQuestion(question);
    if(!X?.calculateTimeChart)throw new Error('历法尚未载入，请刷新后重试。');
    const shared=linkedChart(question,mainCast);
    return makeOmen(question,shared||X.calculateTimeChart(now),shared?'main':'current');
  }
  function mount(){
    if(typeof document==='undefined')return;
    const $=id=>document.getElementById(id),form=$('turtle-form');if(!form)return;
    const stage=$('turtle-stage'),question=$('turtle-question'),svg=$('turtle-cracks'),record=$('turtle-record');let busy=false,lastResult=null;
    const reduceMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    function showError(message){$('turtle-error').textContent=message;$('turtle-error').hidden=!message;}
    function updateSource(){const shared=linkedChart(question.value,window.XuanqiLastCast),message=shared?`将沿用上方课盘 · ${shared.beijing} 北京时间。课盘不变，兆纹不变。`:'点击时以当前北京时间起课，与上方共用三法算法。相同课盘得到相同兆纹。';if($('turtle-chart-source').textContent!==message)$('turtle-chart-source').textContent=message;}
    function step(n){[1,2,3].forEach(i=>{const el=$('turtle-step-'+i);if(i===n)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');el.classList.toggle('done',i<n);});}
    function setBusy(value){busy=value;form.querySelectorAll('button,textarea').forEach(el=>el.disabled=value);$('turtle-new-question').disabled=value;stage.setAttribute('aria-busy',String(value));}
    function crackDiagram(r){svg.replaceChildren();svg.setAttribute('aria-label',`${r.name}的课盘兆纹：${r.shape}；自下而上第${r.marker.line}节对应梅花动爻。`);r.paths.forEach((d,i)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('pathLength','1');p.setAttribute('class',i?'crack-branch':'crack-main');p.style.animationDelay=`${i*.17}s`;svg.appendChild(p);});const mark=document.createElementNS('http://www.w3.org/2000/svg','circle');Object.entries({cx:r.marker.x,cy:r.marker.y,r:9,class:'crack-marker'}).forEach(([key,value])=>mark.setAttribute(key,String(value)));svg.appendChild(mark);stage.classList.add('cracking');}
    function render(r){
      const fields={'turtle-cast-time':`${r.beijing} · 北京时间`,'turtle-preface':r.preface,'turtle-charge':r.charge,'turtle-judgment':r.judgment,'turtle-translation':r.translation,'turtle-omen-name':`${r.name} · ${r.verdict}`,'turtle-omen-short':r.shape,'turtle-image-state':'课有所本 · 兆有所依','turtle-stage-caption':`${r.shape} · 红圈应第${r.marker.line}动爻`,'turtle-chart-kind':r.source==='main'?'沿用上方同一课盘':'本次北京时间课盘','turtle-consensus':`三法合参：舒向 ${r.agreement.open} · 敛向 ${r.agreement.closed} · 未定 ${r.agreement.neutral}。${r.agreement.reason}`,'turtle-diagram-key':`纹据课成：旁支随四课生克收展；主纹六节自下而上，红圈标示第${r.marker.line}节，对应${LINE_NAMES[r.marker.line-1]}爻动。`};
      Object.entries(fields).forEach(([id,text])=>$(id).textContent=text);
      $('turtle-basis-grid').replaceChildren(...r.basis.map(b=>{const card=document.createElement('div');card.className='turtle-basis-card';const label=document.createElement('h5');label.textContent=b.method;const value=document.createElement('strong');value.textContent=b.value;const direction=document.createElement('span');direction.className='turtle-direction';direction.dataset.direction=String(b.direction);direction.textContent=b.directionText;const detail=document.createElement('p');detail.textContent=b.detail;card.append(label,value,direction,detail);return card;}));
      record.hidden=false;$('turtle-omen-summary').hidden=false;step(3);lastResult=r;
    }
    async function cast(value){
      if(busy)throw new Error('此甲正在受火，请待本次兆成。');
      const r=draw(value,new Date(),window.XuanqiLastCast); // Capture one chart before the animation; invalid input preserves the previous result.
      setBusy(true);showError('');question.value=r.question;record.hidden=true;$('turtle-omen-summary').hidden=true;svg.replaceChildren();stage.classList.remove('cracking','cast-complete');stage.classList.add('heating');step(2);
      updateSource();$('turtle-status').textContent='课盘已定，炙火显兆……';$('turtle-button-label').textContent='灼 甲 中';$('turtle-image-state').textContent='甲受火 · 兆将生';$('turtle-stage-caption').textContent='以课为据，以纹成象。';
      try{if(!reduceMotion())await pause(380);crackDiagram(r);$('turtle-status').textContent='兆纹渐显，正在成辞……';if(!reduceMotion())await pause(1550);render(r);stage.classList.remove('heating');stage.classList.add('cast-complete');$('turtle-status').textContent=`${r.name}已成，卜辞与白话释义在下方。`;record.scrollIntoView?.({behavior:reduceMotion()?'instant':'smooth',block:'nearest'});record.focus({preventScroll:true});return r;}
      finally{setBusy(false);stage.classList.remove('heating');$('turtle-button-label').textContent='再 灼 此 问';updateSource();}
    }
    function reset(){if(busy)return;form.reset();showError('');record.hidden=true;$('turtle-omen-summary').hidden=true;svg.replaceChildren();svg.setAttribute('aria-label','尚未生成兆纹');stage.classList.remove('heating','cracking','cast-complete');step(1);lastResult=null;$('turtle-status').textContent='待问。问题仅在本页处理，不上传、不保存。';$('turtle-image-state').textContent='甲未灼 · 事未问';$('turtle-stage-caption').textContent='心中所问，书于右侧；执火取兆。';$('turtle-button-label').textContent='执 火 灼 甲';updateSource();question.focus();}
    form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;try{await cast(question.value);}catch(err){showError(err.message||'未能成兆，请稍后再试。');}});
    $('turtle-new-question').addEventListener('click',reset);
    document.querySelectorAll('[data-turtle-prompt]').forEach(button=>button.addEventListener('click',()=>{if(busy)return;question.value=button.dataset.turtlePrompt;showError('');updateSource();question.focus();}));
    $('turtle-use-question').addEventListener('click',()=>{if(busy)return;const above=$('question').value.trim();if(!above){showError('上方尚未写下问题，也可以直接在这里填写。');question.focus();return;}if(above.length>300){showError('请将问题控制在 300 字以内。');return;}question.value=above;showError('');updateSource();question.focus();});
    question.addEventListener('input',updateSource);window.addEventListener('xuanqi:cast',updateSource);updateSource();
    if(!X){showError('历法尚未载入，请刷新后重试。');$('turtle-cast').disabled=true;}
    const context=document.modelContext;
    if(context?.registerTool){const lifetime=new AbortController();window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});try{Promise.resolve(context.registerTool({name:'cast_turtle_oracle',title:'龟甲卜问',description:'按小六壬落宫、六壬四课与梅花体用的固定合参规则呈现龟甲兆纹、文言卜辞与白话释义。同问沿用上方已起课盘，否则用当前北京时间起课。仅供娱乐，属于现代课盘可视化。',inputSchema:{type:'object',properties:{question:{type:'string',minLength:1,maxLength:300}},required:['question'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},async execute(input){if(!input||typeof input!=='object')throw new Error('请提供一个问题。');const r=await cast(input.question);return {beijing:r.beijing,source:r.source,omen:r.name,verdict:r.verdict,basis:r.basis,reason:r.agreement.reason,movingLine:r.marker.line,preface:r.preface,charge:r.charge,judgment:r.judgment,translation:r.translation,verification:r.verification};}},{signal:lifetime.signal})).catch(()=>{});}catch{}}
    return {cast,reset,getResult:()=>lastResult};
  }
  return {OMENS,summarize,linkedChart,makeOmen,draw,diagramPaths,mount};
});
