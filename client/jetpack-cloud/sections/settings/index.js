/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { settings, advancedCredentials } from 'jetpack-cloud/sections/settings/controller';
import { settingsPath } from 'lib/jetpack/paths';
import { isEnabled } from 'config';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

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
