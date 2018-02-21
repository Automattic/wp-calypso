/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import PrivacyComponent from 'me/privacy/main';

export default function privacyController( context, next ) {
	context.primary = React.createElement( PrivacyComponent, {
		userSettings: userSettings,
	} );
	next();
}
