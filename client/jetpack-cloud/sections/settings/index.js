/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	settings,
	advancedCredentials,
	showNotAuthorizedForNonAdmins,
} from 'calypso/jetpack-cloud/sections/settings/controller';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { isEnabled } from '@automattic/calypso-config';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export default function () {
	if ( isJetpackCloud() ) {
		page( settingsPath(), siteSelection, sites, navigation, makeLayout, clientRender );
		page(
			settingsPath( ':site' ),
			siteSelection,
			navigation,
			isEnabled( 'jetpack/server-credentials-advanced-flow' ) ? advancedCredentials : settings,
			showNotAuthorizedForNonAdmins,
			makeLayout,
			clientRender
		);
	}
}
