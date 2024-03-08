import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import {
	navigation,
	siteSelection,
	stagingSiteNotSupportedRedirect,
	sites,
} from 'calypso/my-sites/controller';
import controller from './controller';
import * as paths from './paths';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( ( path ) => page( path, ...handlers ) );
}

const commonHandlers = [ siteSelection, navigation, stagingSiteNotSupportedRedirect ];

const emailMailboxesSiteSelectionHeader = ( context, next ) => {
	context.getSiteSelectionHeaderText = () => {
		return translate( 'Select a site to open {{strong}}My Mailboxes{{/strong}}', {
			components: {
				strong: <strong />,
			},
		} );
	};

	next();
};

export default function () {
	page( paths.getEmailManagementPath(), siteSelection, sites, makeLayout, clientRender );

	page(
		paths.getMailboxesPath(),
		siteSelection,
		emailMailboxesSiteSelectionHeader,
		sites,
		makeLayout,
		clientRender
	);

	page(
		paths.getMailboxesPath( ':site' ),
		...commonHandlers,
		controller.emailManagementMailboxes,
		makeLayout,
		clientRender
	);

	registerMultiPage( {
		paths: [
			paths.getEmailManagementPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getEmailManagementPath( ':site', ':domain' ),
			paths.getEmailManagementPath( ':site' ),
		],
		handlers: [ ...commonHandlers, controller.emailManagement, makeLayout, clientRender ],
	} );

	const productType = `:productType(${ GOOGLE_WORKSPACE_PRODUCT_TYPE }|${ GSUITE_PRODUCT_TYPE })`;

	registerMultiPage( {
		paths: [
			paths.getAddEmailForwardsPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getAddEmailForwardsPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementAddEmailForwards,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getAddGSuiteUsersPath(
				':site',
				':domain',
				productType,
				paths.emailManagementAllSitesPrefix
			),
			paths.getAddGSuiteUsersPath( ':site', ':domain', productType ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementAddGSuiteUsers,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getManageTitanAccountPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getManageTitanAccountPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementManageTitanAccount,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getManageTitanMailboxesPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getManageTitanMailboxesPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementManageTitanMailboxes,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [ paths.getEmailInDepthComparisonPath( ':site', ':domain' ) ],
		handlers: [
			...commonHandlers,
			controller.emailManagementInDepthComparison,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getPurchaseNewEmailAccountPath(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.getPurchaseNewEmailAccountPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementPurchaseNewEmailAccount,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getNewTitanAccountPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getNewTitanAccountPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementNewTitanAccount,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getTitanSetUpMailboxPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getTitanSetUpMailboxPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementTitanSetUpMailbox,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.getTitanControlPanelRedirectPath(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.getTitanControlPanelRedirectPath( ':site', ':domain' ),
		],
		// Note that we don't have the commonHandlers here, as we want to avoid the nav bar etc
		handlers: [ controller.emailManagementTitanControlPanelRedirect, makeLayout, clientRender ],
	} );

	registerMultiPage( {
		paths: [
			paths.getForwardingPath( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.getForwardingPath( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementForwardingRedirect,
			makeLayout,
			clientRender,
		],
	} );
}
