/*
    The function isJetpackCheckout() is used to determine if the current page is a Jetpack checkout page. 
    It always returns false on the server side as window object is not available there (assumption that checkout pages are not rendered server-side).
 */
const isJetpackCheckout = () =>
	'undefined' !== typeof document && window.location.pathname.startsWith( '/checkout/jetpack' );

export default isJetpackCheckout;
