/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
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
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	if ( config.isEnabled( 'jetpack/connect/remote-install' ) ) {
		page(
			'/jetpack/connect/install',
			controller.setMasterbar,
			controller.credsForm,
			makeLayout,
			clientRender
		);
	} else {
		page(
			'/jetpack/connect/:type(install)/:locale?',
			controller.redirectWithoutLocaleIfLoggedIn,
			controller.persistMobileAppFlow,
			controller.setMasterbar,
			controller.connect,
			makeLayout,
			clientRender
		);
	}

	page(
		'/jetpack/connect',
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	if ( isLoggedOut ) {
		page(
			'/jetpack/connect/authorize/:localeOrInterval?',
			controller.maybeOnboard,
			controller.setMasterbar,
			controller.signupForm,
			makeLayout,
			clientRender
		);

		page(
			'/jetpack/connect/authorize/:interval/:locale',
			controller.maybeOnboard,
			controller.setMasterbar,
			controller.signupForm,
			makeLayout,
			clientRender
		);
	} else {
		page(
			'/jetpack/connect/authorize/:localeOrInterval?',
			controller.maybeOnboard,
			controller.redirectWithoutLocaleIfLoggedIn,
			controller.setMasterbar,
			controller.authorizeForm,
			makeLayout,
			clientRender
		);

		page(
			'/jetpack/connect/authorize/:interval/:locale',
			controller.maybeOnboard,
			controller.redirectWithoutLocaleIfLoggedIn,
			controller.setMasterbar,
			controller.authorizeForm,
			makeLayout,
			clientRender
		);
	}

	page(
		'/jetpack/connect/instructions',
		controller.setMasterbar,
		controller.instructions,
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
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso, makeLayout, clientRender );
	page( '/jetpack/sso/*', controller.sso, makeLayout, clientRender );
	page( '/jetpack/new', controller.newSite, makeLayout, clientRender );
	page( '/jetpack/new/*', '/jetpack/connect' );
}
