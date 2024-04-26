import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfCurrentUserCannot,
	render as clientRender,
} from 'calypso/controller';
import { globalSiteLayout, navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_HOSTING_CONFIG_ACTIVATE,
} from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import { handleHostingPanelRedirect, layout, activationLayout } from './controller';

export default function () {
	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );
	page(
		'/hosting-config/:site_id',
		siteSelection,
		navigation,
		redirectIfCurrentUserCannot( 'manage_options' ),
		handleHostingPanelRedirect,
		layout,
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
		activationLayout,
		globalSiteLayout( DOTCOM_HOSTING_CONFIG, DOTCOM_HOSTING_CONFIG_ACTIVATE ),
		makeLayout,
		clientRender
	);
}
