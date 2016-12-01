require('autotrack/lib/plugins/impression-tracker.js');
require('autotrack/lib/plugins/outbound-link-tracker.js');

var isMobile = require('./utilities.js').isMobile;
var debounce = require('./utilities.js').debounce;

var app = {
  init: function(){
    app.sayHi();
    app.lockMobileVH();
    app.bindEventHandlers();
  },

  /**
   * Just for fun
   */
  sayHi: function() {
    try {
      console.log("Sup fellow dev 👋", "You can view this site's source code here: https://github.com/swieder227/swieder-home");
    } catch (err) {
      console.error(err);
    }
  },

  /**
   * Prevents page jump when mobile chrome/safari url bar moves,
   * by setting inline height value on 100vh .full-page elements
   */
  lockMobileVH: function() {
    var is_mobile = isMobile();
    var pages = document.querySelectorAll(".full-page");

    pages.forEach(function(page) {
      if(is_mobile){
        page.style.minHeight = page.offsetHeight + "px";
      } else {
        page.style.minHeight = "";
      }
    });
  },

  /**
   * Setup global events
   */
  bindEventHandlers: function() {
    window.addEventListener( 'resize', debounce(app.lockMobileVH, 500, false), false );
  }
}

/**
 * Initialize on DOM load
 */
if (document.addEventListener){
  document.addEventListener("DOMContentLoaded", app.init, false);
} else if (document.attachEvent) {
  document.attachEvent("onreadystatechange", app.init);
} else {
  window.onload = APP.init;
}
