/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
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

	registerMultiPage( {
		paths: [
			paths.emailManagementAddGSuiteUsers(
				':site',
				':domain',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementAddGSuiteUsers( ':site', ':domain' ),
			paths.emailManagementAddGSuiteUsers( ':site' ),
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
			paths.emailManagementAddGSuiteUsersLegacy( ':site', ':domain' ),
			paths.emailManagementAddGSuiteUsersLegacy( ':site' ),
		],
		handlers: [ controller.emailManagementAddGSuiteUsersLegacyRedirect ],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementNewGSuiteAccount(
				':site',
				':domain',
				':planType',
				paths.emailManagementAllSitesPrefix
			),
			paths.emailManagementNewGSuiteAccount( ':site', ':domain', ':planType' ),
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
			paths.emailManagementForwarding( ':site', ':domain', paths.emailManagementAllSitesPrefix ),
			paths.emailManagementForwarding( ':site', ':domain' ),
		],
		handlers: [ ...commonHandlers, controller.emailManagementForwarding, makeLayout, clientRender ],
	} );
}
