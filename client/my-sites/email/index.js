/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import controller from './controller';
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'calypso/controller';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( ( path ) => page( path, ...handlers ) );
}

const commonHandlers = [ siteSelection, navigation ];

export default function () {
	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );

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
			paths.emailManagementNewGSuiteAccount(
				':site',
				':domain',
				productType,
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementNewGSuiteAccount( ':site', ':domain', productType ),
		],
		handlers: [
			...commonHandlers,
			controller.emailManagementNewGSuiteAccount,
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
			paths.emailManagementForwarding( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.emailManagementForwarding( ':site', ':domain' ),
		],
		handlers: [ ...commonHandlers, controller.emailManagementForwarding, makeLayout, clientRender ],
	} );
}
