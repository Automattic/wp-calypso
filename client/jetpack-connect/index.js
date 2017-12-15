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
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	const user = userFactory();
	const isLoggedOut = ! user.get();

	page(
		'/jetpack/connect/:type(personal|premium|pro)/:interval(yearly|monthly)?',
		controller.connect,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/:type(install)/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect,
		makeLayout,
		clientRender
	);

	page( '/jetpack/connect', controller.connect, makeLayout, clientRender );

	page(
		'/jetpack/connect/authorize/:localeOrInterval?',
		controller.maybeOnboard,
		controller.redirectWithoutLocaleifLoggedIn,
		controller.authorizeForm,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/authorize/:interval/:locale',
		controller.maybeOnboard,
		controller.redirectWithoutLocaleifLoggedIn,
		controller.authorizeForm,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/store/:interval(yearly|monthly)?',
		controller.plansLanding,
		makeLayout,
		clientRender
	);

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
		controller.plansSelection,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/:locale?',
		controller.redirectWithoutLocaleifLoggedIn,
		controller.connect,
		makeLayout,
		clientRender
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso, makeLayout, clientRender );
	page( '/jetpack/sso/*', controller.sso, makeLayout, clientRender );
	page( '/jetpack/new', controller.newSite, makeLayout, clientRender );
	page( '/jetpack/new/*', '/jetpack/connect' );
}
