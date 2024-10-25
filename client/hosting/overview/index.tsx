import page, { Callback } from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfCurrentUserCannot,
	redirectToHostingPromoIfNotAtomic,
	redirectIfP2,
	redirectIfJetpackNonAtomic,
} from 'calypso/controller';
import { handleHostingPanelRedirect } from 'calypso/hosting/server-settings/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import {
	DOTCOM_HOSTING_CONFIG,
	SITE_OVERVIEW,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { hostingOverview, hostingConfiguration, hostingActivate } from './controller';

export default function () {
	const redirectSiteOverview: Callback = ( context ) => {
		context.page.replace( `/sites/overview/${ context.params.site }` );
	};
	page( '/overview/:site', redirectSiteOverview );
	page(
		'/sites/overview/:site',
		siteSelection,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfP2,
		redirectIfJetpackNonAtomic,
		navigation,
		hostingOverview,
		siteDashboard( SITE_OVERVIEW ),
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
		redirectToHostingPromoIfNotAtomic,
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
		redirectToHostingPromoIfNotAtomic,
		handleHostingPanelRedirect,
		hostingActivate,
		siteDashboard( DOTCOM_HOSTING_CONFIG ),
		makeLayout,
		clientRender
	);
}
