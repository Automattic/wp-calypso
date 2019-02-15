/** @format */
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
	givenPaths.forEach( path => page( path, ...handlers ) );
}

export default function() {
	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );

	registerMultiPage( {
		paths: [ paths.emailManagement( ':site', ':domain' ), paths.emailManagement( ':site' ) ],
		handlers: [
			[ siteSelection, navigation ],
			controller.emailManagement,
			makeLayout,
			clientRender,
		],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementAddGSuiteUsers( ':site', ':domain' ),
			paths.emailManagementAddGSuiteUsers( ':site' ),
		],
		handlers: [
			[ siteSelection, navigation ],
			controller.emailManagementAddGSuiteUsers,
			makeLayout,
			clientRender,
		],
	} );

	page(
		paths.emailManagementForwarding( ':site', ':domain' ),
		[ siteSelection, navigation ],
		controller.emailManagementForwarding,
		makeLayout,
		clientRender
	);
}
