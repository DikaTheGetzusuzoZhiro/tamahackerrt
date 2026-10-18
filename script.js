(() => {
const $=id=>document.getElementById(id), input=$("usernameInput"), logs=$("logs");
let running=false,soundOn=false,audio=null,scanTimer=null;
function log(msg,cls="dim"){const p=document.createElement("p");p.className=cls;p.textContent=msg;logs.appendChild(p);logs.scrollTop=logs.scrollHeight}
function beep(freq=600,duration=.055){if(!soundOn)return;try{audio ||= new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.value=.025;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.stop(audio.currentTime+duration)}catch(e){}}
function setText(id,value){$(id).textContent=value??"—"}
async function lookup({quiet=false}={}){
 const username=input.value.trim().replace(/^@+/,"");
 if(!username){$("lookupHint").textContent="Masukkan username Roblox terlebih dahulu.";input.focus();return false}
 $("lookupBtn").disabled=true;$("lookupHint").textContent="Mengambil data profil publik Roblox…";
 $("avatar").hidden=true;$("avatar").removeAttribute("src");$("avatarPlaceholder").hidden=false;
 setText("displayName","Memuat profil…");setText("usernameLabel","@"+username);setText("userId","—");setText("created","—");setText("accountStatus","—");setText("presenceValue","—");setText("presenceText","Mencari profil");setText("description","Memuat informasi profil publik…");$("presenceDot").classList.remove("online");$("profileBadge").textContent="SEARCHING";
 $("profileLink").href="https://www.roblox.com/search/users?keyword="+encodeURIComponent(username);
 try{
  const res=await fetch("/api/roblox",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username})});
  const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||"Pencarian profil gagal");
  const u=data.user;setText("displayName",u.displayName||u.username);setText("usernameLabel","@"+u.username);setText("userId",u.id);
  setText("configDisplayName",u.displayName||u.username);setText("configUsername","@"+u.username);setText("configUserId","USER ID: "+u.id);setText("configStatus","PROFILE LOADED");
  const configAvatar=$("configAvatar"), configPlaceholder=$("configAvatarPlaceholder");
  configAvatar.hidden=true;configAvatar.removeAttribute("src");configPlaceholder.hidden=false;
  if(u.avatar){configAvatar.onload=()=>{configPlaceholder.hidden=true;configAvatar.hidden=false};configAvatar.onerror=()=>{configAvatar.hidden=true;configPlaceholder.hidden=false};configAvatar.src=u.avatar;}
  setText("created",u.created?new Date(u.created).toLocaleDateString("id-ID",{year:"numeric",month:"short",day:"numeric"}):"Tidak tersedia");
  setText("accountStatus",u.banned?"Banned":"Tidak ada tanda ban publik");setText("presenceValue",u.status||"Tidak tersedia");setText("presenceText",u.status||"Status tidak tersedia");
  $("presenceDot").classList.toggle("online",["Online","In Game","In Roblox Studio"].includes(u.status));setText("description",u.description||"Tidak ada deskripsi profil.");
  $("profileLink").href="https://www.roblox.com/users/"+u.id+"/profile";$("profileBadge").textContent="FOUND";$("lookupHint").textContent="Profil publik berhasil dimuat.";
  if(u.avatar){const img=$("avatar");img.onload=()=>{$("avatarPlaceholder").hidden=true;img.hidden=false};img.onerror=()=>{img.hidden=true;$("avatarPlaceholder").hidden=false;setText("lookupHint","Profil ditemukan, tetapi gambar avatar gagal dimuat.")};img.src=u.avatar;}else setText("lookupHint","Profil ditemukan, tetapi thumbnail avatar tidak tersedia.");
  if(!quiet){log("[OK] Username publik berhasil ditemukan.","good");log("[OK] Data profil publik diterima.","good");log(u.avatar?"[OK] URL avatar penuh diterima.":"[WARN] Thumbnail avatar tidak tersedia.",u.avatar?"good":"warn");beep(740)}
  return true;
 }catch(e){$("profileBadge").textContent="ERROR";setText("displayName","Profil tidak tersedia");setText("usernameLabel","@"+username);setText("presenceText","Pencarian gagal");setText("description",e.message||"Tidak dapat memuat profil.");$("lookupHint").textContent=e.message||"Profil tidak dapat diambil.";if(!quiet)log("[ERROR] "+(e.message||"Pencarian profil gagal."),"warn");return false}
 finally{$("lookupBtn").disabled=false}
}
$("lookupBtn").addEventListener("click",()=>lookup());input.addEventListener("keydown",e=>{if(e.key==="Enter")lookup()});
$("soundBtn").addEventListener("click",()=>{soundOn=!soundOn;$("soundBtn").textContent=soundOn?"Sound on":"Sound off";$("soundBtn").setAttribute("aria-pressed",String(soundOn));if(soundOn)beep(760,.1)});
$("clearBtn").addEventListener("click",()=>{logs.replaceChildren();log("[SYSTEM] Konsol dibersihkan.","dim")});
$("scanBtn").addEventListener("click",async()=>{
 if(running)return;
 if(!input.value.trim()){setText("progressLabel","USERNAME REQUIRED");$("lookupHint").textContent="Masukkan username dulu, lalu jalankan scan.";input.focus();return}
 running=true;$("scanBtn").disabled=true;$("lookupBtn").disabled=true;$("report").hidden=true;logs.replaceChildren();$("progressFill").style.width="0%";setText("progressValue","0%");setText("progressLabel","INITIALIZING PUBLIC PROFILE SCAN");setText("consoleStatus","WORKER RUNNING");setText("configStatus","SYNCING");
 const start=Date.now(),duration=8000;
 const lines=[
  [2,"[BOOT] Account scanner worker started.","red"],
  [8,"[SYSTEM] Session UI initialized; waiting for public lookup response.","dim"],
  [14,"[NET] Preparing request to Roblox public profile endpoint…","dim"],
  [20,"[PRIVACY] Scope locked to public profile fields only.","good"],
  [26,"[LOOKUP] Validating supplied username format…","dim"],
  [32,"[API] Sending username lookup request…","red"],
  [38,"[WORKER] Profile lookup task is running.","dim"],
  [44,"[PROFILE] Retrieving public display name and user ID…","dim"],
  [50,"[AVATAR] Requesting full public avatar thumbnail…","red"],
  [56,"[AVATAR] Updating profile and configuration panels…","dim"],
  [62,"[PRESENCE] Checking public presence availability…","dim"],
  [68,"[CONFIG] Email and password are not exposed by public profile APIs.","good"],
  [74,"[VALIDATE] Checking returned public profile response…","dim"],
  [80,"[REPORT] Formatting available public profile fields…","red"],
  [86,"[CONFIG] Security changes must be completed on official Roblox pages.","good"],
  [92,"[FINALIZE] Preparing scan report and configuration summary…","dim"],
  [100,"[DONE] Public profile lookup completed.","good"]
 ];
 lines.forEach(([pct,msg,cls],i)=>setTimeout(()=>{if(!running)return;$("progressFill").style.width=pct+"%";setText("progressValue",pct+"%");log(msg,cls);beep(320+pct*4,.045)},Math.round((i/(lines.length-1))*duration)));
 // Fetch the real public profile during the 8-second visual scan.
 const profilePromise=lookup({quiet:true});
 const tick=setInterval(()=>{if(!running){clearInterval(tick);return}const elapsed=Date.now()-start;setText("clock",new Date().toLocaleTimeString("id-ID",{hour12:false}));if(elapsed>=duration){clearInterval(tick)}},100);
 await new Promise(resolve=>setTimeout(resolve,duration));
 await profilePromise;
 running=false;$("scanBtn").disabled=false;$("lookupBtn").disabled=false;$("scanBtn").textContent="Run scan again";setText("consoleStatus","COMPLETE");setText("progressLabel","PUBLIC PROFILE SCAN COMPLETE");if($("configStatus").textContent==="SYNCING")setText("configStatus","NO PROFILE DATA");
 setText("reportTitle","Pemeriksaan profil selesai");setText("reportText","Laporan ini hanya memuat informasi profil publik. Password dan email tidak dipindai atau diubah. Untuk mengelola keamanan akun, gunakan tautan resmi di bagian Account Security.");$("report").hidden=false;beep(850,.12);
});
function tick(){setText("clock",new Date().toLocaleTimeString("id-ID",{hour12:false}))}tick();setInterval(tick,1000);
})();