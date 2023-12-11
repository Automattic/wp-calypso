import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	advancedCredentials,
	disconnectSite,
	disconnectSiteConfirm,
	showNotAuthorizedForNonAdmins,
	settings,
} from 'calypso/jetpack-cloud/sections/settings/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { confirmDisconnectPath, disconnectPath, settingsPath } from 'calypso/lib/jetpack/paths';
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
		page( disconnectPath( ':site' ), disconnectSite, siteSelection, makeLayout, clientRender );
		page(
			confirmDisconnectPath( ':site' ),
			disconnectSiteConfirm,
			siteSelection,
			makeLayout,
			clientRender
		);
	}
}
