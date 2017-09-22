export default function loadCSS( url ) {
	const link = Object.assign( document.createElement( 'link' ), {
		rel: 'stylesheet',
		type: 'text/css',
		href: url
	} );

	document.head.appendChild( link );
}
