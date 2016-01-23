// Taken from:
// https://github.com/GoogleChrome/samples/blob/e4df12c8642381243b6c1710c41394d85b33d82f/service-worker/prefetch/service-worker.js

// While overkill for this specific sample in which there is only one cache,
// this is one best practice that can be followed in general to keep track of
// multiple caches used by a given service worker, and keep them all versioned.
// It maps a shorthand identifier for a cache to a specific, versioned cache name.

// Note that since global state is discarded in between service worker restarts, these
// variables will be reinitialized each time the service worker handles an event, and you
// should not attempt to change their values inside an event handler. (Treat them as constants.)

// If at any point you want to force pages that use this service worker to start using a fresh
// cache, then increment the CACHE_VERSION value. It will kick off the service worker update
// flow and the old cache(s) will be purged as part of the activate event handler when the
// updated service worker is activated.
var CACHE_VERSION = 1;
var CURRENT_CACHES = {
	prefetch: 'calypso-prefetch-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function( event ) {
	var now = Date.now();

	var urlsToPrefetch = [
		'http://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3ZBw1xU1rKptJj_0jans920.woff2',
		'http://fonts.gstatic.com/s/opensans/v13/xjAJXh38I15wypJXxuGMBogp9Q8gbYrhqGlRav_IXfk.woff2',
		'http://fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTRampu5_7CjHW5spxoeN3Vs.woff2',
		'http://fonts.gstatic.com/s/merriweather/v8/RFda8w1V0eDZheqfcyQ4EBampu5_7CjHW5spxoeN3Vs.woff2',
		'http://s1.wp.com/wp-includes/js/tinymce/skins/lightgray/content.min.css',
		'http://s1.wp.com/wp-includes/js/tinymce/skins/lightgray/skin.min.css',
		'https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,400,300,600|Merriweather:700,400,700italic,400italic',
		'https://s1.wp.com/i/noticons/noticons.css?v=20150727',
		'https://s1.wp.com/wp-includes/css/dashicons.css?v=20150727'
	];

	// All of these logging statements should be visible via the "Inspect" interface
	// for the relevant SW accessed via chrome://serviceworker-internals
	console.log( 'Handling install event. Resources to pre-fetch:', urlsToPrefetch );

	event.waitUntil(
		caches.open( CURRENT_CACHES.prefetch).then( function( cache ) {
			var cachePromises = urlsToPrefetch.map( function( urlToPrefetch ) {
				// This constructs a new URL object using the service worker's script location as the base
				// for relative URLs.
				var url = new URL( urlToPrefetch, location.href );
				// Append a cache-bust=TIMESTAMP URL parameter to each URL's query string.
				// This is particularly important when precaching resources that are later used in the
				// fetch handler as responses directly, without consulting the network (i.e. cache-first).
				// If we were to get back a response from the HTTP browser cache for this precaching request
				// then that stale response would be used indefinitely, or at least until the next time
				// the service worker script changes triggering the install flow.
				url.search += ( url.search ? '&' : '?' ) + 'cache-bust=' + now;

				// It's very important to use {mode: 'no-cors'} if there is any chance that
				// the resources being fetched are served off of a server that doesn't support
				// CORS (http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
				// In this example, www.chromium.org doesn't support CORS, and the fetch()
				// would fail if the default mode of 'cors' was used for the fetch() request.
				// The drawback of hardcoding {mode: 'no-cors'} is that the response from all
				// cross-origin hosts will always be opaque
				// (https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#cross-origin-resources)
				// and it is not possible to determine whether an opaque response represents a success or failure
				// (https://github.com/whatwg/fetch/issues/14).
				return fetch( new Request( url, { mode: 'no-cors' } ) ).then( function( response ) {
					if ( response.status >= 400 ) {
						throw new Error( 'request for ' + urlToPrefetch +
							' failed with status ' + response.statusText);
					}

					// Use the original URL without the cache-busting parameter as the key for cache.put().
					return cache.put( urlToPrefetch, response );
				} ).catch( function( error ) {
					console.error( 'Not caching ' + urlToPrefetch + ' due to ' + error );
				} );
			} );

			return Promise.all( cachePromises ).then( function() {
				console.log( 'Pre-fetching complete.' );
			} );
		} ).catch( function( error ) {
			console.error( 'Pre-fetching failed:', error );
		} )
	);
} );

self.addEventListener( 'activate' , function( event ) {
	// Delete all caches that aren't named in CURRENT_CACHES.
	// While there is only one cache in this example, the same logic will handle the case where
	// there are multiple versioned caches.
	var expectedCacheNames = Object.keys( CURRENT_CACHES ).map( function( key ) {
		return CURRENT_CACHES[key];
	} );

	event.waitUntil(
		caches.keys().then( function( cacheNames ) {
			return Promise.all(
				cacheNames.map( function( cacheName ) {
					if ( expectedCacheNames.indexOf( cacheName ) === -1 ) {
						// If this cache name isn't present in the array of "expected" cache names, then delete it.
						console.log( 'Deleting out of date cache:', cacheName );
						return caches.delete( cacheName );
					}
				} )
			);
		} )
	);
} );

self.addEventListener( 'fetch', function( event ) {
	console.log( 'Handling fetch event for', event.request.url );

	event.respondWith(
		// caches.match() will look for a cache entry in all of the caches available to the service worker.
		// It's an alternative to first opening a specific named cache and then matching on that.
		caches.match( event.request ).then( function( response ) {
			if ( response ) {
				console.log( 'Found response in cache:', response );

				return response;
			}

			console.log( 'No response found in cache. About to fetch from network...' );

			// event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
			// have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
			return fetch( event.request ).then( function( response ) {
				console.log( 'Response from network is:', response );

				return response;
			} ).catch( function( error ) {
				// This catch() will handle exceptions thrown from the fetch() operation.
				// Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
				// It will return a normal response object that has the appropriate error code set.
				console.error( 'Fetching failed:', error );

				throw error;
			} );
		} )
	);
} );