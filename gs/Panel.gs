// =====================================================================
//  МИРЗО МЕБЕЛ · БОШҚАРУВ ПАНЕЛИ — БИТТА Apps Script (ҳамма жадваллар учун)
//  Фақат ўқийди, жадвалларга ҲЕЧ НАРСА ЁЗМАЙДИ.
//  Deploy: Развернуть → Новое развертывание → Веб-приложение · Выполнять от имени: Я · Доступ: Все
//  Сўровлар: ?amal=ishlab (Производство) | moliya (Финанс) | sklad (Склад) | baza (бўш — Сотув йўқ)
//            ?amal=tekshir · ?amal=ustunlar · &yangi=1 (кешсиз)
// =====================================================================
var VERSIYA = '1.1';            // ҲАР ЎЗГАРИШДА ОШИРИНГ — кеш калити шунга боғлиқ (акс ҳолда 10 дақиқа эски жавоб қайтади)
var TZ_JADVAL = '';             // бўш = биринчи жадвалнинг вақт зонаси
var SOZ, XARITA, TAYANCH;       // жорий бўлим (tanla() қўяди)

// =====================================================================
//  0) СОТУВ (?amal=baza) — Мирзо мебелда сотув жадвали йўқ.
//     Панел ядроси шу жавобни кутади, шунинг учун бўш (ҳеч нарса ўйлаб топилмайди).
// =====================================================================
var SOZ_BAZA = { JADVAL_ID:'', VARAQ:[], KESH_SONIYA:600 };
function bazaShart(){
  return {ok:true,versiya:VERSIYA,vaqt:hozir(),
    praktikumP:paket([],['sana','fio','menejer','rop','joy','davlat','manba','produkt','kelishuv','tolangan','qarz','kishi','kelmagan','tel'],['menejer','rop','joy','davlat','manba','produkt']),
    kouch:[],reja:{praktikum:[],kouch:[]},tadbirlar:[],
    tashxis:{versiya:VERSIYA,izoh:'Сотув жадвали йўқ — бўлим ўчирилган'}};
}

// =====================================================================
//  1) ПРОИЗВОДСТВО  (?amal=ishlab) — «Мирзо Мебел Производство» жадвали
// =====================================================================
var SOZ_ISHLAB = {
  // ⚠ Жадвал ҳаволасини брузердан ТЎЛИҚ нусхалаб шу ерга қўйинг (скриншотдан ўқилган ID нотўғри бўлиши мумкин: I / l)
  JADVAL_ID: 'https://docs.google.com/spreadsheets/d/1QUfM8nqhGVlHlvT9887_-YprNvM_tgjeNkWhWNL-meE/edit',
  VARAQ: ['Производство','Производства','Ишлаб чиқариш'],
  TASHLA: /^(план|plan|режа|инфо|info)$/i,  KESH_SONIYA: 600
};
var XARITA_ISHLAB = {                  // калит: сарлавҳа вариантлари (аниқ мос → кейин «бошланиши» бўйича)
  sana:      ['Дата Монтаж','Дата монтажа','Дата','Сана'],
  tur:       ['Тип Заказ','Тип заказа','Тури'],
  montajnik: ['Монтажник','Монтажчи','Уста','Бригада'],
  nomi:      ['Имя Заказ','Имя заказа','Заказ'],
  tovar:     ['Тип товар','Тип товара','Товар'],
  soni:      ['шт/кв ?','шт/кв','шт/кв?','Сони','Количество'],
  qaerdan:   ['из?','из','Қаердан'],
  sklad:     ['Тип Склад','Склад'],
  izoh:      ['Коментарие','Комментарие','Коментарий','Комментарий','Коментария','Изоҳ']
};
var TAYANCH_ISHLAB = ['sana','nomi'];
var SONLI_ISHLAB = ['soni'];
var MATNLI_ISHLAB = ['tur','montajnik','nomi','tovar','qaerdan','sklad'];
function ishlabShart(){ return jadvalShart(SONLI_ISHLAB, MATNLI_ISHLAB); }

// =====================================================================
//  2) ФИНАНС  (?amal=moliya) — «Мирзо мебел финансе» жадвали
// =====================================================================
var SOZ_MOLIYA = {
  // ⚠ Жадвал ҳаволасини брузердан ТЎЛИҚ нусхалаб шу ерга қўйинг
  JADVAL_ID: 'https://docs.google.com/spreadsheets/d/1AK1iPCFendRxYuw5aU7FlvudP07F3IX8fCIbqbM4TOo/edit',
  VARAQ: ['Финансе','Финанс','Финансе орг','Лист1'],
  TASHLA: /база|статия|статья|стадия|инфо|info|лист6/i, VALYUTA:'UZS', KESH_SONIYA:600
};
var XARITA_MOLIYA = {
  sana:['Дата','Сана','Sana'], kassa:['Касса','Счет','Ҳисоб'], summa:['Сумма','Summa','Миқдор'],
  tip:['ТиП','Тип','Тури','Операция'], kirimU:['Кирим','Приход','Доход'], chiqimU:['Чиқим','Расход'],
  // Бу жадвалда битта «Стадия» устуни бор — у асосий модда сифатида олинади
  asosiy:['Основной стадия','Основная статья','Асосий стадия','Асосий','Основной','Стадия','Статья'], stadiya:['Подстадия','Кичик стадия'],
  kichik:['Подстатья'], izoh:['Коментария','Комментарий','Коментарие','Изоҳ','Изох'], valyuta:['Валюта','Valyuta']
};
var TAYANCH_MOLIYA = ['sana','summa'];
function tipAniq(t,summa){ t=norm(t);
  if(/приход|кирим|kirim|доход|тушум/.test(t)) return 'kirim';
  if(/расход|чиким|chiqim|харажат|xarajat/.test(t)) return 'chiqim';
  if(/перевод|утказма/.test(t)) return '';
  return '';   // ТиП бўш ёки нотаниш — кирим/чиқим деб ўйлаб топилмайди, tashxis.tipsiz да кўринади
}
function moliyaShart(){
  var ss=ochJadval(), t=varaqTop(ss,SOZ.VARAQ,XARITA,TAYANCH,SOZ.TASHLA), v=t.vals, u=t.ust, rows=[], c={bosh:0,sanasiz:0,summasiz:0,tipsiz:0}, tq={};
  for(var i=t.qator+1;i<v.length;i++){
    var r=v[i], f=function(k){ return u[k]>=0?r[u[k]]:''; };
    var s=sana(f('sana')), sm=son(f('summa')), tip='';
    if(u.summa<0){ var a=son(f('kirimU')), b=son(f('chiqimU')); sm=a||b; tip=a?'kirim':(b?'chiqim':''); }
    if(!s&&!sm){ c.bosh++; continue; }
    if(!s){ c.sanasiz++; continue; } if(!sm){ c.summasiz++; continue; }
    var tv=str(f('tip'))||'(бўш)'; tq[tv]=(tq[tv]||0)+1;
    if(!tip) tip=tipAniq(f('tip'),sm); if(!tip){ c.tipsiz++; continue; }
    var val=str(f('valyuta')); val=/usd|\$|доллар/i.test(val)?'USD':(val?'UZS':SOZ.VALYUTA);
    rows.push({sana:s,kassa:str(f('kassa'))||'—',tip:tip,asosiy:str(f('asosiy'))||'Бошқа',stadiya:str(f('stadiya')),kichik:str(f('kichik')),summa:Math.abs(sm),valyuta:val,izoh:str(f('izoh'))});
  }
  return {ok:true,versiya:VERSIYA,vaqt:hozir(),
    moliyaP:paket(rows,['sana','kassa','tip','asosiy','stadiya','kichik','summa','valyuta','izoh'],['kassa','tip','asosiy','stadiya','kichik','valyuta']),
    tashxis:{versiya:VERSIYA,varaq:t.nom,jamiQator:v.length-t.qator-1,boshQator:c.bosh,oqilgan:rows.length,tipsiz:c.tipsiz,sanasiz:c.sanasiz,summasiz:c.summasiz,
      tipQiymatlar:Object.keys(tq).map(function(k){ return {qiymat:k,soni:tq[k]}; }),sarlavha:t.sar.map(String).filter(String)}};
}

// =====================================================================
//  3) СКЛАД  (?amal=sklad) — «Мирзо мебел Склад» жадвали, «База Склад» варағи
//     (Склад тозаланса ҳам база ҳаммасини сақлайди). Қолдиқ панелда ҳисобланади.
// =====================================================================
var SOZ_SKLAD = {
  // ⚠ Жадвал ҳаволасини брузердан ТЎЛИҚ нусхалаб шу ерга қўйинг
  JADVAL_ID: 'https://docs.google.com/spreadsheets/d/1yWYptnJa3dfhIBqegx83ULYBoo2V32Kf5eMscC61KcY/edit',
  VARAQ: ['База Склад','Склад'],
  TASHLA: /состояни|инфо|info/i,  KESH_SONIYA: 600
};
var XARITA_SKLAD = {
  sana:    ['Дата','Сана'],
  tur:     ['Тип Заказ','Тип заказа'],
  harakat: ['Приход Или Расход','Приход или расход','Приход/Расход','Ҳаракат'],
  nomi:    ['Имя Заказ','Имя заказа'],
  tovar:   ['Тип товар','Тип товара','Товар'],
  birlik:  ['Тип Число','Тип числа','Бирлик'],
  soni:    ['шт/кв','шт/кв ?','шт/кв?','Количество','Сони'],
  qaerdan: ['из?','из'],
  sklad:   ['Тип Склад','Склад'],
  izoh:    ['Коментарие','Комментарие','Коментарий','Комментарий','Изоҳ'],
  status:  ['Статус']
};
var TAYANCH_SKLAD = ['harakat','nomi'];
function skladShart(){
  var ss=ochJadval(), t=varaqTop(ss,SOZ.VARAQ,XARITA,TAYANCH,SOZ.TASHLA), v=t.vals, u=t.ust, rows=[], c={bosh:0,harakatsiz:0,ochirilgan:0,sanasiz:0};
  for(var i=t.qator+1;i<v.length;i++){
    var r=v[i], f=function(k){ return u[k]>=0?r[u[k]]:''; };
    var nomi=str(f('nomi')), tovar=str(f('tovar'));
    if(!nomi&&!tovar){ c.bosh++; continue; }
    if(/ўчирилган|учирилган/i.test(str(f('status')))){ c.ochirilgan++; continue; }   // эски версиядан қолган белги
    var h=norm(f('harakat')), hr=/приход|кирим/.test(h)?'kirim':(/расход|чиким/.test(h)?'chiqim':'');
    if(!hr){ c.harakatsiz++; continue; }
    var s=sana(f('sana')); if(!s) c.sanasiz++;                     // санасиз ҳам қолдиққа киради (Склад Состояния каби)
    rows.push({sana:s,tur:str(f('tur'))||'—',harakat:hr,nomi:nomi||'—',tovar:tovar||'—',birlik:str(f('birlik')).toUpperCase(),
      soni:son(f('soni')),qaerdan:str(f('qaerdan')),sklad:str(f('sklad'))||'—',izoh:str(f('izoh')),holat:str(f('status'))});
  }
  return {ok:true,versiya:VERSIYA,vaqt:hozir(),
    satrlarP:paket(rows,['sana','tur','harakat','nomi','tovar','birlik','soni','qaerdan','sklad','izoh','holat'],['tur','harakat','nomi','tovar','birlik','qaerdan','sklad','holat']),
    tashxis:{versiya:VERSIYA,varaq:t.nom,jamiQator:v.length-t.qator-1,oqilgan:rows.length,boshQator:c.bosh,harakatsiz:c.harakatsiz,ochirilgan:c.ochirilgan,sanasiz:c.sanasiz,sarlavha:t.sar.map(String).filter(String)}};
}

// =====================================================================
//  УМУМИЙ ЎҚУВЧИ — «сана + гуруҳ + сон» жадваллар учун
// =====================================================================
function jadvalShart(sonli,lugatli){
  var ss=ochJadval(), t=varaqTop(ss,SOZ.VARAQ,XARITA,TAYANCH,SOZ.TASHLA), v=t.vals, u=t.ust, rows=[], tashlandi=0, m=Object.keys(XARITA);
  for(var i=t.qator+1;i<v.length;i++){
    var r=v[i], o={}, bor=false;
    m.forEach(function(k){ var x=u[k]>=0?r[u[k]]:''; o[k]=k==='sana'?sana(x):(sonli.indexOf(k)>-1?son(x):str(x)); if(o[k]) bor=true; });
    if(!bor) continue; if(!o.sana||/итого|жами|всего/i.test(String(r[0]))){ tashlandi++; continue; }
    rows.push(o);
  }
  return {ok:true,versiya:VERSIYA,vaqt:hozir(),satrlarP:paket(rows,m,lugatli),
    tashxis:{versiya:VERSIYA,varaq:t.nom,jamiQator:v.length-t.qator-1,oqilgan:rows.length,tashlandi:tashlandi,sarlavha:t.sar.map(String).filter(String)}};
}

// =====================================================================
//  РЎЙХАТ — бўлим қўшилса шу ерга бир қатор
// =====================================================================
var B = {
  ishlab: {soz:SOZ_ISHLAB, xarita:XARITA_ISHLAB, tayanch:TAYANCH_ISHLAB, f:ishlabShart},
  moliya: {soz:SOZ_MOLIYA, xarita:XARITA_MOLIYA, tayanch:TAYANCH_MOLIYA, f:moliyaShart},
  sklad:  {soz:SOZ_SKLAD,  xarita:XARITA_SKLAD,  tayanch:TAYANCH_SKLAD,  f:skladShart},
  baza:   {soz:SOZ_BAZA,   xarita:{},            tayanch:[],             f:bazaShart, jadvalsiz:true}
};

// =====================================================================
//  ЯДРО — ўзгартирманг
// =====================================================================
function tanla(a){ SOZ=B[a].soz; XARITA=B[a].xarita; TAYANCH=B[a].tayanch; }
function doGet(e){
  try{
    var p=(e&&e.parameter)||{}, a=p.amal||'';
    if(a==='tekshir') return javob({ok:true,versiya:VERSIYA,vaqt:hozir(),amallar:Object.keys(B)});
    if(a==='ustunlar'){ var o={ok:true,versiya:VERSIYA,vaqt:hozir()};
      Object.keys(B).forEach(function(x){ if(B[x].jadvalsiz) return; try{ tanla(x); o[x]=tashxisUmumiy(); }catch(er){ o[x]={xato:String(er.message||er)}; } }); return javob(o); }
    if(!B[a]) return javob({ok:false,versiya:VERSIYA,xato:'amal= керак: '+Object.keys(B).join(', ')});
    var k='s_'+a+'_'+VERSIYA, t=p.yangi!=='1'?keshOl(k):null;
    if(!t){ tanla(a); t=JSON.stringify(B[a].f()); try{ keshQoy(k,t); }catch(x){} }
    return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.JSON);
  }catch(err){ return javob({ok:false,versiya:VERSIYA,xato:String(err&&err.message||err)}); }
}
// ▶ Бир марта Run: рухсат беради, ҳар бўлим бўйича топилган/топилмаган устунлар ва нечта қатор ўқилганини Log'га ёзади
function sinov(){ Logger.log('Версия: '+VERSIYA);
  Object.keys(B).forEach(function(a){ if(B[a].jadvalsiz) return; Logger.log('========== '+a+' ==========');
    try{ tanla(a); var d=tashxisUmumiy(), j=B[a].f();
      Logger.log('Жадвал: '+d.jadval+' · Варақ: '+d.varaq+' · Сарлавҳа: '+d.sarlavhaQatori+'-қатор · Ҳамма варақлар: '+d.varaqlar.join(', '));
      Logger.log('Топилди: '+JSON.stringify(d.topildi)); Logger.log('Топилмади: '+(d.topilmadi.join(', ')||'йўқ'));
      Logger.log('Ўқилди: '+j.tashxis.oqilgan+' / '+j.tashxis.jamiQator+' қатор');
      if(j.tashxis.tipQiymatlar) Logger.log('ТиП қийматлари: '+JSON.stringify(j.tashxis.tipQiymatlar));
      if(j.tashxis.harakatsiz!=null) Logger.log('Приход/Расход ёзилмаган: '+j.tashxis.harakatsiz+' · санасиз: '+j.tashxis.sanasiz+' · ўчирилган: '+j.tashxis.ochirilgan);
      if(j.tashxis.tashlandi!=null) Logger.log('Санасиз (ташланди): '+j.tashxis.tashlandi);
      Logger.log('JSON: '+Math.round(JSON.stringify(j).length/1024)+' KB');
    }catch(e){ Logger.log('ХАТО: '+(e.message||e)); } }); }
// Ихтиёрий: жадваллар катта бўлса sozla() ни бир марта Run — ҳар 5 дақиқада кеш олдиндан тайёрланади
function isit(){ var l=LockService.getScriptLock(); if(!l.tryLock(1000)) return;
  try{ Object.keys(B).forEach(function(a){ try{ tanla(a); keshQoy('s_'+a+'_'+VERSIYA,JSON.stringify(B[a].f())); }catch(e){ Logger.log(a+': '+(e.message||e)); } }); }
  finally{ l.releaseLock(); } }
function sozla(){ ochir(); ScriptApp.newTrigger('isit').timeBased().everyMinutes(5).create(); isit(); }
function ochir(){ ScriptApp.getProjectTriggers().forEach(function(t){ if(t.getHandlerFunction()==='isit') ScriptApp.deleteTrigger(t); }); }

function str(v){ return String(v==null?'':v).trim(); }
function norm(s){ return String(s==null?'':s).toLowerCase().replace(/ў/g,'у').replace(/қ/g,'к').replace(/ғ/g,'г').replace(/ҳ/g,'х').replace(/ё/g,'е').replace(/[ъь'`’ʻʼ‘]/g,'').replace(/[\s._\-–—%:;,()\/№#]/g,''); }
function son(v){ if(typeof v==='number') return v; var s=String(v==null?'':v).replace(/[\s  ]/g,'').replace(/[^\d.,\-]/g,''); if(!s) return 0;
  if(s.indexOf(',')>-1&&s.indexOf('.')>-1) s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
  else if(s.indexOf(',')>-1) s=(s.split(',')[1]||'').length===3?s.replace(/,/g,''):s.replace(',','.');
  var n=parseFloat(s); return isNaN(n)?0:n; }
var _tz=null; function tz(){ return _tz||TZ_JADVAL||Session.getScriptTimeZone(); }
function sana(v){ if(v instanceof Date){ if(isNaN(v.getTime())) return ''; return Utilities.formatDate(v,tz(),'yyyy-MM-dd'); }
  var s=String(v==null?'':v).trim(),m;
  if((m=s.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/))) return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  if((m=s.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/))) return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
  return ''; }
function ustunlar(sar,xarita){ var t={},band={};
  for(var k in xarita){ t[k]=-1; var v=xarita[k];
    for(var j=0;j<v.length&&t[k]<0;j++){ var w=norm(v[j]); for(var i=0;i<sar.length;i++){ if(band[i]) continue; if(norm(sar[i])===w){t[k]=i;break} } }
    for(var b=0;b<v.length&&t[k]<0;b++){ var w2=norm(v[b]); if(w2.length<=3) continue; for(var a=0;a<sar.length;a++){ if(band[a]) continue; var s2=norm(sar[a]); if(s2&&s2.indexOf(w2)===0){t[k]=a;break} } }
    if(t[k]>=0) band[t[k]]=1; }
  return t; }
function paket(satrlar,maydon,lugatli){ var lug={},xar={}; lugatli.forEach(function(m){lug[m]=[];xar[m]={}});
  var q=satrlar.map(function(o){ return maydon.map(function(m){ var v=o[m]; if(lugatli.indexOf(m)<0) return v==null?'':v;
    var s=String(v==null?'':v); if(xar[m][s]===undefined){xar[m][s]=lug[m].length;lug[m].push(s)} return xar[m][s]; }); });
  return {m:maydon,lug:lug,lugM:lugatli,q:q}; }
function keshQoy(k,matn){ var n=Math.ceil(matn.length/90000),o={}; o[k+'_n']=String(n); for(var i=0;i<n;i++) o[k+'_'+i]=matn.substr(i*90000,90000); CacheService.getScriptCache().putAll(o,SOZ.KESH_SONIYA||600); }
function keshOl(k){ var c=CacheService.getScriptCache(),n=+c.get(k+'_n'); if(!n) return null; var kl=[],s=''; for(var i=0;i<n;i++) kl.push(k+'_'+i); var h=c.getAll(kl); for(var j=0;j<n;j++){ if(h[kl[j]]==null) return null; s+=h[kl[j]]; } return s; }
function javob(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function hozir(){ return Utilities.formatDate(new Date(),tz(),'yyyy-MM-dd HH:mm:ss'); }
function jadvalId(s){ s=String(s||'').trim(); var m=s.match(/\/d\/([a-zA-Z0-9_-]+)/); return m?m[1]:s; }
function ochJadval(){ var id=jadvalId(SOZ.JADVAL_ID); if(!id||id.indexOf('XXXX')>-1) throw new Error('JADVAL_ID киритилмаган');
  try{ var ss=SpreadsheetApp.openById(id); if(!_tz&&!TZ_JADVAL) _tz=ss.getSpreadsheetTimeZone(); return ss; }
  catch(e){ throw new Error('Illegal spreadsheet id — JADVAL_ID нотўғри ёки жадвалга рухсат йўқ ('+(e.message||e)+')'); } }
function sarlavhaTop(vals,xarita,tayanch){ var eng=null;
  for(var r=0;r<Math.min(15,vals.length);r++){ var u=ustunlar(vals[r],xarita),ok=true,n=0;
    tayanch.forEach(function(k){ if(u[k]<0) ok=false; }); if(!ok) continue;
    for(var k in u) if(u[k]>=0) n++;
    if(!eng||n>eng.n) eng={qator:r,ust:u,n:n}; }
  return eng; }
function varaqTop(ss,nomlar,xarita,tayanch,tashla){ var hamma=ss.getSheets(),tartib=[],kor={};
  (nomlar||[]).forEach(function(n){ hamma.forEach(function(sh){ if(!kor[sh.getName()]&&norm(sh.getName())===norm(n)){ tartib.push(sh); kor[sh.getName()]=1; } }); });
  hamma.forEach(function(sh){ if(!kor[sh.getName()]&&!(tashla&&tashla.test(sh.getName()))){ tartib.push(sh); kor[sh.getName()]=1; } });
  for(var i=0;i<tartib.length;i++){ var sh=tartib[i]; if(sh.getLastRow()<1) continue;
    var vals=sh.getDataRange().getValues(), s=sarlavhaTop(vals,xarita,tayanch);
    if(s) return {sh:sh,nom:sh.getName(),vals:vals,qator:s.qator,ust:s.ust,sar:vals[s.qator]}; }
  throw new Error('Керакли варағи топилмади ('+tayanch.join(', ')+' устунлари бор варақ йўқ). Варақлар: '+hamma.map(function(s){return s.getName()}).join(', ')); }
function tashxisUmumiy(){ var ss=ochJadval(), t=varaqTop(ss,SOZ.VARAQ,XARITA,TAYANCH,SOZ.TASHLA), top={},yoq=[];
  for(var k in XARITA){ if(t.ust[k]>=0) top[k]=String(t.sar[t.ust[k]]); else yoq.push(k); }
  return {ok:true,jadval:ss.getName(),varaq:t.nom,sarlavhaQatori:t.qator+1,topildi:top,topilmadi:yoq,varaqlar:ss.getSheets().map(function(s){return s.getName()})}; }
