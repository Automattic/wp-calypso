/**
 *  This file is served as-is as /service-worker.js
 **/

/* eslint-disable */
'use strict';
/* eslint-enable */

self.addEventListener( 'install', function( event ) {
	event.waitUntil( self.skipWaiting() );
} );

self.addEventListener( 'activate', function( event ) {
	event.waitUntil( self.clients.claim() );
} );

self.addEventListener( 'push', function( event ) {
	if ( typeof event.data !== 'object' && typeof event.data.json !== 'function' ) {
		return;
	}

	var notification = event.data.json();

	event.waitUntil(
		self.registration.showNotification( notification.msg, {
			tag: 'note_' + notification.note_id,
			icon: notification.icon,
			timestamp: notification.note_timestamp
		} )
	);
} );

self.addEventListener( 'notificationclick', function( event ) {
	event.notification.close();

	event.waitUntil(
		self.clients.matchAll().then( function( clientList ) {
			var promise;
			if ( 0 === clientList.length ) {
				self.clients.openWindow( '/' );
				
				promise = new Promise( function( resolve ) {
					setTimeout( function() {
						resolve( self.clients.matchAll() );
					}, 2500 );
				} );

				return promise;
			}
			return clientList;
		} ).then( function( clientList ) {
			console.log( clientList );
			if ( clientList.length > 0 ) {
				clientList[0].postMessage( {
					action: 'openPanel'
				} );
				try {
					clientList[0].focus();
				} catch( e ) {}
			}
		} )
	);
} );
