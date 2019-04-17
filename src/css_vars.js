export default function setup_css_vars(){

  function set_viewport_vars(){
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  }

  window.addEventListener('resize', set_viewport_vars);
  set_viewport_vars();

}
