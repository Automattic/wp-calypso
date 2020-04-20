/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import controller from './controller';
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'controller';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( ( path ) => page( path, ...handlers ) );
}

const commonHandlers = [ siteSelection, navigation ];

export default function () {
	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );

	registerMultiPage( {
		paths: [ paths.emailManagement( ':site', ':domain' ), paths.emailManagement( ':site' ) ],
		handlers: [ ...commonHandlers, controller.emailManagement, makeLayout, clientRender ],
	} );

	registerMultiPage( {
		paths: [
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

	page(
		paths.emailManagementNewGSuiteAccount( ':site', ':domain', ':planType' ),
		...commonHandlers,
		controller.emailManagementNewGSuiteAccount,
		makeLayout,
		clientRender
	);

	page(
		paths.emailManagementForwarding( ':site', ':domain' ),
		...commonHandlers,
		controller.emailManagementForwarding,
		makeLayout,
		clientRender
	);
}
