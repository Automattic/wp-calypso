/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import * as controller from './controller';
import { login } from 'lib/paths';
import { siteSelection } from 'my-sites/controller';

export default function() {
	const user = userFactory();
	const isLoggedOut = ! user.get();

	page(
		'/jetpack/connect/:type(personal|premium|pro)/:interval(yearly|monthly)?',
		controller.connect
	);

	page(
		'/jetpack/connect/:type(install)/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

	page( '/jetpack/connect', controller.connect );

	page(
		'/jetpack/connect/authorize/:localeOrInterval?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page(
		'/jetpack/connect/authorize/:interval/:locale',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.saveQueryObject,
		controller.authorizeForm
	);

	page( '/jetpack/connect/store/:interval(yearly|monthly)?', controller.plansLanding );

	page(
		'/jetpack/connect/:_(akismet|plans|vaultpress)/:interval(yearly|monthly)?',
		( { params } ) =>
			page.redirect( `/jetpack/connect/store${ params.interval ? '/' + params.interval : '' }` )
	);

	if ( isLoggedOut ) {
		page( '/jetpack/connect/plans/:interval(yearly|monthly)?/:site', ( { path } ) =>
			page.redirect( login( { isNative: true, redirectTo: path } ) )
		);
	}

	page(
		'/jetpack/connect/plans/:interval(yearly|monthly)?/:site',
		siteSelection,
		controller.plansSelection
	);

	page(
		'/jetpack/connect/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso );
	page( '/jetpack/sso/*', controller.sso );
	page( '/jetpack/new', controller.newSite );
	page( '/jetpack/new/*', '/jetpack/connect' );
}
