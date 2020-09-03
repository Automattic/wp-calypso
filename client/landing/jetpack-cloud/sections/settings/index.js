/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, sites } from 'my-sites/controller';
import {
	settings,
	hostSelection,
	credentials,
	withTop,
	settingsToHostSelection,
} from 'landing/jetpack-cloud/sections/settings/controller';
import {
	settingsPath,
	settingsHostSelectionPath,
	settingsCredentialsPath,
} from 'lib/jetpack/paths';
import { isEnabled } from 'config';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

export default function () {
	if ( isJetpackCloud() ) {
		if ( isEnabled( 'jetpack/server-credentials-advanced-flow' ) ) {
			page( settingsPath( ':site' ), settingsToHostSelection );

			page(
				settingsHostSelectionPath(),
				siteSelection,
				sites,
				navigation,
				makeLayout,
				clientRender
			);
			page(
				settingsHostSelectionPath( ':site' ),
				siteSelection,
				navigation,
				hostSelection,
				withTop,
				makeLayout,
				clientRender
			);

			page(
				settingsCredentialsPath( ':site', ':host' ),
				siteSelection,
				navigation,
				credentials,
				withTop,
				makeLayout,
				clientRender
			);
		} else {
			page( settingsPath(), siteSelection, sites, navigation, makeLayout, clientRender );
			page(
				settingsPath( ':site' ),
				siteSelection,
				navigation,
				settings,
				makeLayout,
				clientRender
			);
		}
	}
}
