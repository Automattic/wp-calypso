//Refactored example from http://www.html5rocks.com/en/tutorials/service-worker/introduction/
//Needs work.

var CACHE_NAME = 'CALYPSO';
var urlsToCache = [
	'http://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2',
	'http://fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBogp9Q8gbYrhqGlRav_IXfk.woff2',
	'http://fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTRampu5_7CjHW5spxoeN3Vs.woff2',
	'http://fonts.gstatic.com/s/merriweather/v8/RFda8w1V0eDZheqfcyQ4EBampu5_7CjHW5spxoeN3Vs.woff2'
];

//Here are going to be regexes of stuff we want to cache.
var pathsToCache = [
];

// Set the callback for the install step
self.addEventListener( 'install', function( event ) {
	// Perform install steps
	event.waitUntil(
		caches.open( CACHE_NAME )
		.then( function( cache ) {
			console.log( '[CACHE] preloading ', urlsToCache );
			return cache.addAll( urlsToCache );
		} )
	);
} );

self.addEventListener( 'fetch', function( event ) {
	if ( event.request.url.indexOf( 'version' ) !== -1 || event.request.url.indexOf( 'sw.js' ) !== -1 ) {
		return;
	}

	event.respondWith(
	caches.match( event.request )
	.then( function( response ) {
		// Cache hit - return response
		if ( response ) {
			console.log( '[CACHE] hit', response.url );
			return response;
		}
	} )
	);
} );
