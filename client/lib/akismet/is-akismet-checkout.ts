/*
    The function isAkismetCheckout() is used to determine if the current page is a Akismet checkout page. 
    It always returns false on the server side as window object is not available there (assumption that checkout pages are not rendered server-side).
 */
const isAkismetCheckout = () =>
	'undefined' !== typeof document && window.location.pathname.startsWith( '/checkout/akismet' );

export default isAkismetCheckout;
