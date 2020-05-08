/**
 * External dependencies
 */
import page from 'page';
import * as FullStory from '@fullstory/browser';

/**
 * Internal dependencies
 */
import config from 'config';
import { TRACKING_IDS } from 'lib/analytics/ad-tracking/constants';

import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';
import { settings } from 'landing/jetpack-cloud/sections/settings/controller';

export default function () {
	if ( config.isEnabled( 'jetpack-cloud/settings' ) ) {
		FullStory.init( { orgId: TRACKING_IDS.jetpackCloudFullStory } );
		page( '/settings', siteSelection, sites, navigation, makeLayout, clientRender );
		page( '/settings/:site', siteSelection, navigation, settings, makeLayout, clientRender );
	}
}
