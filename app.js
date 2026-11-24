
'use strict';
(() => {
const D=window.HULL_SNAPSHOT, main=document.querySelector('#main'), modal=document.querySelector('#overlay'), modalBody=document.querySelector('#overlay-content');
const $=(s,root=document)=>root.querySelector(s), esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const rows=D.candidates.map(row=>Object.fromEntries(D.cols.map((key,i)=>[key,row[i]])));
const key=r=>r.source+'::'+r.id, byKey=new Map(rows.map(r=>[key(r),r])), shortlist=rows.filter(r=>r.rank).sort((a,b)=>a.rank-b.rank);
const total=rows.length, gates=rows.filter(r=>r.gate).length, qc=rows.filter(r=>r.gate&&r.qc===true).length, verified=shortlist.filter(r=>Number.isFinite(D.structures[r.rank]?.forward)).length;
const families={halide:'Halide',oxide:'Oxide',sulfide:'Sulfide',selenide:'Selenide',oxyhalide:'Oxyhalide',other:'Other'};
const sourceNames={mp:'Materials Project',jarvis:'JARVIS-DFT',cod:'COD',aflow:'AFLOW',oqmd:'OQMD','alexandria-pbe':'Alexandria · PBE','alexandria-pbesol':'Alexandria · PBEsol','materials-cloud-mc3d-pbesol-v2':'Materials Cloud · MC3D'};
const attribution=[['Materials Project','https://doi.org/10.17188/1693272','CC BY 4.0'],['Materials Cloud MC3D PBEsol-v2','https://archive.materialscloud.org/records/szjaf-cfv74','CC BY 4.0'],['NIST JARVIS-DFT','https://doi.org/10.6084/m9.figshare.6815699','CC BY 4.0'],['Crystallography Open Database','https://www.crystallography.net/cod/','CC0'],['AFLOW','https://aflow.org/',''],['Alexandria','https://alexandria.icams.rub.de/',''],['OQMD','https://oqmd.org/','']];
const sourceEntry=r=>/^mp-\d+$/.test(r.id)&&r.source==='mp'?'https://materialsproject.org/materials/'+r.id:/^\d+$/.test(r.id)&&r.source==='cod'?'https://www.crystallography.net/cod/'+r.id+'.html':null;
const recordUrl=k=>location.href.split('#')[0]+'#material/'+encodeURIComponent(k);
const nf=new Intl.NumberFormat('en-US'), n=x=>nf.format(x), f=(x,d=3)=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))?Number(x).toFixed(d):'—';
const fmtFormula=v=>esc(v).replace(/\d+/g,'<sub>$&</sub>');
const tag=(s,k='')=>'<span class="tag '+k+'">'+esc(s)+'</span>';
const unique=(a)=>[...new Set(a)].sort();
const qctag=r=>r.qc===true?tag('Passed','good'):r.qc===false?tag('Failed','bad'):tag('Not assessed','pending');
const htmlOpts=(a,formatter=x=>x)=>a.map(x=>'<option value="'+esc(x)+'">'+esc(formatter(x))+'</option>').join('');
const button=(label,action,val='',cls='ghost',at='')=>'<button type="button" class="'+cls+'" data-act="'+action+'" data-val="'+esc(val)+'" '+at+'>'+label+'</button>';
const head=(a,b,c)=>'<div class="page-head"><div class="eyebrow">'+a+'</div><h1>'+b+'</h1><p class="lede">'+c+'</p></div>';
const section=(title,body,kicker='')=>'<section class="section"><div class="section-title"><div>'+ (kicker?'<div class="kicker">'+kicker+'</div>':'')+'<h2>'+title+'</h2></div></div>'+body+'</section>';
const table=(heads,body)=>'<div class="tablebox" tabindex="0" role="region" aria-label="Horizontally scrollable data table"><table><thead><tr>'+heads.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
const td=(x,k='')=>'<td class="'+k+'">'+x+'</td>';
const bundle=()=>JSON.parse(localStorage.getItem('hull-ion-saved-v1')||'[]');
let saved;try{const data=bundle();saved=new Set(Array.isArray(data)?data.filter(x=>byKey.has(x)):[])}catch{saved=new Set()}
const compare=new Set();
let page='overview', mode='', dialogKey='', toastTimer, scenes=new Map();
const F={q:'',ion:'',source:'',family:'',stage:'all',sort:'default',max:'',page:1};
const benchState={subset:'all methods',method:'HULLION_transport_free',id:'S46'};
const defaults={ps:.70,hull:.05,pz:.50,u:.80};
const L={rows:rows,name:'Project snapshot',values:{...defaults},qc:true};
const card=(k,t,p,action,label)=>'<article class="card"><div class="kicker">'+k+'</div><h3>'+t+'</h3><p>'+p+'</p>'+action(label)+'</article>';
function metrics(arr){return '<div class="metricbar">'+arr.map(([val,label])=>'<div class="metric"><strong>'+val+'</strong><span>'+label+'</span></div>').join('')+'</div>'}
function overview(){
const r=shortlist[0];
return '<section class="hero"><div class="hero-copy"><div class="eyebrow">SOLID ELECTROLYTE DISCOVERY</div><h1>Explore Li/Na<br>electrolyte candidates</h1><p>Search the HULL-ION candidate library, inspect crystal structures and calculation results, or apply the screening criteria to your own data.</p><div class="cta"><a class="btn" href="#explore">Explore candidates →</a><a class="ghost" href="#lab">Open screening lab</a></div><div class="hero-meta">Research snapshot '+esc(D.version)+' · No installation or sign-in required</div></div><div class="hero-view"><canvas id="hero-structure" tabindex="0" aria-label="NaCa3RuO6 crystal structure. Use arrow keys to rotate."></canvas><div class="hero-tag"><strong>CRYSTAL 01</strong>　'+fmtFormula(r.formula)+' · Drag to rotate</div></div></section>'
+metrics([[n(total),'Candidate structures'],[n(gates),'Pass all four thresholds'],[n(qc),'Also pass structure QC'],[n(shortlist.length),'Selected candidates'],[verified+'/'+shortlist.length,'DFT–NEB path results']])
+section('Workbench','<div class="cards">'+card('01 / EXPLORE','Candidate Explorer','Filter by database, mobile ion, and anion family. Save candidates or compare their metrics side by side.',l=>'<a class="textbtn tk" href="#explore">'+l+' →</a>','Browse candidates')+card('02 / VALIDATE','Validation &amp; Benchmarks','Inspect metal-referenced phase stability, migration paths, ranking agreement, and ablations.',l=>'<a class="textbtn tk" href="#bench">'+l+' →</a>','View validation')+card('03 / SCREEN','Screening Lab','Adjust the four thresholds with the project snapshot or your own CSV. Processing runs in your browser.',l=>'<a class="textbtn tk" href="#lab">'+l+' →</a>','Start screening')+'</div>')
+section('From candidate library to calculation results','<div class="split"><article class="panel"><h3>Screening funnel</h3><div class="bands">'+[[n(total),'Eligible candidates',100],[n(gates),'Four thresholds',100*gates/total],[n(qc),'Structure QC',100*qc/total],[n(shortlist.length),'Diversity selection',100*shortlist.length/total]].map(([v,l,w])=>'<div class="band"><span>'+l+'</span><div class="rail"><div class="bar" style="width:'+Math.max(.7,w)+'%"></div></div><b>'+v+'</b></div>').join('')+'</div></article><article class="panel"><h3>Featured candidate</h3><p>Open the highest-ranked candidate to explore its crystal, calculated migration path, and metal-referenced voltage interval.</p><div class="cta">'+button('View '+fmtFormula(r.formula),'detail',key(r))+'</div></article></div>');
}
function explore(){
return head('EXPLORER','Candidate Explorer','Search by formula, database ID, element, or chemical system. Open a material for details, or compare up to four records.')+
'<section class="panel"><div class="filters"><label class="field">Search<input id="q" type="search" placeholder="e.g. NaCa3RuO6, mp-6281, Na, Ca-Na-O-Ru" maxlength="100"></label><label class="field">Mobile ion<select id="ion"><option value="">Li or Na</option><option>Li</option><option>Na</option></select></label><label class="field">Source database<select id="source"><option value="">All sources</option>'+htmlOpts(unique(rows.map(r=>r.source)),v=>sourceNames[v]||v)+'</select></label><label class="field">Anion family<select id="family"><option value="">All families</option>'+htmlOpts(unique(rows.map(r=>r.family)),v=>families[v]||v)+'</select></label><label class="field">Maximum hull distance (eV/atom)<input id="max" type="number" step="0.01" min="0" placeholder="No limit"></label><label class="field">Sort by<select id="sort"><option value="default">Reported candidates first</option><option value="score">Transport-free score (high to low)</option><option value="hull">Hull distance (low to high)</option><option value="ps">Stability probability (high to low)</option><option value="pz">Synthesizability score (high to low)</option><option value="name">Formula (A–Z)</option></select></label></div><div class="toolbar"><div id="stage-chips"></div><div>'+button('Clear filters','reset-f')+button('Export filtered CSV','download-filter','','btn')+'</div></div><div id="results"></div></section>';
}
const stageNames={all:'All',gate:'Pass four thresholds',qc:'Pass structure QC',top:'Reported Top 20',saved:'Saved'};
const subnums={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
function filterResults(){
const q=F.q.trim().toLowerCase().replace(/[₀-₉]/g,c=>subnums[c]);
const answer=rows.filter(r=>(!q||[r.id,r.formula,r.display,r.system,...r.elements].some(v=>String(v).toLowerCase().includes(q)))&&(!F.ion||r.elements.includes(F.ion))&&(!F.source||r.source===F.source)&&(!F.family||r.family===F.family)&&(F.max===''||(r.hull!=null&&r.hull<=Number(F.max)))&&(F.stage==='all'||(F.stage==='gate'&&r.gate)||(F.stage==='qc'&&r.gate&&r.qc===true)||(F.stage==='top'&&r.rank)||(F.stage==='saved'&&saved.has(key(r)))));
const metric=(x,k,missing)=>Number.isFinite(x[k])?x[k]:missing;
answer.sort((a,b)=>{const k=F.sort;return (k==='default'?((a.rank??1e8)-(b.rank??1e8)||metric(b,'score',-1)-metric(a,'score',-1)):k==='name'?a.formula.localeCompare(b.formula):k==='hull'?metric(a,k,1e8)-metric(b,k,1e8):metric(b,k,-1)-metric(a,k,-1))||a.id.localeCompare(b.id)});
return answer;
}
function drawResults(){
const target=$('#results');if(!target)return;
$('#stage-chips').innerHTML=Object.entries(stageNames).map(([v,label])=>button(esc(label)+(v==='saved'?' '+saved.size:''),'stage',v,'chip','aria-pressed="'+(F.stage===v)+'"')).join('');
const answer=filterResults(), pages=Math.max(1,Math.ceil(answer.length/20));F.page=Math.max(1,Math.min(F.page,pages));const i=(F.page-1)*20;
target.innerHTML=(answer.length?table(['Material / source ID','Source','Family / space group','Stability probability','Hull distance (eV/atom)','Synthesizability score','QC','Actions'],answer.slice(i,i+20).map(r=>{
const id=key(r), on=compare.has(id), star=saved.has(id);
return '<tr>'+td(button(fmtFormula(r.formula),'detail',id,'textbtn')+' '+(r.rank?tag('#'+r.rank,'good'):'')+'<div class="mono">'+esc(r.id)+'</div>')+td(esc(sourceNames[r.source]||r.source))+td(esc(families[r.family]||r.family)+'<div class="mini">'+esc(r.sg||'—')+'</div>')+td(f(r.ps))+td(f(r.hull,4))+td(f(r.pz))+td(qctag(r))+td('<div class="row-tools">'+button(on?'Added':'+ Compare','compare-toggle',id,'chip','aria-pressed="'+on+'"')+button(star?'★':'☆','save',id,'chip','aria-label="'+(star?'Remove bookmark':'Bookmark')+'" aria-pressed="'+star+'"')+'</div>')+'</tr>'}).join('')):'<div class="empty">No materials match these filters.</div>')+
'<div class="pagination"><span>'+n(answer.length)+' results'+(answer.length?' · '+n(i+1)+'–'+n(Math.min(i+20,answer.length)):'')+'</span><div>'+button('Previous','result-prev','','ghost',F.page<=1?'disabled':'')+'<span> '+F.page+' / '+pages+' </span>'+button('Next','result-next','','ghost',F.page>=pages?'disabled':'')+'</div></div>';
}
const kv=(a)=>'<div class="kv">'+a.map(([l,v])=>'<div><span>'+l+'</span><b>'+v+'</b></div>').join('')+'</div>';
function detail(r){
const id=key(r), x=D.structures[r.rank], sourceLink=sourceEntry(r);
return '<div class="modal-head"><div><div class="kicker">MATERIAL RECORD '+(r.rank?' / TOP-'+r.rank:'')+'</div><h2>'+fmtFormula(r.formula)+'</h2><div class="mono">'+esc(r.id)+'</div></div>'+button('Close ×','close')+'</div><div class="cta">'+button(compare.has(id)?'Remove from comparison':'Add to comparison','compare-toggle',id,'ghost','aria-pressed="'+compare.has(id)+'"')+button(saved.has(id)?'Remove bookmark':'Bookmark','save',id,'ghost','aria-pressed="'+saved.has(id)+'"')+(x?'<a download class="btn" href="./'+esc(x.cif)+'">Download CIF</a>':'')+button('Copy record link','share-record',id)+(sourceLink?'<a class="ghost" href="'+esc(sourceLink)+'" target="_blank" rel="noreferrer">Source record ↗</a>':'')+'</div>'+
'<div class="detail-grid"><article class="panel"><h3>Structure and screening metrics</h3>'+kv([['Database',esc(sourceNames[r.source]||r.source)],['Space group / sites',esc(r.sg||'—')+' / '+esc(r.sites??'—')],['Anion family',esc(families[r.family]||r.family)],['Chemical system',esc(r.system)],['Stability probability',f(r.ps)],['Screening hull distance',f(r.hull,4)+' eV/atom'],['Synthesizability score',f(r.pz)],['Uncertainty percentile',f(r.u)],['Four thresholds',r.gate?'Passed':'Failed'],['Structure QC',qctag(r)]])+'</article><article class="panel"><h3>Unit cell and atomic sites</h3>'+(x?'<canvas id="detail-structure" class="structureCanvas" tabindex="0" aria-label="3D unit cell. Use arrow keys to rotate."></canvas><div class="detail-legend">'+unique(x.positions.map(v=>v[0])).map(e=>'<span class="tag"><i class="dot" style="background:'+atomColor(e)+'"></i>'+esc(e)+'</span>').join('')+'</div><p class="mini">Drag or use the arrow keys to rotate. Double-click to reset. Bonds are not inferred.</p>':'<p>Hosted CIFs and 3D views are available for the reported Top 20. Use the database ID to find other structures at the source.</p>')+'</article></div>'+
(x?'<div class="detail-grid"><article class="panel"><h3>Local DFT–NEB migration path</h3>'+kv([['Status',Number.isFinite(x.forward)?tag('Verified result','good'):tag('No reportable barrier','pending')],['Path separation (Å)',f(x.dist)],['Forward barrier (eV)',f(x.forward)],['Reverse barrier (eV)',f(x.reverse)],['Vacancy fraction of mobile sites',f(x.vacancy)]])+'<p class="mini">This calculation describes the selected path, not bulk ionic conductivity.</p></article><article class="panel"><h3>Metal-referenced phase stability</h3>'+kv([['Metal reference',esc(x.reservoir)],['Sampled voltage interval (V)',esc(x.window??'—')],['Interval width (V)',f(x.windowSpan,2)],['Metal-reference hull distance (eV/non-reservoir atom)',f(x.metalHull,4)]])+'<p class="mini">Sampled 0 K bulk phase diagram, using source-specific data.</p></article></div>':'');
}
function compareView(){
const rs=[...compare].map(k=>byKey.get(k));
const cont=rs.length?table(['Metric',...rs.map(r=>r.formula)],[
['Database ID',r=>'<span class="mono">'+esc(r.id)+'</span>'],['Database',r=>esc(sourceNames[r.source]||r.source)],['Reported rank',r=>r.rank??'—'],['Anion family',r=>esc(families[r.family]||r.family)],['Space group',r=>esc(r.sg||'—')],['Stability probability',r=>f(r.ps)],['Hull distance (eV/atom)',r=>f(r.hull,4)],['Synthesizability score',r=>f(r.pz)],['Uncertainty percentile',r=>f(r.u)],['Structure QC',qctag],['NEB forward / reverse (eV)',r=>D.structures[r.rank]?f(D.structures[r.rank].forward)+' / '+f(D.structures[r.rank].reverse):'—'],['Metal-reference interval (V)',r=>esc(D.structures[r.rank]?.window??'—')],['Actions',r=>button('View','detail',key(r),'chip')+' '+button('Remove','compare-toggle',key(r),'chip')]
].map(([p,fn])=>'<tr>'+td(esc(p),'nowrap')+rs.map(r=>td(fn(r))).join('')+'</tr>').join('')):'<div class="empty">No candidates selected. Use “+ Compare” in the Candidate Explorer to add a material.</div>';
return '<div class="modal-head"><div><div class="kicker">SIDE-BY-SIDE</div><h2>Compare candidates · '+rs.length+' / 4</h2></div>'+button('Close ×','close')+'</div><div class="section">'+cont+'</div><div class="cta">'+button('Back to Explorer','explore')+(rs.length?button('Clear comparison','compare-clear'):'')+'</div>';
}
const methodNames={HULLION_transport_free:'Transport-free',HULLION_archived:'Original archived ranking',HULLION_no_QC:'Without post-screening QC',HULLION_masked_hull_and_QC:'Without hull features and QC',JARVIS_pymatgen:'JARVIS-DFT',MP_pymatgen:'MP / pymatgen',PyMatCC:'PyMatCC'};
function bench(){
const mainCards='<div class="cards">'+[['DFT–NEB',verified+'/20 paths with results','Forward and reverse barriers and maximum final image force for each reportable path.'],['Li / Na METAL','20/20 bulk assessments','Sampled voltage intervals and hull distances at Li/Na metal reference.'],['RANK COMPARISON','70 shared formulas','Compare rankings on the common set, or switch to pairwise intersections.']].map(([a,b,c])=>'<div class="card"><div class="kicker">'+a+'</div><h3>'+b+'</h3><p>'+c+'</p></div>').join('')+'</div>';
return head('VALIDATION & BENCHMARKS','Validation &amp; Benchmarks','Explore candidate calculations, external tests, and screening ablations. Download each result table as CSV.')+mainCards+
section('Ranking agreement on shared formulas','<article class="panel"><div class="filters"><label class="field">Matched subset<select id="b-sub"><option value="all methods">Intersection across all methods</option><option value="pairwise">Pairwise intersections</option></select></label><label class="field">HULL-ION variant<select id="b-method">'+htmlOpts(Object.keys(methodNames).slice(0,4),v=>methodNames[v])+'</select></label></div><div id="bench-bars"></div><p class="mini">Spearman ρ ranges from −1 (left) to +1 (right). It measures ranking agreement, not discovery accuracy. Select “Without hull features and QC” to see how much agreement remains when shared stability inputs are removed.</p></article>','S46 / SPEARMAN ρ')+
section('Validation and ablation tables','<article class="panel"><div class="toolbar"><label class="field">Result table<select id="table-id">'+htmlOpts(Object.keys(D.tables),k=>k+' · '+D.tables[k].title)+'</select></label>'+button('Download table CSV','download-table','','btn')+'</div><div id="bench-table"></div></article>');
}
function drawBars(){
const out=$('#bench-bars');if(!out)return;
out.innerHTML=D.tables.S46.rows.filter(v=>v.support===benchState.subset&&v.method_A===benchState.method).map(v=>{
const x=Number(v.spearman_rho),w=Math.abs(x)*50,start=x<0?50-w:50;
return '<div class="benchbar"><div>'+esc(methodNames[v.method_B]||v.method_B)+' <span class="mini">n='+esc(v.formula_n)+'</span></div><div class="axis"><span '+(x<0?'class="neg" ':'')+'style="left:'+start+'%;width:'+w+'%"></span></div><b>'+f(x)+'</b></div>'}).join('');
}
function drawBenchTable(){
const out=$('#bench-table');if(!out)return;
const t=D.tables[benchState.id], hdr=Object.keys(t.rows[0]);
out.innerHTML=table(hdr,t.rows.map(r=>'<tr>'+hdr.map(k=>td(esc(r[k]??'—'))).join('')+'</tr>').join(''));
}
const colsLab=['formula','p_stable','e_hull','p_synth','uncertainty_rank','qc_pass'];
const demo=[['Na3PS4',0.91,0.012,0.74,0.20,'true'],['Li3YCl6',0.80,0.032,0.66,0.62,'false'],['Li3PO4',0.55,0.12,0.51,0.68,'']];
const fields=[['ps','Minimum stability probability',0,1,.01],['hull','Maximum hull distance (eV/atom)',0,1,.005],['pz','Minimum synthesizability score',0,1,.01],['u','Maximum uncertainty percentile',0,1,.01]];
function lab(){
return head('LOCAL SCREENING LAB','Screening Lab','Replay the screening thresholds on the project snapshot or load your own predictions. Files stay in your browser.')+
'<div class="notice">This lab applies four thresholds and optional structure QC. Supply the prediction columns from your own pipeline; the lab does not run inference, DFT, or diversity selection.</div><article class="panel"><h2>1. Load data</h2><div class="lab-drop"><label class="field">Choose a CSV file (up to 10 MB)<input id="lab-file" type="file" accept=".csv,text/csv,text/plain"></label>'+button('Restore project snapshot','lab-reset')+button('Download CSV template','lab-template')+'</div><details><summary>Paste CSV</summary><label class="field">CSV text<textarea id="csv-paste" class="paste" rows="5" spellcheck="false" placeholder="'+colsLab.join(',')+'"></textarea></label>'+button('Load pasted CSV','lab-paste')+'</details><p id="lab-status" aria-live="polite"></p><div class="mini">Headers: <code>'+colsLab.join(', ')+'</code>. Use eV/atom for e_hull and a precomputed 0–1 percentile for uncertainty_rank. The qc_pass field accepts true/false, yes/no, 1/0, or an empty value.</div></article>'+
section('2. Set thresholds','<article class="panel"><div class="range-box">'+fields.map(([id,l,min,max,step])=>'<label class="field">'+l+' <b id="out-'+id+'"></b><input type="range" data-lab="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+L.values[id]+'"></label>').join('')+'</div><div class="toolbar"><div><label><input type="checkbox" id="lab-qc" '+(L.qc?'checked':'')+'> Keep only rows that pass structure QC</label></div>'+button('Reset thresholds','threshold-reset')+'</div></article>')+
section('3. Preview and export','<article class="panel"><div id="lab-results"></div></article>');
}
function labPass(){
const g=L.rows.filter(r=>r.ps>=L.values.ps&&r.hull<=L.values.hull&&r.pz>=L.values.pz&&r.u<=L.values.u);
return {g,out:L.qc?g.filter(r=>r.qc===true):g};
}
function drawLab(){
const box=$('#lab-results');if(!box)return;
fields.forEach(([id])=>$('#out-'+id).textContent=f(L.values[id],id==='hull'?3:2));
$('#lab-status').textContent=L.name+' · '+n(L.rows.length)+' records';
const {g,out}=labPass(), passedQC=g.filter(r=>r.qc===true).length;
box.innerHTML='<div class="toolbar"><div>'+tag('Total '+n(L.rows.length))+' '+tag('Pass thresholds: '+n(g.length))+' '+tag('Pass structure QC: '+n(passedQC),'good')+' '+tag('Retained: '+n(out.length),'good')+'</div>'+button('Export '+n(out.length)+' retained records','lab-export','','btn')+'</div>'+
(out.length?table(['Formula','p_stable','e_hull','p_synth','uncertainty_rank','qc_pass'],out.slice(0,15).map(r=>'<tr>'+td(fmtFormula(r.formula))+td(f(r.ps))+td(f(r.hull,4))+td(f(r.pz))+td(f(r.u))+td(qctag(r))+'</tr>').join('')):'<div class="empty">No records pass the current settings.</div>')+(out.length>15?'<p class="mini">Preview shows the first 15 rows. The export includes every retained record.</p>':'');
}
function methods(){
const item=(x,y,z)=>'<div class="item"><div><b>'+x+'</b><div class="mini">'+y+'</div></div>'+z+'</div>';
return head('METHODS & DATA','Methods &amp; Data','Find the screening rules, validation definitions, data sources, and snapshot files.')+
'<div class="split"><article class="panel"><h2>Candidate screening</h2><ol><li>The candidate library preserves the exact source ID for each database record.</li><li>The four thresholds are stability probability ≥ 0.70, screening hull distance ≤ 0.05 eV/atom, synthesizability score ≥ 0.50, and uncertainty percentile ≤ 0.80.</li><li>Structure QC follows the four thresholds. Diversity selection then produces the reported Top 20.</li><li>Candidate-level validation includes bulk phase-stability assessments and local DFT–NEB paths.</li></ol><p>The explorer displays the transport-free score and the reported Top-20 ranks. The validation page also shows the original ranking and ranking ablations. The screening lab does not use the conductivity proxy or migration model as a threshold.</p></article><article class="panel"><h2>Interpreting the results</h2><ol><li>Screening hull distance and metal-referenced hull distance use different reference states and normalization.</li><li>Sampled 0 K bulk stability intervals do not give the operating voltage at a real electrode interface.</li><li>Local NEB barriers depend on the selected path, vacancy, and structure. Missing values are shown as a dash, not zero.</li><li>Rank correlation describes ordering on matched sets, not discovery accuracy.</li></ol></article></div>'+
section('Research data snapshot','<article class="panel"><div class="download-list">'+item('Candidate library CSV',n(total)+' structure records with source IDs and screening fields.',button('Download CSV','download-all'))+item('Snapshot manifest',esc(D.version)+', including record counts and the data digest.','<a class="ghost" href="./data/snapshot-manifest.json" download>Download JSON</a>')+item('Reported Top 20','Open a candidate to download its CIF.',button('Browse Top 20','jump-top'))+item('Calculation and benchmark tables','Conductivity checks, ablations, bulk phase stability, NEB, and ranking benchmarks.','<a class="ghost" href="#bench">Open result tables</a>')+'</div><p class="mini">Screening scores are research outputs. Source records and structures remain subject to their original data terms.</p></article>')+
section('Data sources and attribution','<article class="panel"><div class="download-list">'+attribution.map(([label,url,license])=>item(esc(label),esc(license||'Source reference'),'<a class="ghost" href="'+url+'" target="_blank" rel="noreferrer">Source ↗</a>')).join('')+'</div><p><a class="textbtn tk" href="https://github.com/ahvsjags/hull-ion-workbench/blob/main/DATA-SOURCES.md" target="_blank" rel="noreferrer">Full dataset and CIF credits ↗</a></p></article>');
}
function parseCSV(raw){
const a=[];let row=[],cell='',state=0,line=1;
raw=raw.replace(/^\uFEFF/,'');
for(let i=0;i<raw.length;i++){
const c=raw[i];
if(state===1){if(c==='"'){if(raw[i+1]==='"'){cell+='"';i++}else state=2}else cell+=c;continue}
if(c===','||c==='\n'||c==='\r'){
row.push(cell);cell='';state=0;
if(c!==','){if(c==='\r'&&raw[i+1]==='\n')i++;if(row.some(x=>x.trim()))a.push(row);row=[];line++}
}else if(c==='"'&&state===0&&cell===''){state=1}else if(state===2||c==='"'){throw Error('Invalid CSV quoting near record '+line+'.')}else cell+=c;
}
if(state===1)throw Error('The CSV contains an unclosed quoted field.');
row.push(cell);if(row.some(x=>x.trim()))a.push(row);
return a;
}
function importData(raw,name){
if(raw.length>10*1024*1024)throw Error('The file or text exceeds 10 MB.');
const a=parseCSV(raw),hdr=a.shift()?.map(x=>x.trim().toLowerCase())||[];
if(new Set(hdr).size!==hdr.length)throw Error('The CSV has duplicate column names.');
const ix=Object.fromEntries(colsLab.map(k=>[k,hdr.indexOf(k)])),missing=colsLab.filter(k=>ix[k]<0);
if(missing.length)throw Error('Missing CSV columns: '+missing.join(', '));
if(!a.length)throw Error('The CSV has no data rows.');
if(a.length>100000)throw Error('The lab accepts up to 100,000 records.');
const parsed=a.map((v,i)=>{
const row=i+2, get=k=>v[ix[k]]?.trim()??'';
if(v.length!==hdr.length)throw Error('Record '+row+' has a different number of fields than the header.');
const formula=get('formula');
if(!formula||formula.length>100)throw Error('Record '+row+' has an invalid formula.');
const num=(k,max=1)=>{const s=get(k),x=Number(s);if(!s||!Number.isFinite(x)||x<0||x>max)throw Error('Record '+row+': '+k+' must be '+(max===1?'a number between 0 and 1':'a nonnegative number')+'。');return x};
let qc=null;const b=get('qc_pass').toLowerCase();
if(['true','yes','1'].includes(b))qc=true;else if(['false','no','0'].includes(b))qc=false;else if(b)throw Error('Record '+row+' has an invalid qc_pass value.');
return {formula,ps:num('p_stable'),hull:num('e_hull',Infinity),pz:num('p_synth'),u:num('uncertainty_rank'),qc};
});
L.rows=parsed;L.name=name;drawLab();toast('Loaded '+n(L.rows.length)+' records。');
}
function exportCSV(name,head,list){
const q=x=>{let s=x==null?'':Array.isArray(x)?x.join(' '):String(x);
if(typeof x==='string'&&s!=='—'&&/^[\x00-\x20]*[=+@\t\r\n-]/.test(s)&&!/^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/i.test(s))s="'"+s;
return '"'+s.replace(/"/g,'""')+'"'};
const blob=new Blob(['\uFEFF',...([head,...list].map(r=>r.map(q).join(',')+'\r\n'))],{type:'text/csv;charset=utf-8'});
const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
toast('Exported '+n(list.length)+' CSV records.');
}
const exportCandidates=(name,rs)=>{const headers=D.cols.map(k=>({id:'source_id',display:'original_formula',sg:'space_group',sites:'site_count',ps:'p_stable',hull:'e_hull',pz:'p_synth',u:'uncertainty_rank',qc:'qc_pass',score:'score_no_transport',gate:'four_gate_pass',rank:'archived_rank',branch:'synthesis_evidence_route',system:'chemical_system',})[k]||k);exportCSV(name,headers,rs.map(r=>D.cols.map(k=>r[k])))};
const COLORS={Li:'#c2a0ff',Na:'#57ead8',O:'#ff8c9f',Ca:'#77baff',Ru:'#fec983',S:'#f6d675',Cl:'#89df97',P:'#ffae7e',Br:'#fe986e',F:'#86e7c4',Se:'#f4a89d',I:'#daa6ff'};
function atomColor(e){if(COLORS[e])return COLORS[e];let h=0;for(const c of e)h=(h*31+c.charCodeAt(0))%360;return 'hsl('+h+' 75% 74%)'}
function detachCanvas(scope){for(const [el,obs] of scenes){if(scope?.contains(el)||!el.isConnected){obs.disconnect();scenes.delete(el)}}}
function crystal(canvas,s){
if(!canvas||!s)return;const ctx=canvas.getContext('2d');if(!ctx)return;
let ax=-.40,ay=.64,grab=null;
const dims=s.cell, pos=s.positions, center=[0,1,2].map(i=>.5*dims.reduce((sum,v)=>sum+v[i],0));
const verts=Array.from({length:8},(_,m)=>[0,1,2].map(i=>dims.reduce((sum,v,j)=>sum+((m>>j)&1)*v[i],0)));
let radius=Math.max(1,...verts.map(v=>Math.hypot(...v.map((x,i)=>x-center[i])))),w,h,scale;
const calc=(v)=>{
const [x,y,z]=v.map((d,i)=>d-center[i]), c=Math.cos(ay), d=Math.sin(ay),e=Math.cos(ax),f=Math.sin(ax);
const X=x*c+z*d, Z=z*c-x*d, Y=y*e-Z*f, depth=y*f+Z*e,t=1+depth/(radius*5);
return [w/2+X*scale*t,h/2-Y*scale*t,depth,t];
};
function frame(){
const rect=canvas.getBoundingClientRect(), dpi=Math.min(devicePixelRatio||1,2);
w=rect.width;h=rect.height;if(!w||!h)return;
canvas.width=Math.round(w*dpi);canvas.height=Math.round(h*dpi);ctx.setTransform(dpi,0,0,dpi,0,0);
ctx.clearRect(0,0,w,h);scale=Math.min(w,h)*.38/radius;
const p=verts.map(calc);
ctx.setLineDash([5,5]);ctx.lineWidth=1.2;ctx.strokeStyle='#a7a4e3a0';
p.forEach(([x,y],i)=>{for(let j=0;j<3;j++){const k=i^(1<<j);if(k>i){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(p[k][0],p[k][1]);ctx.stroke()}}});ctx.setLineDash([]);
const atomR=Math.min(12,Math.max(3.1,Math.min(w,h)/(pos.length>80?56:36)));
pos.map(([el,...v])=>[el,...calc(v)]).sort((a,b)=>a[3]-b[3]).forEach(([el,x,y,z,t])=>{
let r=atomR*t;const color=atomColor(el), grad=ctx.createRadialGradient(x-r*.24,y-r*.28,0,x,y,r);
grad.addColorStop(0,'#f7edff');grad.addColorStop(.28,color);grad.addColorStop(1,'#29314d');
ctx.fillStyle=grad;ctx.strokeStyle=color;ctx.lineWidth=.85;
ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
});
}
const obs=new ResizeObserver(frame);obs.observe(canvas);scenes.set(canvas,obs);
canvas.addEventListener('pointerdown',e=>{grab=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!grab)return;ay+=(e.clientX-grab[0])*.010;ax+=(e.clientY-grab[1])*.010;grab=[e.clientX,e.clientY];frame()});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>grab=null);
canvas.addEventListener('dblclick',()=>{ax=-.4;ay=.64;frame()});
canvas.addEventListener('keydown',e=>{const a={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]}[e.key];if(!a)return;e.preventDefault();ay+=a[0];ax+=a[1];frame()});
frame();
}
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},3500)}
function setCompareCount(){$('#compare-count').textContent=compare.size}
function showDialog(which,k=''){
const exists=modal.open, active=document.activeElement;
mode=which;dialogKey=k;detachCanvas(modalBody);
modalBody.innerHTML=which==='detail'?detail(byKey.get(k)):compareView();
if(!exists)modal.showModal();
else if(active?.dataset?.act){const replacement=[...modalBody.querySelectorAll('button[data-act]')].find(b=>b.dataset.act===active.dataset.act&&b.dataset.val===active.dataset.val);(replacement||$('.modal-head button',modalBody))?.focus()}
if(which==='detail'){const x=D.structures[byKey.get(k).rank];if(x)crystal($('#detail-structure'),x)}
}
modal.addEventListener('close',()=>{if(!modal.open){mode='';dialogKey='';detachCanvas(modalBody);if(location.hash.startsWith('#material/'))history.replaceState(null,'','#explore')}});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
function route(){
const h=location.hash.slice(1);if(h==='main')return;
let deep='';if(h.startsWith('material/')){try{deep=decodeURIComponent(h.slice(9))}catch{}}
const selected=byKey.has(deep);
page=selected?'explore':['overview','explore','bench','lab','methods'].includes(h)?h:'overview';
if(modal.open)modal.close();detachCanvas(main);
main.innerHTML=({overview,explore,bench,lab,methods})[page]();
for(const a of document.querySelectorAll('nav a[data-page]')){if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
if(page==='overview')crystal($('#hero-structure'),D.structures[1]);
if(page==='explore'){for(const k of ['q','ion','source','family','sort','max'])$('#'+k).value=F[k];drawResults()}
if(page==='bench'){$('#b-sub').value=benchState.subset;$('#b-method').value=benchState.method;$('#table-id').value=benchState.id;drawBars();drawBenchTable()}
if(page==='lab')drawLab();
window.scrollTo(0,0);
if(selected)showDialog('detail',deep);
}
function locationTo(k){if(location.hash==='#'+k)route();else location.hash=k}
document.addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
if(b.id==='open-compare'){showDialog('compare');return}
const k=b.dataset.val,a=b.dataset.act;
switch(a){
case 'detail': if(byKey.has(k))showDialog('detail',k);break;
case 'close':modal.close();break;
case 'share-record':if(!byKey.has(k))break;{const u=recordUrl(k);if(navigator.clipboard?.writeText)navigator.clipboard.writeText(u).then(()=>toast('Candidate link copied.'),()=>window.prompt('Copy this candidate link:',u));else window.prompt('Copy this candidate link:',u);}break;
case 'explore':modal.close();locationTo('explore');break;
case 'jump-top':F.stage='top';F.page=1;locationTo('explore');break;
case 'compare-toggle':if(!byKey.has(k))return;if(compare.has(k))compare.delete(k);else if(compare.size<4)compare.add(k);else {toast('You can compare up to four candidates.');return}setCompareCount();drawResults();if(modal.open)showDialog(mode,dialogKey);else document.querySelector('[data-act="compare-toggle"][data-val="'+CSS.escape(k)+'"]')?.focus();break;
case 'compare-clear':compare.clear();setCompareCount();drawResults();showDialog('compare');break;
case 'save':if(!byKey.has(k))return;if(saved.has(k))saved.delete(k);else saved.add(k);try{localStorage.setItem('hull-ion-saved-v1',JSON.stringify([...saved]))}catch{}drawResults();if(modal.open)showDialog(mode,dialogKey);else document.querySelector('[data-act="save"][data-val="'+CSS.escape(k)+'"]')?.focus();break;
case 'stage':F.stage=k;F.page=1;drawResults();$('#stage-chips [aria-pressed="true"]')?.focus();break;
case 'reset-f':Object.assign(F,{q:'',ion:'',source:'',family:'',stage:'all',sort:'default',max:'',page:1});route();$('#q')?.focus();break;
case 'result-prev':F.page--;drawResults();$('.pagination button:not([disabled])')?.focus();break;
case 'result-next':F.page++;drawResults();$('.pagination button:not([disabled])')?.focus();break;
case 'download-filter':exportCandidates('HULL-ION_filtered_candidates.csv',filterResults());break;
case 'download-all':exportCandidates('HULL-ION_candidates_'+D.version+'.csv',rows);break;
case 'download-table':{const t=D.tables[benchState.id],hd=Object.keys(t.rows[0]);exportCSV('HULL-ION_'+benchState.id+'.csv',hd,t.rows.map(r=>hd.map(x=>r[x])));break}
case 'lab-template':exportCSV('HULL-ION_screening_template.csv',colsLab,demo);break;
case 'lab-reset':L.rows=rows;L.name='Project snapshot';$('#lab-file').value='';$('#csv-paste').value='';drawLab();break;
case 'threshold-reset':L.values={...defaults};L.qc=true;$('#lab-qc').checked=true;fields.forEach(([id])=>$('[data-lab="'+id+'"]').value=L.values[id]);drawLab();break;
case 'lab-paste':try{importData($('#csv-paste').value,'Pasted CSV')}catch(err){$('#lab-status').textContent=err.message;toast(err.message)}break;
case 'lab-export':exportCSV('HULL-ION_screening_pass.csv',colsLab,labPass().out.map(r=>[r.formula,r.ps,r.hull,r.pz,r.u,r.qc]));break;
}
});
main.addEventListener('input',e=>{
const t=e.target;if(page==='explore'&&['q','max'].includes(t.id)){F[t.id]=t.value;F.page=1;drawResults()}
if(page==='lab'&&t.dataset.lab){L.values[t.dataset.lab]=Number(t.value);drawLab()}
});
main.addEventListener('change',async e=>{
const t=e.target;
if(page==='explore'&&['ion','source','family','sort'].includes(t.id)){F[t.id]=t.value;F.page=1;drawResults()}
if(page==='bench'){
if(t.id==='b-sub'){benchState.subset=t.value;drawBars()}
if(t.id==='b-method'){benchState.method=t.value;drawBars()}
if(t.id==='table-id'){benchState.id=t.value;drawBenchTable()}
}
if(page==='lab'){
if(t.id==='lab-qc'){L.qc=t.checked;drawLab()}
if(t.id==='lab-file'){const file=t.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw Error('The file exceeds 10 MB.');const raw=await file.text();importData(raw,file.name)}catch(err){if($('#lab-status'))$('#lab-status').textContent=err.message;toast(err.message)}}
}
});
window.addEventListener('hashchange',route);
route();
})();



