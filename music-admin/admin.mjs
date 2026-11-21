// 순서: Google 로그인 → 관리자 조회 → 목록·상세 표시 → 기간선택 승인·차단 → 결과 안내.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {firebaseConfig,apiOrigin} from './config.mjs';
import {musicPeriodEnd} from './period.mjs';
const $=id=>document.getElementById(id),auth=getAuth(initializeApp(firebaseConfig));
const labels={pending:'신청 대기',allowed:'승인',blocked:'차단',expired:'기간 만료'};
const state={user:null,epoch:0,busy:false,status:'pending',query:'',users:[],counts:{pending:0,allowed:0,blocked:0,expired:0,all:0},cursor:'',selected:null,controller:null,serverNowMs:0,receivedAt:0};
const group=user=>user.status==='expired'?'allowed':user.status;
const expiry=user=>user.expiresOn||(group(user)==='allowed'?'무제한':'미지정');
const date=value=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
function message(text='',error=false){$('message').textContent=text;$('message').className=error?'error':'notice';}
function busy(value){state.busy=value;for(const element of document.querySelectorAll('#manager button,#manager input,#editor button,#editor input'))element.disabled=value;if(!value)$('expires').disabled=$('approval-form').elements.period.value==='unlimited';$('users').setAttribute('aria-busy',String(value));}
function node(tag,text,className){const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;}
async function request(path,{body}={}){
 const epoch=state.epoch,user=state.user;if(!user)throw Error('Google 계정으로 로그인해 주세요.');
 const token=await user.getIdToken();if(epoch!==state.epoch)throw new DOMException('계정 변경','AbortError');
 state.controller=new AbortController();
 const response=await fetch(apiOrigin+'/api/music/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:state.controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
 const data=await response.json();if(epoch!==state.epoch)throw new DOMException('계정 변경','AbortError');
 if(!response.ok)throw Error(data.message||'음악 관리 서버에 연결하지 못했어요.');return data;
}
function render(){
 for(const button of document.querySelectorAll('[data-status]'))button.setAttribute('aria-pressed',String(button.dataset.status===state.status));
 for(const element of document.querySelectorAll('[data-count]'))element.textContent=state.counts[element.dataset.count].toLocaleString('ko-KR');
 $('expired-count').textContent=state.counts.expired?'· 기간 만료 '+state.counts.expired+'명':'';
 const fragment=document.createDocumentFragment();
 for(const user of state.users){const item=node('li'),button=node('button',undefined,'user-row');button.type='button';button.setAttribute('aria-label',(user.name||user.email)+' 상세정보');
  const heading=node('span',undefined,'user-heading');heading.append(node('span',user.name||'이름 미입력','company'),node('span',labels[user.status],'status '+user.status));
  const meta=node('span',undefined,'user-meta');meta.append(node('span','만료 '+expiry(user)),node('span','›','chevron'));button.append(heading,node('span',user.phone||'전화번호 미입력','user-sub'),node('span',user.email,'user-sub'),meta);button.addEventListener('click',()=>{state.selected=user;render();window.scrollTo(0,0);});item.append(button);fragment.append(item);
 }
 $('users').replaceChildren(fragment);$('empty').hidden=Boolean(state.users.length);$('empty').textContent=state.query?'검색된 사용자가 없습니다.':state.status==='pending'?'신청 대기 중인 사용자가 없습니다.':'해당 사용자가 없습니다.';$('more').hidden=!state.cursor;
 $('list-view').hidden=Boolean(state.selected);$('detail').hidden=!state.selected;
 if(state.selected){const user=state.selected;$('detail-name').textContent=user.name||'이름 미입력';$('detail-status').textContent=labels[user.status];$('detail-status').className='status '+user.status;const info=document.createDocumentFragment();for(const [label,value]of [['이름',user.name||'미입력'],['전화번호',user.phone||'미입력'],['이메일',user.email],['신청일',date(user.requestedAt)],['만료일',expiry(user)]]){const row=node('div',undefined,'info-row');row.append(node('dt',label),node('dd',value));info.append(row);}$('detail-info').replaceChildren(info);$('block').disabled=state.busy||user.status==='blocked';}
}
async function load(append=false){
 if(state.busy)return;const epoch=state.epoch;busy(true);message('목록을 불러오고 있어요.');
 const params=new URLSearchParams({status:state.status,q:state.query});if(append&&state.cursor)params.set('cursor',state.cursor);
 try{const data=await request('admin/users?'+params);state.users=append?[...state.users,...data.users]:data.users;state.counts=data.counts;state.cursor=data.cursor;state.serverNowMs=data.serverNowMs;state.receivedAt=performance.now();state.selected=null;render();$('login').hidden=true;$('manager').hidden=false;message();}
 catch(error){if(error.name!=='AbortError')message(error.message||'목록에 연결하지 못했어요.',true);}
 finally{if(epoch===state.epoch)busy(false);}
}
async function change(user,status,period={}){
 if(state.busy)return false;const epoch=state.epoch;busy(true);message();$('action-error').textContent='';
 try{const data=await request('admin/change',{body:{owner:user.owner,status,revision:user.revision,...period}}),before=group(user),after=group(data.user);if(before!==after){state.counts[before]--;state.counts[after]++;}if(user.status==='expired')state.counts.expired--;if(data.user.status==='expired')state.counts.expired++;state.users=state.users.map(item=>item.owner===user.owner?data.user:item).filter(item=>state.status==='all'||group(item)===state.status);state.selected=data.user;render();message(data.message);return true;}
 catch(error){if(error.name!=='AbortError'){if($('editor').open)$('action-error').textContent=error.message;else message(error.message||'변경하지 못했어요.',true);}return false;}
 finally{if(epoch===state.epoch){busy(false);if(state.selected)$('block').disabled=state.selected.status==='blocked';}}
}
function openApproval(){const user=state.selected;if(!user||state.busy)return;$('approval-form').reset();$('approval-target').textContent=[user.name||user.email,user.phone,user.email].filter(Boolean).join('\n');$('expires').disabled=false;$('expires').required=true;$('expires').value=user.expiresOn||'';$('period-note').textContent='사용기간을 선택하면 만료일이 계산됩니다.';$('action-error').textContent='';$('editor').showModal();}
$('signin').textContent='Google로 로그인';$('signin').disabled=false;
$('signin').addEventListener('click',()=>{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});$('signin').disabled=true;signInWithPopup(auth,provider).catch(error=>{if(error.code!=='auth/popup-closed-by-user')message('Google 로그인에 연결하지 못했어요. 브라우저의 팝업 허용을 확인해 주세요.',true);}).finally(()=>{$('signin').disabled=false;});});
$('signout').addEventListener('click',()=>signOut(auth).catch(()=>message('로그아웃하지 못했어요. 다시 눌러 주세요.',true)));
$('refresh').addEventListener('click',()=>load());$('more').addEventListener('click',()=>load(true));$('back').addEventListener('click',()=>{state.selected=null;render();});
$('search-form').addEventListener('submit',event=>{event.preventDefault();state.query=$('query').value.trim();load();});for(const button of document.querySelectorAll('[data-status]'))button.addEventListener('click',()=>{state.status=button.dataset.status;load();});
$('approve').addEventListener('click',openApproval);$('block').addEventListener('click',()=>change(state.selected,'blocked'));
for(const input of document.querySelectorAll('[name=period]'))input.addEventListener('change',()=>{const unlimited=input.value==='unlimited';$('expires').disabled=unlimited;$('expires').required=!unlimited;const now=Number.isFinite(state.serverNowMs)?state.serverNowMs+performance.now()-state.receivedAt:Date.now();$('expires').value=unlimited?'':musicPeriodEnd(Number(input.value),now);$('period-note').textContent=unlimited?'만료일 없이 사용합니다.':'만료일 당일 밤 12시까지 사용합니다.';});
$('cancel').addEventListener('click',()=>{if(!state.busy)$('editor').close();});$('editor').addEventListener('cancel',event=>{if(state.busy)event.preventDefault();});
$('approval-form').addEventListener('submit',async event=>{event.preventDefault();const selected=$('approval-form').elements.period.value;if(!selected)return;const period=selected==='unlimited'?{unlimited:true}:{periodMonths:Number(selected),expiresOn:$('expires').value};if(await change(state.selected,'allowed',period))$('editor').close();});
onAuthStateChanged(auth,user=>{state.controller?.abort();state.epoch++;state.user=user;state.busy=false;state.users=[];state.cursor='';state.selected=null;state.counts={pending:0,allowed:0,blocked:0,expired:0,all:0};state.status='pending';state.query='';$('query').value='';if($('editor').open)$('editor').close();render();busy(false);message();$('manager').hidden=true;$('login').hidden=false;$('account-email').textContent=user?.email||'';$('login-account').textContent=user?.email||'';if(user)load();});
