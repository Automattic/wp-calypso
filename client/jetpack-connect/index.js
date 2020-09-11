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
import { shouldShowOfferResetFlow } from 'lib/abtest/getters';
import { getLanguageRouteParam } from 'lib/i18n-utils';
import plansV2 from 'my-sites/plans-v2';
import { OFFER_RESET_FLOW_TYPES } from 'state/jetpack-connect/constants';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	const user = userFactory();
	const isLoggedOut = ! user.get();
	const locale = getLanguageRouteParam( 'locale' );

	const planTypeString = [
		'personal',
		'premium',
		'pro',
		'backup',
		'scan',
		'realtimebackup',
		'antispam',
		'jetpack_search',
		'wpcom_search',
		...OFFER_RESET_FLOW_TYPES,
	].join( '|' );

	page(
		`/jetpack/connect/:type(${ planTypeString })/:interval(yearly|monthly)?`,
		controller.loginBeforeJetpackSearch,
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
			`/jetpack/connect/:type(install)/${ locale }`,
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
			`/jetpack/connect/authorize/${ locale }`,
			controller.setMasterbar,
			controller.signupForm,
			makeLayout,
			clientRender
		);
	} else {
		page(
			`/jetpack/connect/authorize/${ locale }`,
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

	if ( shouldShowOfferResetFlow() ) {
		plansV2( `/jetpack/connect/store`, controller.offerResetContext );
	} else {
		page(
			`/jetpack/connect/store/:interval(yearly|monthly)?/${ locale }`,
			controller.setLoggedOutLocale,
			controller.plansLanding,
			makeLayout,
			clientRender
		);
	}

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

	if ( shouldShowOfferResetFlow() ) {
		plansV2( `/jetpack/connect/plans`, siteSelection, controller.offerResetContext );
	} else {
		page(
			'/jetpack/connect/plans/:interval(yearly|monthly)?/:site',
			siteSelection,
			controller.plansSelection,
			makeLayout,
			clientRender
		);
	}

	page(
		`/jetpack/connect/:type(${ planTypeString })?/${ locale }`,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso, makeLayout, clientRender );
	page( '/jetpack/sso/*', controller.sso, makeLayout, clientRender );
	// The /jetpack/new route previously allowed to create a .com site and
	// connect a Jetpack site. The redirect rule will skip this page and take
	// the user directly to the .com site creation flow.
	// See https://github.com/Automattic/wp-calypso/issues/45486
	// TODO: should we leave these redirection rules?
	page( '/jetpack/new', config( 'signup_url' ) );
	page( '/jetpack/new/*', '/jetpack/connect' );
}
