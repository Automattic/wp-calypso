/**
 *  This file is served as-is as /service-worker.js
 *  @TODO: Change this :)
 **/

/* eslint-disable */
'use strict';
/* eslint-enable */

self.addEventListener( 'push', function( event ) {
	console.log( 'Received a push message', event );

	event.waitUntil(
		self.registration.showNotification( 'Title', {
			body: 'Body',
			tag: 'Tag'
		} )
	);
} );
