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
	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );

	page(
		paths.emailManagementMailboxes(),
		siteSelection,
		emailMailboxesSiteSelectionHeader,
		sites,
		makeLayout,
		clientRender
	);

	page(
		paths.emailManagementMailboxes( ':site' ),
		...commonHandlers,
		controller.emailManagementMailboxes,
		makeLayout,
		clientRender
	);

	registerMultiPage( {
		paths: [
			paths.emailManagement( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.emailManagement( ':site', ':domain' ),
			paths.emailManagement( ':site' ),
		],
		handlers: [ ...commonHandlers, controller.emailManagement, makeLayout, clientRender ],
	} );

	const productType = `:productType(${ GOOGLE_WORKSPACE_PRODUCT_TYPE }|${ GSUITE_PRODUCT_TYPE })`;

	registerMultiPage( {
		paths: [
			paths.emailManagementAddEmailForwards(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementAddEmailForwards( ':site', ':domain' ),
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
			paths.emailManagementAddGSuiteUsers(
				':site',
				':domain',
				productType,
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementAddGSuiteUsers( ':site', ':domain', productType ),
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
			paths.emailManagementManageTitanAccount(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementManageTitanAccount( ':site', ':domain' ),
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
			paths.emailManagementManageTitanMailboxes(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementManageTitanMailboxes( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementManageTitanMailboxes,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [ paths.emailManagementInDepthComparison( ':site', ':domain' ) ],
		handlers: [
			...commonHandlers,
			controller.emailManagementInDepthComparison,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementPurchaseNewEmailAccount(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementPurchaseNewEmailAccount( ':site', ':domain' ),
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
			paths.emailManagementNewTitanAccount(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementNewTitanAccount( ':site', ':domain' ),
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
			paths.emailManagementTitanSetUpMailbox(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementTitanSetUpMailbox( ':site', ':domain' ),
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
			paths.emailManagementTitanControlPanelRedirect(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementTitanControlPanelRedirect( ':site', ':domain' ),
		],
		// Note that we don't have the commonHandlers here, as we want to avoid the nav bar etc
		handlers: [ controller.emailManagementTitanControlPanelRedirect, makeLayout, clientRender ],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementTitanSetUpThankYou(
				':site',
				':domain',
				null,
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementTitanSetUpThankYou( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementTitanSetUpThankYou,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementForwarding( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.emailManagementForwarding( ':site', ':domain' ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementForwardingRedirect,
			makeLayout,
			clientRender,
		],
	} );
}
