// Menú responsiu
(function(){
  const toggle = document.getElementById('navbarToggle');
  const menu = document.getElementById('navMenu');
  
  if(!toggle || !menu) return;
  
  // Obrir/tancar menú
  toggle.addEventListener('click', ()=>{
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });
  
  // Tancar menú quan es fa clic en un link
  menu.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
  
  // Tancar menú si es fa clic fora
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.navbar')){
      toggle.classList.remove('active');
      menu.classList.remove('active');
    }
  });
})();
