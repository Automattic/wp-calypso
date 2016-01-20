//Refactored example from http://www.html5rocks.com/en/tutorials/service-worker/introduction/
//Needs work.

var CACHE_NAME = 'CALYPSO';
var urlsToCache = [
];

//Here are going to be regexes of stuff we want to cache.
var pathsToCache = [];

// Set the callback for the install step
self.addEventListener( 'install', function( event ) {
	// Perform install steps
	console.log( 'installing service worker', event );
} );

self.addEventListener('fetch', function(event) {
console.log( 'calling service worker', event.request.url);
	//TODO: fof every url that doesent match pathsToCache, just exit
  event.respondWith(
	caches.match(event.request)
	  .then(function(response) {
		// Cache hit - return response
		if (response) {
			console.log('cache hit', response.url);
		  return response;
		}

		// IMPORTANT: Clone the request. A request is a stream and
		// can only be consumed once. Since we are consuming this
		// once by cache and once by the browser for fetch, we need
		// to clone the response
		var fetchRequest = event.request.clone();

		return fetch(fetchRequest).then(
		  function(response) {
			// Check if we received a valid response
			if(!response || response.status !== 200 || response.type !== 'basic') {
			  return response;
			}

			// IMPORTANT: Clone the response. A response is a stream
			// and because we want the browser to consume the response
			// as well as the cache consuming the response, we need
			// to clone it so we have 2 stream.
			var responseToCache = response.clone();
			
			console.log('CACHING', responseToCache);

			caches.open(CACHE_NAME)
			  .then(function(cache) {
				cache.put(event.request, responseToCache);
			  });

			return response;
		  }
		);
	  })
	);
});
