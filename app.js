const state={weather:{city1:null,city2:null},historical:{city1:null,city2:null},aqi:{city1:null,city2:null},history30Days:{city1:[],city2:[]},previousWeather:{city1:null,city2:null},loading:true,error:null,lastUpdate:null,showSettings:false,activeTab:"overview",battleMode:false,settings:JSON.parse(localStorage.getItem("weatherSettings"))||{city1:{name:"Oneonta, NY",lat:42.4528,lon:-75.0638},city2:{name:"Gray Court, SC",lat:34.6193,lon:-82.0787},tempUnit:"fahrenheit",autoRefresh:true,theme:"dark",animations:true},streaks:JSON.parse(localStorage.getItem("weatherStreaks"))||{city1:{},city2:{}}};
const THEMES={dark:{name:"Dark",bg:"theme-dark",card:"bg-zinc-900",border:"border-zinc-800",text:"text-zinc-100"},ocean:{name:"Ocean",bg:"theme-ocean",card:"bg-white bg-opacity-10",border:"border-white border-opacity-20",text:"text-white"},sunset:{name:"Sunset",bg:"theme-sunset",card:"bg-white bg-opacity-10",border:"border-white border-opacity-20",text:"text-white"},forest:{name:"Forest",bg:"theme-forest",card:"bg-white bg-opacity-10",border:"border-white border-opacity-20",text:"text-white"},arctic:{name:"Arctic",bg:"theme-arctic",card:"bg-white bg-opacity-40",border:"border-gray-300",text:"text-gray-900"}};

class WeatherAnimator{constructor(){this.canvas=document.getElementById("weatherAnimation");if(!this.canvas){this.canvas=document.createElement("canvas");this.canvas.id="weatherAnimation";this.canvas.className="fixed inset-0 pointer-events-none z-0";document.body.appendChild(this.canvas);const a=document.getElementById("app");if(a)a.classList.add("relative","z-10")}this.ctx=this.canvas.getContext("2d");this.particles=[];this._raf=null;this.resize();window.addEventListener("resize",()=>this.resize())}
resize(){const d=window.devicePixelRatio||1,{innerWidth:w,innerHeight:h}=window;this.canvas.style.width=w+"px";this.canvas.style.height=h+"px";this.canvas.width=Math.floor(w*d);this.canvas.height=Math.floor(h*d);this.ctx.setTransform(d,0,0,d,0,0)}
clear(){this.particles=[];this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);if(this._raf){cancelAnimationFrame(this._raf);this._raf=null}}
createRain(){this.clear();for(let i=0;i<100;i++)this.particles.push({x:Math.random()*this.canvas.width,y:Math.random()*this.canvas.height,speed:5+Math.random()*5,length:10+Math.random()*20});this.animateRain()}
animateRain(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.strokeStyle="rgba(174,194,224,0.5)";this.ctx.lineWidth=2;this.particles.forEach(p=>{this.ctx.beginPath();this.ctx.moveTo(p.x,p.y);this.ctx.lineTo(p.x,p.y+p.length);this.ctx.stroke();p.y+=p.speed;if(p.y>this.canvas.height){p.y=-p.length;p.x=Math.random()*this.canvas.width}});if(state.settings.animations)this._raf=requestAnimationFrame(()=>this.animateRain())}
createSnow(){this.clear();for(let i=0;i<50;i++)this.particles.push({x:Math.random()*this.canvas.width,y:Math.random()*this.canvas.height,speed:1+Math.random()*2,size:2+Math.random()*4,wobble:Math.random()*2});this.animateSnow()}
animateSnow(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.fillStyle="rgba(255,255,255,0.8)";this.particles.forEach(p=>{this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2);this.ctx.fill();p.y+=p.speed;p.x+=Math.sin(p.y/30)*p.wobble;if(p.y>this.canvas.height){p.y=-10;p.x=Math.random()*this.canvas.width}});if(state.settings.animations)this._raf=requestAnimationFrame(()=>this.animateSnow())}
createSunny(){this.clear();this.animateSunny()}
animateSunny(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);const x=this.canvas.width-100,y=100,t=Date.now()/1000;for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*.1,g=this.ctx.createLinearGradient(x,y,x+Math.cos(a)*100,y+Math.sin(a)*100);g.addColorStop(0,"rgba(255,220,100,0.3)");g.addColorStop(1,"transparent");this.ctx.strokeStyle=g;this.ctx.lineWidth=3;this.ctx.beginPath();this.ctx.moveTo(x,y);this.ctx.lineTo(x+Math.cos(a)*80,y+Math.sin(a)*80);this.ctx.stroke()}if(state.settings.animations)this._raf=requestAnimationFrame(()=>this.animateSunny())}
createCloudy(){this.clear();for(let i=0;i<5;i++)this.particles.push({x:Math.random()*this.canvas.width,y:50+Math.random()*200,speed:.3+Math.random()*.5,size:80+Math.random()*40});this.animateCloudy()}
animateCloudy(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.particles.forEach(p=>{this.ctx.fillStyle="rgba(200,200,200,0.3)";this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2);this.ctx.arc(p.x+p.size*.6,p.y,p.size*.8,0,Math.PI*2);this.ctx.arc(p.x+p.size*1.2,p.y,p.size*.9,0,Math.PI*2);this.ctx.fill();p.x+=p.speed;if(p.x>this.canvas.width+p.size*2)p.x=-p.size*2});if(state.settings.animations)this._raf=requestAnimationFrame(()=>this.animateCloudy())}}
let animator=null;
function updateWeatherAnimation(){if(!animator)animator=new WeatherAnimator();if(!state.settings.animations){animator.clear();return}const w=state.weather.city1||state.weather.city2;if(!w)return;const c=w.current.weather_code;if(c===0)animator.createSunny();else if(c<=3)animator.createCloudy();else if(c<=67)animator.createRain();else if(c<=77)animator.createSnow();else animator.createRain()}
async function fetchWeather(lat,lon){const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability,weather_code,uv_index,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max&temperature_unit=${state.settings.tempUnit}&wind_speed_unit=mph&timezone=America%2FNew_York&past_days=7`;const r=await fetch(u);if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
async function fetch30DayHistory(lat,lon){try{const e=new Date(),s=new Date();s.setDate(s.getDate()-30);const S=s.toISOString().split("T")[0],E=e.toISOString().split("T")[0];const u=`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${S}&end_date=${E}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=${state.settings.tempUnit}&timezone=America%2FNew_York`;const r=await fetch(u);if(!r.ok)return[];const d=await r.json();return d.daily.time.map((dt,i)=>({date:dt,high:d.daily.temperature_2m_max[i],low:d.daily.temperature_2m_min[i]}))}catch{return[]}}
async function fetchAQI(lat,lon){try{const u=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5`;const r=await fetch(u);if(!r.ok)return null;return r.json()}catch{return null}}
async function fetchHistoricalWeather(lat,lon){try{const t=new Date(),y=new Date(t);y.setFullYear(y.getFullYear()-1);const d=y.toISOString().split("T")[0];const u=`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${d}&end_date=${d}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=${state.settings.tempUnit}&timezone=America%2FNew_York`;const r=await fetch(u);if(!r.ok)return null;return r.json()}catch{return null}}
async function loadWeather(){state.loading=true;state.error=null;if(state.weather.city1&&state.weather.city2)state.previousWeather={city1:JSON.parse(JSON.stringify(state.weather.city1)),city2:JSON.parse(JSON.stringify(state.weather.city2))};render();try{const[d1,d2,a1,a2,h1,h2,H1,H2]=await Promise.all([fetchWeather(state.settings.city1.lat,state.settings.city1.lon),fetchWeather(state.settings.city2.lat,state.settings.city2.lon),fetchAQI(state.settings.city1.lat,state.settings.city1.lon),fetchAQI(state.settings.city2.lat,state.settings.city2.lon),fetchHistoricalWeather(state.settings.city1.lat,state.settings.city1.lon),fetchHistoricalWeather(state.settings.city2.lat,state.settings.city2.lon),fetch30DayHistory(state.settings.city1.lat,state.settings.city1.lon),fetch30DayHistory(state.settings.city2.lat,state.settings.city2.lon)]);state.weather={city1:d1,city2:d2};state.aqi={city1:a1,city2:a2};state.historical={city1:h1,city2:h2};state.history30Days={city1:H1,city2:H2};state.lastUpdate=new Date();updateWeatherAnimation()}catch(e){state.error=e.message;console.error(e)}state.loading=false;render()}
function getUVLevel(u){if(u<=2)return{level:"Low",color:"text-green-400"};if(u<=5)return{level:"Moderate",color:"text-yellow-400"};if(u<=7)return{level:"High",color:"text-orange-400"};if(u<=10)return{level:"Very High",color:"text-red-400"};return{level:"Extreme",color:"text-purple-400"}}
function getWeatherIcon(c){if(c===0)return"☀️";if(c<=3)return"⛅";if(c<=67)return"🌧️";if(c<=77)return"🌨️";if(c<=82)return"🌧️";return"⛈️"}
function formatTime(t){return new Date(t).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true})}
function prepare7DayData(){const d1=state.weather.city1.daily,d2=state.weather.city2.daily;const now=new Date(),nyNow=new Date(now.toLocaleString("en-US",{timeZone:"America/New_York"}));nyNow.setHours(0,0,0,0);let startIdx=d1.time.findIndex(dt=>{const dd=new Date(dt+"T00:00:00-05:00");return dd>=nyNow});if(startIdx<0)startIdx=0;return d1.time.slice(startIdx,startIdx+7).map((date,i)=>({date:new Date(date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),high1:Math.round(d1.temperature_2m_max?.[startIdx+i]||0),low1:Math.round(d1.temperature_2m_min?.[startIdx+i]||0),high2:Math.round(d2.temperature_2m_max?.[startIdx+i]||0),low2:Math.round(d2.temperature_2m_min?.[startIdx+i]||0)}))}
function renderWeatherCard(data,name,theme,isWinner){const c=data.current,d=data.daily,uv=getUVLevel(c.uv_index||0);const now=new Date(),nyNow=new Date(now.toLocaleString("en-US",{timeZone:"America/New_York"}));nyNow.setHours(0,0,0,0);let startIdx=d.time.findIndex(dt=>{const dd=new Date(dt+"T00:00:00-05:00");return dd>=nyNow});if(startIdx<0)startIdx=0;return`<div class="flex-1 ${theme.card} ${theme.border} border rounded-2xl p-6 ${isWinner?'winner-glow':''}">
<h2 class="text-xl ${theme.text} mb-4">${name}${isWinner?' 🏆':''}</h2>
<div class="flex items-center gap-4 mb-4"><span class="text-6xl">${getWeatherIcon(c.weather_code)}</span><div><div class="text-5xl ${theme.text}">${Math.round(c.temperature_2m)}°</div><div class="${theme.text} opacity-70">Feels like ${Math.round(c.apparent_temperature)}°</div></div></div>
<div class="grid grid-cols-2 gap-3 text-sm ${theme.text}">
<div>💧 ${c.relative_humidity_2m}%</div>
<div>💨 ${Math.round(c.wind_speed_10m)} mph</div>
<div>☀️ ${c.uv_index||0} <span class="${uv.color}">${uv.level}</span></div>
<div>👁️ ${Math.round((c.visibility||0)/1609.34)} mi</div>
<div>🌅 ${formatTime(d.sunrise[startIdx])}</div>
<div>🌇 ${formatTime(d.sunset[startIdx])}</div>
</div>
<h3 class="mt-4 mb-2 text-base ${theme.text}">7-Day Forecast</h3>
<div class="space-y-1">
${d.time.slice(startIdx,startIdx+7).map((dt,i)=>{const idx=startIdx+i;const uvL=getUVLevel(d.uv_index_max[idx]||0);return`<div class="flex justify-between text-sm ${theme.text} border rounded-xl px-2 py-1 ${theme.border}">
<span>${new Date(dt).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
<span>${getWeatherIcon(d.weather_code[idx])}</span>
<span>${Math.round(d.temperature_2m_max[idx])}° / ${Math.round(d.temperature_2m_min[idx])}°</span>
<span class="${uvL.color}">☀️${Math.round(d.uv_index_max[idx]||0)}</span>
</div>`}).join("")}
</div></div>`}
function renderOverview(c1,c2,theme){const best=calculateBestPlace();return`<div class="flex flex-col lg:flex-row gap-6">${renderWeatherCard(c1,state.settings.city1.name,theme,best.winner.key==='city1')}${renderWeatherCard(c2,state.settings.city2.name,theme,best.winner.key==='city2')}</div>`}
function calculateBestPlace(){const c1=state.weather.city1,c2=state.weather.city2;let s1=0,s2=0;const t1=c1.current.temperature_2m,t2=c2.current.temperature_2m;const ideal=72;const ts1=100-Math.abs(t1-ideal)*2,ts2=100-Math.abs(t2-ideal)*2;s1+=Math.max(0,ts1);s2+=Math.max(0,ts2);if(c1.current.weather_code===0)s1+=20;if(c2.current.weather_code===0)s2+=20;const h1=c1.current.relative_humidity_2m,h2=c2.current.relative_humidity_2m;const hs1=100-Math.abs(h1-50),hs2=100-Math.abs(h2-50);s1+=Math.max(0,hs1);s2+=Math.max(0,hs2);const u1=c1.current.uv_index||0,u2=c2.current.uv_index||0;if(u1<3)s1+=10;if(u2<3)s2+=10;const winner=s1>=s2?{key:"city1",city:state.settings.city1.name,score:Math.round(s1)}:{key:"city2",city:state.settings.city2.name,score:Math.round(s2)};return{winner}}
function getComparisonStats(c1,c2){const d1=c1.current,d2=c2.current;const tDiff=Math.round(d1.temperature_2m-d2.temperature_2m);const hDiff=Math.round(d1.relative_humidity_2m-d2.relative_humidity_2m);return{temp:`Temp diff ${Math.abs(tDiff)}°`,humidity:`Humidity diff ${Math.abs(hDiff)}%`}}
function renderChartsView(theme){const d=prepare7DayData();return`<div class="${theme.card} ${theme.border} border rounded-2xl p-4">
<h3 class="text-lg ${theme.text} mb-2">7-Day Temperature</h3>
<canvas id="weeklyChart" height="250"></canvas></div>
<script>
const ctx=document.getElementById('weeklyChart').getContext('2d');
new Chart(ctx,{type:'bar',data:{labels:${JSON.stringify(d.map(x=>x.date))},datasets:[{label:'${state.settings.city1.name} High',data:${JSON.stringify(d.map(x=>x.high1))},backgroundColor:'rgba(59,130,246,.8)'},{label:'${state.settings.city2.name} High',data:${JSON.stringify(d.map(x=>x.high2))},backgroundColor:'rgba(245,158,11,.8)'}]},options:{plugins:{legend:{labels:{color:'#fff'}}},scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}});
</script>`}
function renderSettings(theme){return`<div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"><div class="${theme.card} ${theme.border} border rounded-2xl p-6 max-w-lg w-full"><h2 class="text-xl ${theme.text} mb-4">Settings</h2><label class="${theme.text} text-sm">City 1</label><input id="city1Name" value="${state.settings.city1.name}" class="w-full mb-2 rounded px-3 py-1 ${theme.text} ${theme.border} border ${theme.card}">
<label class="${theme.text} text-sm">City 2</label><input id="city2Name" value="${state.settings.city2.name}" class="w-full mb-2 rounded px-3 py-1 ${theme.text} ${theme.border} border ${theme.card}">
<label class="${theme.text} text-sm">Theme</label><select id="theme" class="w-full mb-4 rounded px-3 py-1 ${theme.text} ${theme.border} border ${theme.card}">${Object.entries(THEMES).map(([k,t])=>`<option value="${k}" ${state.settings.theme===k?'selected':''}>${t.name}</option>`).join("")}</select>
<div class="flex justify-between items-center mb-4 ${theme.text}"><span>Animations</span><input type="checkbox" id="animations" ${state.settings.animations?'checked':''}></div>
<button onclick="saveSettings()" class="w-full bg-blue-600 text-white py-2 rounded">Apply</button></div></div>`}
function saveSettings(){state.settings.city1.name=document.getElementById("city1Name").value;state.settings.city2.name=document.getElementById("city2Name").value;state.settings.theme=document.getElementById("theme").value;state.settings.animations=document.getElementById("animations").checked;localStorage.setItem("weatherSettings",JSON.stringify(state.settings));state.showSettings=false;loadWeather()}
function render(){
const theme=THEMES[state.settings.theme]
document.body.className=theme.bg
const app=document.getElementById("app")
if(state.loading){app.innerHTML=`<div class="min-h-screen flex items-center justify-center ${theme.bg}"><div class="text-2xl ${theme.text}">Loading weather data...</div></div>`;return}
if(state.error){app.innerHTML=`<div class="min-h-screen flex items-center justify-center ${theme.bg}"><div class="text-center"><div class="text-red-400 text-xl mb-2">⚠️ Error Loading Data</div><div class="${theme.text} mb-4">${state.error}</div><button onclick='loadWeather()' class='bg-blue-600 text-white px-4 py-2 rounded'>Retry</button></div></div>`;return}
const c1=state.weather.city1,c2=state.weather.city2;if(!c1||!c2)return
const comparison=getComparisonStats(c1,c2)
app.innerHTML=`
<div class="min-h-screen p-4 ${theme.bg}">
<div class="flex justify-between items-center mb-4 flex-wrap gap-2">
<h1 class="text-3xl ${theme.text}">Armstrong Weather Dashboard</h1>
<div class="flex gap-2">
<button onclick="state.activeTab='overview';render()" class="px-3 py-1 rounded ${state.activeTab==='overview'?'bg-blue-600 text-white':theme.card+' '+theme.text}">Overview</button>
<button onclick="state.activeTab='charts';render()" class="px-3 py-1 rounded ${state.activeTab==='charts'?'bg-blue-600 text-white':theme.card+' '+theme.text}">Charts</button>
<button onclick="state.activeTab='outfit';render()" class="px-3 py-1 rounded ${state.activeTab==='outfit'?'bg-blue-600 text-white':theme.card+' '+theme.text}">Outfit</button>
<button onclick="state.activeTab='insights';render()" class="px-3 py-1 rounded ${state.activeTab==='insights'?'bg-blue-600 text-white':theme.card+' '+theme.text}">Insights</button>
<button onclick="state.showSettings=true;render()" class="px-3 py-1 rounded ${theme.card+' '+theme.text}">⚙️</button>
<button onclick="shareWeather()" class="px-3 py-1 rounded ${theme.card+' '+theme.text}">📤</button>
</div></div>
<div class="text-sm ${theme.text} opacity-70 mb-3">${comparison.temp}, ${comparison.humidity}</div>
<div id="shareCapture">
${state.activeTab==='overview'?renderOverview(c1,c2,theme):
state.activeTab==='charts'?renderChartsView(theme):
state.activeTab==='outfit'?renderOutfitView(c1,c2,theme):
renderInsightsView(c1,c2,theme)}
</div>
${state.showSettings?renderSettings(theme):''}
</div>`
}
function renderOutfitView(c1,c2,theme){
const t1=c1.current.temperature_2m,t2=c2.current.temperature_2m
const outfit=t=>t>85?'🩳 Tank top & shorts':t>70?'👕 T-shirt':t>55?'🧥 Light jacket':t>40?'🧣 Coat':t>25?'🧤 Winter gear':'🥶 Heavy coat'
return`<div class="grid md:grid-cols-2 gap-6">
<div class="${theme.card} ${theme.border} border rounded-2xl p-6"><h3 class="text-xl ${theme.text} mb-2">${state.settings.city1.name}</h3><p class="${theme.text}">${outfit(t1)}</p></div>
<div class="${theme.card} ${theme.border} border rounded-2xl p-6"><h3 class="text-xl ${theme.text} mb-2">${state.settings.city2.name}</h3><p class="${theme.text}">${outfit(t2)}</p></div></div>`}
function renderInsightsView(c1,c2,theme){
const best=calculateBestPlace()
return`<div class="${theme.card} ${theme.border} border rounded-2xl p-6"><h3 class="text-xl ${theme.text} mb-2">🏆 ${best.winner.city} Wins</h3><p class="${theme.text}">Score: ${best.winner.score}</p></div>`}
async function shareWeather(){
const el=document.getElementById("shareCapture")
if(!el)return
const canvas=await html2canvas(el)
const url=canvas.toDataURL("image/png")
const a=document.createElement("a")
a.href=url
a.download="weather-share.png"
a.click()
}
window.addEventListener("DOMContentLoaded",()=>{loadWeather();if(state.settings.autoRefresh)setInterval(loadWeather,3600000)})
