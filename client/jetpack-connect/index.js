import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { OFFER_RESET_FLOW_TYPES } from 'calypso/jetpack-connect/flow-types';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { siteSelection } from 'calypso/my-sites/controller';
import jetpackPlans from 'calypso/my-sites/plans/jetpack-plans';
import { jetpackUpsell } from 'calypso/my-sites/plans/jetpack-plans/jetpack-upsell';
import * as controller from './controller';

import './style.scss';

export default function () {
	const locale = getLanguageRouteParam( 'locale' );

	const legacyPlans = [ 'personal', 'premium', 'pro' ].join( '|' );

	page(
		`/jetpack/connect/:type(${ legacyPlans })/:interval(yearly|monthly)?/${ locale }`,
		controller.redirectToCloudPricingPage
	);

	const planTypeString = [
		'backup',
		'scan',
		'realtimebackup',
		'antispam',
		'jetpack_search',
		'wpcom_search',
		...OFFER_RESET_FLOW_TYPES,
	].join( '|' );

	page(
		`/jetpack/connect/:type(${ planTypeString })/:interval(yearly|monthly)?/${ locale }`,
		controller.redirectToSiteLessCheckout,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.loginBeforeJetpackSearch,
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/install',
		controller.setMasterbar,
		controller.credsForm,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect',
		controller.persistMobileAppFlow,
		controller.setMasterbar,
		controller.connect,
		makeLayout,
		clientRender
	);

	page(
		`/jetpack/connect/authorize/${ locale }`,
		controller.redirectWithoutLocaleIfLoggedIn,
		controller.setMasterbar,
		controller.authorizeOrSignup,
		makeLayout,
		clientRender
	);

	page(
		'/jetpack/connect/instructions',
		controller.setMasterbar,
		controller.instructions,
		makeLayout,
		clientRender
	);

	jetpackUpsell( `/jetpack/connect/store`, controller.offerResetContext );
	jetpackPlans( `/jetpack/connect/store`, controller.offerResetContext );

	page(
		'/jetpack/connect/:_(akismet|plans|vaultpress)/:interval(yearly|monthly)?',
		( { params } ) =>
			page.redirect( `/jetpack/connect/store${ params.interval ? '/' + params.interval : '' }` )
	);

	jetpackPlans(
		`/jetpack/connect/plans`,
		controller.redirectToLoginIfLoggedOut,
		siteSelection,
		controller.partnerCouponRedirects,
		controller.offerResetRedirects,
		controller.offerResetContext
	);
	jetpackUpsell(
		`/jetpack/connect/plans`,
		controller.redirectToLoginIfLoggedOut,
		siteSelection,
		controller.partnerCouponRedirects,
		controller.offerResetRedirects,
		controller.offerResetContext
	);

	// Redirect /jetpack/connect/plans/complete/* to /jetpack/connect/plans
	// See https://github.com/Automattic/wp-calypso/pull/74558
	page( '/jetpack/connect/plans/complete', '/jetpack/connect/plans' );
	page( '/jetpack/connect/plans/complete/*', '/jetpack/connect/plans' );

	page( '/jetpack/sso/:siteId?/:ssoNonce?', controller.sso, makeLayout, clientRender );
	page( '/jetpack/sso/*', controller.sso, makeLayout, clientRender );

	// The /jetpack/new route previously allowed to create a .com site and
	// connect a Jetpack site. The redirect rule will skip this page and take
	// the user directly to the .com site creation flow.
	// See https://github.com/Automattic/wp-calypso/issues/45486

	// For some reason, the first redirection below redirects `/jetpack/connect` to `/jetpack/new` in Jetpack cloud.
	if ( ! isJetpackCloud() ) {
		page( '/jetpack/new', '/start' );
		page( '/jetpack/new/*', '/jetpack/connect' );
	}
}
