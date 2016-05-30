/**
 *  This file is served as-is as /service-worker.js
 **/

/* eslint-disable */
'use strict';
/* eslint-enable */

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
