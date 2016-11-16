var APP = {
  init: function(){
    console.log("Aloha APP");
  }
}

if (document.addEventListener){
  document.addEventListener("DOMContentLoaded", APP.init, false);
} else if (document.attachEvent) {
  document.attachEvent("onreadystatechange", APP.init);
} else {
  window.onload = APP.init;
}
