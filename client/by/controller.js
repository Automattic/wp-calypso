/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Profile from './profile';
import { recordPageView, renderPage } from 'lib/react-helpers';

export function profile( context ) {
	const { username } = context.params;

	recordPageView(
		'/by/:username',
		translate( 'Profile' ),
		username
	);

	renderPage(
		context,
		<Profile
			username={ username } />
	);
}
