/**
 *  This file is served as-is as /service-worker.js
 *  @TODO: Change this :)
 **/

/* eslint-disable */
'use strict';
/* eslint-enable */

self.addEventListener( 'push', function( event ) {
	var notification = event.data.json();

	event.waitUntil(
		// notifications look best with just a title
		self.registration.showNotification( notification.msg, {
			tag: 'note_' + notification.note_id,
			icon: notification.icon,
			timestamp: notification.note_timestamp,
		} )
	);
} );
