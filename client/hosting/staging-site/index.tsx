import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { handleHostingPanelRedirect } from 'calypso/hosting/server-settings/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { DOTCOM_STAGING_SITE } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { renderStagingSite } from './controller';

export default function () {
	page( '/staging-site', siteSelection, sites, makeLayout, clientRender );

	page(
		'/staging-site/:site',
		siteSelection,
		navigation,
		redirectToHostingPromoIfNotAtomic,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		renderStagingSite,
		siteDashboard( DOTCOM_STAGING_SITE ),
		makeLayout,
		clientRender
	);
}
