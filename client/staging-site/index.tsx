import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
	redirectToHostingPromoIfNotAtomic,
} from 'calypso/controller';
import { DOTCOM_STAGING_SITE } from 'calypso/hosting/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/hosting/sites/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { handleHostingPanelRedirect } from 'calypso/my-sites/hosting/controller';
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
