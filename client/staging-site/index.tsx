import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { handleHostingPanelRedirect } from 'calypso/my-sites/hosting/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_STAGING_SITE } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { renderStagingSite } from './controller';

export default function () {
	page( '/staging-site', siteSelection, sites, makeLayout, clientRender );

	page(
		'/staging-site/:site',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		renderStagingSite,
		siteDashboard( DOTCOM_STAGING_SITE ),
		makeLayout,
		clientRender
	);
}
