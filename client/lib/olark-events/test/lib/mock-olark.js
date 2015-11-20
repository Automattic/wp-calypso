/**
 * An empty function that at a high level should look like the olark api provided by https://www.olark.com/api
 */
function olark() {

}

olark.configure = function() {};
olark.identify = function() {};

// Defining the global window and window.olark object here will prevent the real olark api located at lib/olark-api
// from being created because it will generate a bunch of javascript errors about missing window and
// window.document. If you look at that code it checkes if window.olark already exists before it tries to
// create it.
GLOBAL.window = GLOBAL;
window.olark = olark;

export default window.olark;
