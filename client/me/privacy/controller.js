/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import PrivacyComponent from 'me/privacy/main';

export function privacy( context, next ) {
	context.primary = React.createElement( PrivacyComponent, {
		userSettings: userSettings,
	} );
	next();
}
