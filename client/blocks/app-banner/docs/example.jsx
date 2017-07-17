/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import AppBanner from '../';
import { PREFERENCE_NAME } from '../utils';
import { savePreference } from 'state/preferences/actions';

function AppBannerExample( clearPreference ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/app-banner">App Banner</a>
			</h2>
			<AppBanner userAgent="android" />
			<Button onClick={ clearPreference }>Reset Dismiss Preference</Button>
		</div>
	);
}

const ConnectedAppBannerExample = connect(
	null,
	{ clearPreference: savePreference( PREFERENCE_NAME, null ) }
)( AppBannerExample );

ConnectedAppBannerExample.displayName = 'AppBannerExample';

export default ConnectedAppBannerExample;
