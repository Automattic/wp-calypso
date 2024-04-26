import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { handleHostingPanelRedirect } from 'calypso/my-sites/hosting/controller';
import globalSiteLayout from 'calypso/sites-dashboard-v2/global-site-layout';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_HOSTING_CONFIG_ACTIVATE,
	DOTCOM_OVERVIEW,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { hostingOverview, hostingConfiguration, hostingActivate } from './controller';

export default function () {
	page( '/hosting', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting/:site',
		siteSelection,
		hostingOverview,
		globalSiteLayout( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);

	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );

	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		hostingConfiguration,
		globalSiteLayout( DOTCOM_HOSTING_CONFIG ),
		makeLayout,
		clientRender
	);

	page(
		'/hosting-config/activate/:site_id',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		hostingActivate,
		globalSiteLayout( DOTCOM_HOSTING_CONFIG, DOTCOM_HOSTING_CONFIG_ACTIVATE ),
		makeLayout,
		clientRender
	);
}
