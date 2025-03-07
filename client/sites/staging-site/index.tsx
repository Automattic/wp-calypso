import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { handleHostingPanelRedirect } from 'calypso/hosting/server-settings/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DOTCOM_STAGING_SITE } from 'calypso/sites/components/site-preview-pane/constants';
import { redirectToHostingFeaturesIfNotAtomic, siteDashboard } from 'calypso/sites/controller';
import { stagingSite } from './controller';

export default function () {
	page( '/staging-site', siteSelection, sites, makeLayout, clientRender );

	page(
		'/staging-site/:site',
		siteSelection,
		navigation,
		redirectToHostingFeaturesIfNotAtomic,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		stagingSite,
		siteDashboard( DOTCOM_STAGING_SITE ),
		makeLayout,
		clientRender
	);
}
