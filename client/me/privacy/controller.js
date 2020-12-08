/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import userSettings from 'calypso/lib/user-settings';
import PrivacyComponent from 'calypso/me/privacy/main';

export function privacy( context, next ) {
	context.primary = React.createElement( PrivacyComponent, {
		userSettings: userSettings,
	} );
	next();
}
