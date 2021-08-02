import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	settings,
	advancedCredentials,
	showNotAuthorizedForNonAdmins,
} from 'calypso/jetpack-cloud/sections/settings/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';

export default function () {
	if ( isJetpackCloud() ) {
		page( settingsPath(), siteSelection, sites, makeLayout, clientRender );
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
