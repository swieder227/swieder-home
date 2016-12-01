/**
 * Returns if viewport is mobile
 * Current implementation uses CSS to diplay/hide a div, this makes CSS-JS match
 * @return {Boolean} true == mobile, false == !modile
 */
exports.isMobile = function isMobile(){
  return window.getComputedStyle(document.getElementById("mobile-detect")).display === 'none';
};

/**
 * Debouncing takes a rapidly firing fn (i.e. window.onresize), and
 * return a fn that evokes only once after a certain time threshold
 * @param  {Function} func - the function to debounce
 * @param  {Number} threshold - time in ms to wait before invoking func
 * @param  {Boolean} execAsap - if true, will also fire once immediately at beginning
 * @return {Function} new debounced function
 */
exports.debounce = function debounce(func, threshold, execAsap) {
    var timeout;
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null;
        }
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
        timeout = setTimeout(delayed, threshold || 100);
    };
};
