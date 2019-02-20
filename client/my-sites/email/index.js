/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import * as paths from './paths';

function registerMultiPage( { paths: givenPaths, handlers } ) {
	givenPaths.forEach( path => page( path, ...handlers ) );
}

export default function() {
	page( paths.emailManagement(), controller.emailManagementRedirect );

	registerMultiPage( {
		paths: [ paths.emailManagement( ':site', ':domain' ), paths.emailManagement( ':site' ) ],
		handlers: [ controller.emailManagementRedirect ],
	} );

	registerMultiPage( {
		paths: [
			paths.emailManagementAddGSuiteUsers( ':site', ':domain' ),
			paths.emailManagementAddGSuiteUsers( ':site' ),
		],
		handlers: [ controller.emailManagementAddGSuiteUsersRedirect ],
	} );

	page(
		paths.emailManagementForwarding( ':site', ':domain' ),
		controller.emailManagementForwardingRedirect
	);
}
