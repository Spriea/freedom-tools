const button = document.getElementById('language');
function setLanguage(english) { document.documentElement.classList.toggle('english',english); document.documentElement.lang=english?'en':'zh-CN'; button.textContent=english?'中文':'English'; }
button.addEventListener('click',()=>setLanguage(!document.documentElement.classList.contains('english')));
