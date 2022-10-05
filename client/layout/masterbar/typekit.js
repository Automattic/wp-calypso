/* global Typekit */

if ( typeof document !== 'undefined' && process.env.NODE_ENV !== 'test' ) {
	// Load fonts - https://helpx.adobe.com/fonts/using/embed-codes.html
	( function ( d ) {
		const config = {
			kitId: 'ivy2obh',
			scriptTimeout: 3000,
			async: true,
		};
		const h = d.documentElement;
		const t = setTimeout( function () {
			h.className = h.className.replace( /\bwf-loading\b/g, '' ) + ' wf-inactive';
		}, config.scriptTimeout );
		const tk = d.createElement( 'script' );
		let f = false;
		const s = d.getElementsByTagName( 'script' )[ 0 ];
		let a;

		h.className += ' wf-loading';
		tk.src = 'https://use.typekit.net/' + config.kitId + '.js';
		tk.async = true;
		tk.onload = tk.onreadystatechange = function () {
			a = this.readyState;
			if ( f || ( a && 'complete' !== a && 'loaded' !== a ) ) {
				return;
			}
			f = true;
			clearTimeout( t );
			try {
				Typekit.load( config );
			} catch ( e ) {}
		};
		s.parentNode.insertBefore( tk, s );
	} )( document );
}
