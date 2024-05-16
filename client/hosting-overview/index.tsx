import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { handleHostingPanelRedirect } from 'calypso/my-sites/hosting/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { hostingOverview, hostingConfiguration, hostingActivate } from './controller';

export default function () {
	page( '/overview', siteSelection, sites, makeLayout, clientRender );
	page(
		'/overview/:site',
		siteSelection,
		navigation,
		hostingOverview,
		siteDashboard( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);

	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );

	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		hostingConfiguration,
		siteDashboard( DOTCOM_HOSTING_CONFIG ),
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		hostingActivate,
		siteDashboard( DOTCOM_HOSTING_CONFIG ),
		makeLayout,
		clientRender
	);
}
