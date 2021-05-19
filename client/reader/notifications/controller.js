/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';

export function notifications( context, next ) {
	context.primary = (
		<AsyncLoad
			require="calypso/reader/notifications/main"
			key="notifications"
			title="Notifications"
		/>
	);

	next();
}
