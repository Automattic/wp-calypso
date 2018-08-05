/**
 * /* eslint-disable no-console
 *
 * @format
 */

/**
 * WARNING: DO NOT USE ES2015+ OR COMMONJS. This file is served as-is and isn't
 * transpiled by Babel or bundled by Webpack.
 */

/* eslint-disable */
'use strict';
/* eslint-enable */

const queuedMessages = [];
const CACHE_VERSION = 'v1';
const OFFLINE_CALYPSO_URLS = [ '/offline', '/calypso/images/illustrations/error.svg' ];

/**
 *  We want to make sure that if the service worker gets updated that we
 *  immediately claim it, to ensure we're not running stale versions of the worker
 *	See: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
 **/
self.addEventListener( 'install', function( event ) {
	// The promise that skipWaiting() returns can be safely ignored.
	self.skipWaiting();

	event.waitUntil( cacheUrls( OFFLINE_CALYPSO_URLS, true ) );
} );

self.addEventListener( 'activate', function( event ) {
	event.waitUntil(
		Promise.all( [
			// https://developers.google.com/web/updates/2017/02/navigation-preload
			self.registration.navigationPreload && self.registration.navigationPreload.enable(),
			// Calling clients.claim() here sets the Service Worker as the controller of the client pages.
			// This allows the pages to start using the Service Worker immediately without reloading.
			// https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
			self.clients.claim(),
			clearOldCaches(),
		] )
	);
} );

function sendMessages( messages, focus ) {
	focus = focus || false;
	return self.clients.matchAll().then( function( clientList ) {
		if ( clientList.length > 0 ) {
			messages.forEach( function( message ) {
				clientList[ 0 ].postMessage( message );
			} );
			if ( focus ) {
				try {
					clientList[ 0 ].focus();
				} catch ( err ) {
					// Client didn't need focus
				}
			}
		} else {
			messages.forEach( function( message ) {
				queuedMessages.push( message );
			} );
			if ( focus ) {
				self.clients.openWindow( '/' );
			}
		}
	} );
}

self.addEventListener( 'push', function( event ) {
	let notification;

	if ( typeof event.data !== 'object' && typeof event.data.json !== 'function' ) {
		return;
	}

	notification = event.data.json();

	event.waitUntil(
		self.registration
			.showNotification( notification.msg, {
				tag: 'note_' + notification.note_id,
				icon: notification.icon,
				timestamp: notification.note_timestamp,
				data: notification,
			} )
			.then( function() {
				if ( notification.note_opened_pixel ) {
					fetch( notification.note_opened_pixel, { mode: 'no-cors' } ).catch( function() {
						console.log( 'Could not load the pixel %s', notification.note_opened_pixel ); //eslint-disable-line no-console
					} );
				}
			} )
	);
} );

self.addEventListener( 'notificationclick', function( event ) {
	const notification = event.notification;
	notification.close();

	event.waitUntil(
		sendMessages(
			[ { action: 'openPanel' }, { action: 'trackClick', notification: notification.data } ],
			true
		)
	);
} );

self.addEventListener( 'message', function( event ) {
	if ( ! ( 'action' in event.data ) ) {
		return;
	}

	switch ( event.data.action ) {
		case 'sendQueuedMessages':
			self.clients.matchAll().then( function( clientList ) {
				let queuedMessage;

				if ( clientList.length > 0 ) {
					queuedMessage = queuedMessages.shift();
					while ( queuedMessage ) {
						clientList[ 0 ].postMessage( queuedMessage );
						queuedMessage = queuedMessages.shift();
					}
				}
			} );
			break;
	}
} );

self.addEventListener( 'fetch', function( event ) {
	const request = event.request;

	if ( request.method !== 'GET' ) {
		return;
	}

	if ( request.mode === 'navigate' ) {
		event.respondWith( fetchNetworkFirst( request, '/offline' ) );
		event.waitUntil( cacheAssets() );
		return;
	}

	if ( isCacheable( request.url ) ) {
		if ( ! navigator.onLine ) {
			event.respondWith( fetchCacheFirst( request ) );
		} else {
			// Always get the freshest resource to avoid having to reload the page twice on code change.
			// It may cause inconsistencies in the cache as some assets are not fetched on page load.
			event.respondWith( fetchNetworkFirst( request ) );
		}
	}
} );

// periodically check that assets are up to date
function cacheAssets() {
	if ( ! navigator.onLine || ! self.registration.active ) {
		return Promise.resolve();
	}

	// Do not cache assets if bandwidth is less than 10Mb/s
	const downlink = self.navigator.connection.downlink || 1;
	if ( downlink < 10 ) {
		return cacheUrls( OFFLINE_CALYPSO_URLS, true );
	}

	return getAssetsHashFromCache().then( previousHash => {
		return getAssets().then( function( response ) {
			if ( previousHash !== response.hash ) {
				return clearCache().then( function() {
					return Promise.all( [
						cacheUrls( response.assets ),
						cacheUrls( OFFLINE_CALYPSO_URLS, true ),
					] );
				} );
			}
		} );
	} );
}

/* eslint-disable */
function isCacheable( url ) {
	var urlObject;

	if ( ! url ) {
		return false;
	}

	if ( url[ 0 ] === '/' ) {
		url = location.origin + url;
	}

	try {
		urlObject = new URL( url );
	} catch ( err ) {
		// malformed url
		return false;
	}

	return (
		urlObject.origin === location.origin &&
		urlObject.pathname.match( /\.(json|js|css|svg|gif|png|woff2?|ttf|eot|wav)$/ ) &&
		! urlObject.pathname.match( /__webpack_hmr$|^\/socket\.io\/|^\/version$|\/flags\/[a-z]+\.svg$/ )
	);
}
/* eslint-enable */

function fetchCacheFirst( request ) {
	const url = request.url || request;
	return caches.open( CACHE_VERSION ).then( function( cache ) {
		return caches.match( request ).then( function( cachedResponse ) {
			if ( cachedResponse ) {
				return cachedResponse;
			}

			return fetch( request )
				.then( function( networkResponse ) {
					if ( isCacheable( url ) ) {
						cache.put( request, networkResponse.clone() );
					}
					return networkResponse;
				} )
				.catch( function() {
					// if cache and network failed, try cache one more time without query parameters
					return caches.match( request, { ignoreSearch: true } );
				} );
		} );
	} );
}

function fetchNetworkFirst( request, fallback /* = null */ ) {
	const url = request.url || request;
	return caches.open( CACHE_VERSION ).then( function( cache ) {
		return fetch( request )
			.then( function( networkResponse ) {
				if ( isCacheable( url ) ) {
					cache.put( request, networkResponse.clone() );
				}
				return networkResponse;
			} )
			.catch( function() {
				return cache.match( request ).then( function( cachedResponse ) {
					if ( cachedResponse ) {
						return cachedResponse;
					}
					if ( fallback ) {
						return caches.match( fallback );
					}
					return Promise.reject();
				} );
			} );
	} );
}

function getAssets() {
	return fetchNetworkFirst( '/calypso/assets.json' ).then( function( response ) {
		return response.json();
	} );
}

function getAssetsHashFromCache() {
	return caches.open( CACHE_VERSION ).then( function( cache ) {
		return cache.match( '/calypso/assets.json' ).then( function( cachedResponse ) {
			if ( ! cachedResponse ) {
				return null;
			}

			return cachedResponse.json().then( function( json ) {
				return json.hash;
			} );
		} );
	} );
}

function cacheUrls( urls, force ) {
	force = force || false;
	return caches.open( CACHE_VERSION ).then( function( cache ) {
		// resolve all assets
		return cache.addAll( force ? urls : urls.filter( isCacheable ) );
	} );
}

function clearOldCaches() {
	return self.caches.keys().then( function( cacheNames ) {
		return Promise.all(
			cacheNames.map( function( cacheName ) {
				if ( CACHE_VERSION !== cacheName ) {
					return self.caches.delete( cacheName );
				}
			} )
		);
	} );
}

function clearCache() {
	return self.caches.delete( CACHE_VERSION );
}
