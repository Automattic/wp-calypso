/**
 *  This file is served as-is as /service-worker.js
 **/

/* eslint-disable */
'use strict';
/* eslint-enable */

var queuedMessages = [];

/**
 *  We want to make sure that if the service worker gets updated that we
 *  immediately claim it, to ensure we're not running stale versions of the worker
 *	See: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
 **/

self.addEventListener( 'install', function( event ) {
	event.waitUntil( self.skipWaiting() );
} );

self.addEventListener( 'activate', function( event ) {
	event.waitUntil( self.clients.claim() );
} );

self.addEventListener( 'push', function( event ) {
	var notification;

	if ( typeof event.data !== 'object' && typeof event.data.json !== 'function' ) {
		return;
	}

	notification = event.data.json();

	event.waitUntil(
		self.registration.showNotification( notification.msg, {
			tag: 'note_' + notification.note_id,
			icon: notification.icon,
			timestamp: notification.note_timestamp,
			data: notification
		} ).then( function () {
			if ( notification.note_opened_pixel ) {
				fetch( notification.note_opened_pixel, { mode: 'no-cors' } ).catch( function( err ) {
					console.log( 'Could not load the pixel %s', notification.note_opened_pixel );
				} );
			}
		} )
	);
} );

self.addEventListener( 'notificationclick', function( event ) {
	var notification = event.notification;
	notification.close();

	event.waitUntil(
		self.clients.matchAll().then( function( clientList ) {
			if ( clientList.length > 0 ) {
				clientList[ 0 ].postMessage( { action: 'openPanel' } );
				clientList[ 0 ].postMessage( { action: 'trackClick', notification: notification.data  } );
				try {
					clientList[ 0 ].focus();
				} catch ( err ) {
					// Client didn't need focus
				}
			} else {
				queuedMessages.push( { action: 'openPanel' } );
				queuedMessages.push( { action: 'trackClick', notification: notification.data } );
				self.clients.openWindow( '/' );
			}
		} )
	);
} );

self.addEventListener( 'message', function( event ) {
	if ( ! ( 'action' in event.data ) ) {
		return;
	}

	switch ( event.data.action ) {
		case 'sendQueuedMessages':
			self.clients.matchAll().then( function( clientList ) {
				var queuedMessage;

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
