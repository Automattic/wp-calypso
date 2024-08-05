import '@automattic/calypso-polyfills';
import page from 'page';

page( '/', ( ctx, next ) => {
	const body = document.getElementsByTagName( 'body' )[ 0 ];
	const header = document.createElement( 'h1' );
	header.innerHTML = 'Hello Calypso Lite!';
	body.appendChild( header );
	next();
} );

page.start();
