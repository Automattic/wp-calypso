/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import domainManagementController from './domain-management/controller';
import controller from './controller';
import SiftScience from 'lib/siftscience';
import config from 'config';
import * as paths from './paths';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	SiftScience.recordUser();

	page( paths.emailManagement(), siteSelection, sites, makeLayout, clientRender );

	registerMultiPage( {
		paths: [ paths.emailManagement( ':site', ':domain' ), paths.emailManagement( ':site' ) ],
		handlers: [
			...getCommonHandlers( { noSitePath: paths.emailManagement() } ),
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
			...getCommonHandlers(),
			controller.emailManagementAddGSuiteUsers,
			makeLayout,
			clientRender,
		],
	} );

	page(
		paths.emailManagementForwarding( ':site', ':domain' ),
		...getCommonHandlers(),
		controller.emailManagementForwarding,
		makeLayout,
		clientRender
	);
}
