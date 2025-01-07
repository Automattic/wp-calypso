import { isEnabled } from '@automattic/calypso-config';
import page, { Context as PageJSContext } from '@automattic/calypso-router';
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
import domainManagementController from 'calypso/my-sites/domains/domain-management/controller';
import {
	DOMAIN_OVERVIEW,
	EMAIL_MANAGEMENT,
} from 'calypso/my-sites/domains/domain-management/domain-overview-pane/constants';
import emailController from 'calypso/my-sites/email/controller';
import {
	DOTCOM_HOSTING_CONFIG,
	DOTCOM_OVERVIEW,
} from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { hostingOverview, hostingConfiguration, hostingActivate } from './controller';

function registerSiteDomainPage( { path, controllers }: { path: string; controllers: any[] } ) {
	page(
		path,
		domainManagementController.domainManagementSiteContext,
		siteSelection,
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfP2,
		redirectIfJetpackNonAtomic,
		navigation,
		...controllers,
		siteDashboard( undefined ),
		makeLayout,
		clientRender
	);
}

export default function () {
	page( '/overview', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/overview/:site', ( context: PageJSContext ) => {
			page.redirect( `/sites/overview/${ context.params.site }` );
		} );
	} else {
		page(
			'/overview/:site',
			siteSelection,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			redirectIfCurrentUserCannot( 'manage_options' ),
			redirectIfP2,
			redirectIfJetpackNonAtomic,
			navigation,
			hostingOverview,
			siteDashboard( DOTCOM_OVERVIEW ),
			makeLayout,
			clientRender
		);
	}

	page( '/hosting-config', siteSelection, sites, makeLayout, clientRender );

	if ( isEnabled( 'untangling/hosting-menu' ) ) {
		page( '/hosting-config/:site', ( context: PageJSContext ) => {
			page.redirect( `/sites/tools/${ context.params.site }` );
		} );
	} else {
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

	// Domain pages under site overview's context.
	registerSiteDomainPage( {
		path: '/overview/site-domain/domain/:domain/:site',
		controllers: [
			domainManagementController.domainManagementV2,
			domainManagementController.domainManagementPaneView( DOMAIN_OVERVIEW ),
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/email/:domain/:site',
		controllers: [
			emailController.emailManagement,
			domainManagementController.domainManagementPaneView( EMAIL_MANAGEMENT ),
		],
	} );
}
