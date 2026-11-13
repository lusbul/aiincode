const $=s=>document.querySelector(s);let score=0;function mark(msg,ok=true){$('#feedback').textContent=msg;if(ok)score++;$('#score').textContent=score}document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>mark(b.dataset.choice==='yes'?'✓ Обґрунтовано! Поясніть, чому.':'Спробуйте ще раз: перевірте мету й обмеження.',b.dataset.choice==='yes')));const tiles=[...document.querySelectorAll('.tile')];tiles.forEach(t=>{t.draggable=true;t.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',t.id));t.addEventListener('click',()=>{let d=document.querySelector('.drop');d.appendChild(t);mark('Елемент перенесено. Обґрунтуйте його місце.')})});document.querySelectorAll('.drop').forEach(d=>{d.addEventListener('dragover',e=>e.preventDefault());d.addEventListener('drop',e=>{e.preventDefault();let t=document.getElementById(e.dataTransfer.getData('text/plain'));if(t){d.appendChild(t);mark('Елемент розміщено. Перевірте порядок.')}})});let n=0;$('#simulate').addEventListener('click',()=>{n++;let v=(n*17+Number(document.querySelector('#param').value)*7)%101;$('#barfill').style.width=v+'%';$('#simvalue').textContent=v+'%';$('#simlog').textContent='Крок '+n+': значення '+v+'. Що змінилося?';});$('#check').addEventListener('click',()=>{let s=$('#reflection').value.trim();mark(s.length>35?'✓ Відповідь записано. Перевірте її за критеріями.':'Додайте пояснення щонайменше двома реченнями.',s.length>35)});$('#print').addEventListener('click',()=>{document.querySelector('#report').textContent='Урок '+document.body.dataset.lesson+' · Балів за дії: '+score+' · Висновок: '+$('#reflection').value;window.print()});
/* Незалежні лабораторії Python, доповнення до базового уроку */
(()=>{
 let pyodidePromise;
 function getPython(){
   if(!pyodidePromise)pyodidePromise=new Promise((resolve,reject)=>{
     if(window.loadPyodide){window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'}).then(resolve,reject);return;}
     const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
     script.onload=()=>window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'}).then(resolve,reject);
     script.onerror=()=>reject(new Error('Не вдалося завантажити Python. Перевірте інтернет-з’єднання.'));
     document.head.appendChild(script);
   }).catch(e=>{pyodidePromise=null;throw e});
   return pyodidePromise;
 }
 for(const lab of document.querySelectorAll('.new-lab')){
   const id=lab.dataset.lab, editor=lab.querySelector('.py-editor'), output=lab.querySelector('.py-output');
   const original=editor.value, journal=lab.querySelector('.lab-journal'), prediction=lab.querySelector('.prediction');
   const key='aiincode-lab-'+id;
   try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved.code)editor.value=saved.code;journal.value=saved.journal||'';prediction.value=saved.prediction||'';}catch(e){}
   function save(){try{localStorage.setItem(key,JSON.stringify({code:editor.value,journal:journal.value,prediction:prediction.value}))}catch(e){}}
   [editor,journal,prediction].forEach(el=>el.addEventListener('input',save));
   lab.querySelector('.reset-python').addEventListener('click',()=>{editor.value=original;save();output.textContent='Приклад відновлено.'});
   lab.querySelector('.run-python').addEventListener('click',async e=>{
     const btn=e.currentTarget;btn.disabled=true;output.textContent='Завантаження середовища Python…';
     try{
       const py=await getPython();const lines=[];
       py.setStdout({batched:(s)=>lines.push(s)});py.setStderr({batched:(s)=>lines.push(s)});
       // no arbitrary browser APIs exposed to the Python code
       await py.runPythonAsync(editor.value);
       output.textContent=lines.join('\n')||'Програму виконано. Виведення відсутнє.';
     }catch(err){output.textContent='Помилка виконання: '+String(err.message||err)}finally{btn.disabled=false;save()}
   });
   lab.querySelectorAll('.lab-quiz button').forEach(b=>b.addEventListener('click',()=>{
     const good=b.dataset.correct==='true';b.classList.toggle('correct',good);b.classList.toggle('incorrect',!good);
     lab.querySelector('.lab-feedback').textContent=good?'✓ Правильно: тестування підтверджує або спростовує припущення.':'Спробуйте обрати перевірку, яку можна повторити.';
   }));
   const list=lab.querySelector('.reorder');
   for(const li of list.children){for(const [sign,dir] of [['↑',-1],['↓',1]]){
     const b=document.createElement('button');b.type='button';b.textContent=sign;b.setAttribute('aria-label',sign==='↑'?'Перемістити вище':'Перемістити нижче');
     b.addEventListener('click',()=>{if(dir<0&&li.previousElementSibling)list.insertBefore(li,li.previousElementSibling);else if(dir>0&&li.nextElementSibling)list.insertBefore(li.nextElementSibling,li)});li.appendChild(b)
   }}
   lab.querySelector('.check-order').addEventListener('click',()=>{
     const keys=[...list.children].map(x=>x.dataset.key).join(',');
     lab.querySelector('.order-feedback').textContent=keys===list.dataset.order?'✓ Послідовність правильна!':'Поки не збігається. Почніть із прогнозу, а закінчіть висновком.';
   });
 }
})();
