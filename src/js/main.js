require('autotrack/lib/plugins/impression-tracker.js');
require('autotrack/lib/plugins/outbound-link-tracker.js');

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
