import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
	maybeRedirectToMultiSiteDashboard,
} from 'calypso/controller';
import { setupPreferences } from 'calypso/controller/preferences';
import { handleHostingPanelRedirect } from 'calypso/hosting/server-settings/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { STAGING_SITE } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import { stagingSite } from './controller';

export default function () {
	page( '/staging-site', siteSelection, sites, makeLayout, clientRender );

	page(
		'/staging-site/:site',
		siteSelection,
		setupPreferences,
		maybeRedirectToMultiSiteDashboard(
			( params: Record< string, string > ) => `/sites/${ params.site }`
		),
		navigation,
		redirectToHostingFeaturesIfNotAtomic,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		stagingSite,
		siteDashboard( STAGING_SITE ),
		makeLayout,
		clientRender
	);
}
