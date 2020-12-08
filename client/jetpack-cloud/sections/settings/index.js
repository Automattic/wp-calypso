/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { settings, advancedCredentials } from 'calypso/jetpack-cloud/sections/settings/controller';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { isEnabled } from 'calypso/config';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function () {
	if ( isJetpackCloud() ) {
		page( settingsPath(), siteSelection, sites, navigation, makeLayout, clientRender );
		page(
			settingsPath( ':site' ),
			siteSelection,
			navigation,
			isEnabled( 'jetpack/server-credentials-advanced-flow' ) ? advancedCredentials : settings,
			makeLayout,
			clientRender
		);
	}
}
