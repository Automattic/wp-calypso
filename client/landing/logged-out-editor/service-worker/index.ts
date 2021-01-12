/**
 * Internal dependencies
 */
import { createMedia, readMedia } from './media';
import { oembedProxy } from './oembed';

self.addEventListener( 'fetch', ( event: FetchEvent ) => {
	const { url, method } = event.request;
	const { pathname } = new URL( url );

	if ( /^\/wp\/v2\/media$/.test( pathname ) && method === 'POST' ) {
		event.respondWith( createMedia( event.request ) );
		return;
	} else if ( /^\/wp\/v2\/media\/\d+$/.test( pathname ) && method === 'GET' ) {
		event.respondWith( readMedia( event.request ) );
		return;
	} else if ( /^\/oembed\/1\.0\/proxy$/.test( pathname ) && method === 'GET' ) {
		event.respondWith( oembedProxy( event.request ) );
		return;
	}

	// Log an unimplemented endpoints
	if ( /\/wp\//.test( event.request.url ) || /\/oembed\//.test( event.request.url ) ) {
		console.log( 'WORKER: Missing API endpoint intercept', event.request ); // eslint-disable-line no-console
	}
} );
