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
function getCommonHandlers() {
	// function getCommonHandlers( { noSitePath = paths.emailManagement(), warnIfJetpack = true } = {} ) {
	const handlers = [ siteSelection, navigation ];

	// 	if ( noSitePath ) {
	// 		handlers.push( domainsController.redirectIfNoSite( noSitePath ) );
	// 	}

	// 	if ( warnIfJetpack ) {
	// 		handlers.push( domainsController.jetpackNoDomainsWarning );
	// 	}

	return handlers;
}

export default function() {
	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );
	// page(paths.domainManagementEmail(), siteSelection, sites, makeLayout, clientRender);

	registerMultiPage( {
		paths: [ paths.emailManagement( ':site', ':domain' ), paths.emailManagement( ':site' ) ],
		handlers: [ ...getCommonHandlers(), controller.emailManagement, makeLayout, clientRender ],
	} );

	// registerMultiPage({
	// 	paths: [
	// 		paths.domainManagementEmail(':site', ':domain'),
	// 		paths.domainManagementEmail(':site'),
	// 	],
	// 	handlers: [
	// 		...getCommonHandlers({ noSitePath: paths.domainManagementEmail() }),
	// 		domainManagementController.domainManagementEmail,
	// 		makeLayout,
	// 		clientRender,
	// 	],
	// });

	registerMultiPage( {
		paths: [
			paths.emailManagementAddGSuiteUsers( ':site', ':domain' ),
			paths.emailManagementAddGSuiteUsers( ':site' ),
		],
		handlers: [
			...getCommonHandlers(),
			controller.emailManagementAddGSuiteUsers,
			makeLayout,
			clientRender,
		],
	} );

	// registerMultiPage({
	// 	paths: [
	// 		paths.domainManagementAddGSuiteUsers(':site', ':domain'),
	// 		paths.domainManagementAddGSuiteUsers(':site'),
	// 	],
	// 	handlers: [
	// 		...getCommonHandlers(),
	// 		domainManagementController.domainManagementAddGSuiteUsers,
	// 		makeLayout,
	// 		clientRender,
	// 	],
	// });

	page(
		paths.emailManagementForwarding( ':site', ':domain' ),
		...getCommonHandlers(),
		controller.emailManagementForwardingRedirect,
		makeLayout,
		clientRender
	);

	// page(
	// 	paths.domainManagementEmailForwarding(':site', ':domain'),
	// 	...getCommonHandlers(),
	// 	domainManagementController.domainManagementEmailForwarding,
	// 	makeLayout,
	// 	clientRender
	// );
}
