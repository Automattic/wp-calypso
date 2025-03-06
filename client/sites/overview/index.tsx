import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfJetpackNonAtomic,
	redirectIfP2,
	redirectIfCurrentUserCannot,
} from 'calypso/controller';
import { siteSelection, sites, navigation } from 'calypso/my-sites/controller';
import domainManagementController from 'calypso/my-sites/domains/domain-management/controller';
import {
	DOMAIN_OVERVIEW,
	EMAIL_MANAGEMENT,
} from 'calypso/my-sites/domains/domain-management/domain-overview-pane/constants';
import {
	ADD_MAILBOX,
	DNS_RECORDS,
	ADD_DNS_RECORD,
	EDIT_DNS_RECORD,
	ADD_FORWARDING_EMAIL,
	COMPARE_EMAIL_PROVIDERS,
	EDIT_CONTACT_INFO,
} from 'calypso/my-sites/domains/domain-management/subpage-wrapper/subpages';
import emailController from 'calypso/my-sites/email/controller';
import { DOTCOM_OVERVIEW } from 'calypso/sites/components/site-preview-pane/constants';
import { siteDashboard } from 'calypso/sites/controller';
import { overview } from './controller';

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

	page(
		'/overview/:site',
		siteSelection,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		redirectIfCurrentUserCannot( 'manage_options' ),
		redirectIfP2,
		redirectIfJetpackNonAtomic,
		navigation,
		overview,
		siteDashboard( DOTCOM_OVERVIEW ),
		makeLayout,
		clientRender
	);

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

	registerSiteDomainPage( {
		path: '/overview/site-domain/email/:domain/titan/new/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( ADD_MAILBOX ),
			emailController.emailManagementNewTitanAccount,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/domain/:domain/dns/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( DNS_RECORDS ),
			domainManagementController.domainManagementDns,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/domain/:domain/dns/add/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( ADD_DNS_RECORD ),
			domainManagementController.domainManagementDnsEditRecord,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/domain/:domain/dns/edit/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( EDIT_DNS_RECORD ),
			domainManagementController.domainManagementDnsEditRecord,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/contact-info/edit/:domain/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( EDIT_CONTACT_INFO ),
			domainManagementController.domainManagementEditContactInfo,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/email/:domain/forwarding/add/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( ADD_FORWARDING_EMAIL ),
			emailController.emailManagementAddEmailForwards,
			domainManagementController.domainManagementSubpageView,
		],
	} );

	registerSiteDomainPage( {
		path: '/overview/site-domain/email/:domain/compare/:site',
		controllers: [
			domainManagementController.domainManagementSubpageParams( COMPARE_EMAIL_PROVIDERS ),
			emailController.emailManagementInDepthComparison,
			domainManagementController.domainManagementSubpageView,
		],
	} );
}
