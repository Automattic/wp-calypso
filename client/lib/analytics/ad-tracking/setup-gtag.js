export function setupGtag() {
	if ( window.dataLayer && window.gtag ) {
		return;
	}
	window.dataLayer = window.dataLayer || [];
	window.gtag = function () {
		window.dataLayer.push( arguments );
	};
	window.gtag( 'js', new Date() );
}
