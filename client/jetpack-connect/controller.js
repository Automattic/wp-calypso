/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import page from 'page';
import { get, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordPageView } from 'calypso/lib/analytics/page-view';
import config from '@automattic/calypso-config';
import InstallInstructions from './install-instructions';
import JetpackAuthorize from './authorize';
import JetpackConnect from './main';
import JetpackSignup from './signup';
import JetpackSsoForm from './sso';
import NoDirectAccessError from './no-direct-access-error';
import OrgCredentialsForm from './remote-credentials';
import SearchPurchase from './search';
import StoreHeader from './store-header';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getLocaleFromPath, removeLocaleFromPath } from 'calypso/lib/i18n-utils';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/actions';
import { OFFER_RESET_FLOW_TYPES } from './flow-types';
import {
	ALLOWED_MOBILE_APP_REDIRECT_URL_LIST,
	CALYPSO_PLANS_PAGE,
	CALYPSO_REDIRECTION_PAGE,
	JETPACK_ADMIN_PATH,
} from './constants';
import { login } from 'calypso/lib/paths';
import { parseAuthorizationQuery } from './utils';
import {
	clearPlan,
	isCalypsoStartedConnection,
	persistMobileRedirect,
	retrieveMobileRedirect,
	retrievePlan,
	storePlan,
} from './persistence-utils';
import { startAuthorizeStep } from 'calypso/state/jetpack-connect/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	getProductFromSlug,
	getJetpackProductDisplayName,
} from '@automattic/calypso-products';
import { externalRedirect } from 'calypso/lib/route/path';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const analyticsPageTitleByType = {
	install: 'Jetpack Install',
	personal: 'Jetpack Connect Personal',
	premium: 'Jetpack Connect Premium',
	pro: 'Jetpack Install Pro',
	realtimebackup: 'Jetpack Realtime Backup',
	backup: 'Jetpack Daily Backup',
	jetpack_search: 'Jetpack Search',
	scan: 'Jetpack Scan Daily',
	antispam: 'Jetpack Anti-spam',
};

export function offerResetRedirects( context, next ) {
	debug( 'controller: offerResetRedirects', context.params );

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	// Redirect AT sites back to wp-admin
	const isAutomatedTransfer = selectedSite
		? isSiteAutomatedTransfer( state, selectedSite.ID )
		: null;
	if ( isAutomatedTransfer ) {
		debug( 'controller: offerResetRedirects -> redirecting WoA back to wp-admin', context.params );
		return externalRedirect( selectedSite.URL + JETPACK_ADMIN_PATH );
	}

	// If site has a paid plan or is not a Jetpack site, redirect to Calypso's Plans page
	const hasPlan = selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null;
	const isNotJetpack = selectedSite ? ! isJetpackSite( state, selectedSite.ID ) : null;
	if ( hasPlan || isNotJetpack ) {
		debug(
			'controller: offerResetRedirects -> redirecting to /plans since site has a plan or is not a Jetpack site',
			context.params
		);
		return externalRedirect( CALYPSO_PLANS_PAGE + selectedSite.slug );
	}

	// If the user previously selected Jetpack Free, redirect them to their wp-admin page
	const storedPlan = retrievePlan();
	clearPlan();
	if ( storedPlan === PLAN_JETPACK_FREE ) {
		debug(
			'controller: offerResetRedirects -> redirecting to wp-admin because the user got here by clicking Jetpack Free',
			context.params
		);
		externalRedirect( context.query.redirect || selectedSite.options.admin_url );
		return;
	}

	// If current user is not an admin (can't purchase plans), redirect the user to /posts if
	// the connection was started within Calypso, otherwise redirect the user to wp-admin
	const canPurchasePlans = selectedSite
		? canCurrentUser( state, selectedSite.ID, 'manage_options' )
		: true;
	const calypsoStartedConnection = isCalypsoStartedConnection( selectedSite.slug );
	if ( ! canPurchasePlans ) {
		if ( calypsoStartedConnection ) {
			return page.redirect( CALYPSO_REDIRECTION_PAGE );
		}

		const queryRedirect = context.query.redirect;
		if ( queryRedirect ) {
			externalRedirect( queryRedirect );
		} else if ( selectedSite ) {
			externalRedirect( selectedSite.URL + JETPACK_ADMIN_PATH );
		}
	}

	// Display the Jetpack Connect Plans grid
	next();
}

export function offerResetContext( context, next ) {
	debug( 'controller: offerResetContext', context.params );
	context.header = <StoreHeader urlQueryArgs={ context.query } />;

	next();
}

const getPlanSlugFromFlowType = ( type, interval = 'yearly' ) => {
	// Return early if `type` is already a real product slug that is part
	// of the Offer Reset flow.
	if ( OFFER_RESET_FLOW_TYPES.includes( type ) ) {
		return type;
	}

	const planSlugs = {
		yearly: {
			personal: PLAN_JETPACK_PERSONAL,
			premium: PLAN_JETPACK_PREMIUM,
			pro: PLAN_JETPACK_BUSINESS,
			realtimebackup: PRODUCT_JETPACK_BACKUP_REALTIME,
			backup: PRODUCT_JETPACK_BACKUP_DAILY,
			jetpack_search: PRODUCT_JETPACK_SEARCH,
			scan: PRODUCT_JETPACK_SCAN,
			antispam: PRODUCT_JETPACK_ANTI_SPAM,
		},
		monthly: {
			personal: PLAN_JETPACK_PERSONAL_MONTHLY,
			premium: PLAN_JETPACK_PREMIUM_MONTHLY,
			pro: PLAN_JETPACK_BUSINESS_MONTHLY,
			realtimebackup: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
			backup: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
			jetpack_search: PRODUCT_JETPACK_SEARCH_MONTHLY,
			scan: PRODUCT_JETPACK_SCAN_MONTHLY,
			antispam: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		},
	};

	return get( planSlugs, [ interval, type ], '' );
};

export function redirectWithoutLocaleIfLoggedIn( context, next ) {
	debug( 'controller: redirectWithoutLocaleIfLoggedIn', context.params );
	const isLoggedIn = !! getCurrentUserId( context.store.getState() );
	if ( isLoggedIn && getLocaleFromPath( context.path ) ) {
		const urlWithoutLocale = removeLocaleFromPath( context.path );
		debug( 'redirectWithoutLocaleIfLoggedIn to %s', urlWithoutLocale );
		return page.redirect( urlWithoutLocale );
	}

	next();
}

export function persistMobileAppFlow( context, next ) {
	debug( 'controller: persistMobileAppFlow', context.params );
	const { query } = context;
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		if (
			some( ALLOWED_MOBILE_APP_REDIRECT_URL_LIST, ( pattern ) =>
				pattern.test( query.mobile_redirect )
			)
		) {
			debug( `In mobile app flow with redirect url: ${ query.mobile_redirect }` );
			persistMobileRedirect( query.mobile_redirect );
		} else {
			persistMobileRedirect( '' );
		}
	}
	next();
}

export function setMasterbar( context, next ) {
	debug( 'controller: setMasterbar', context.params );
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		const masterbarToggle = retrieveMobileRedirect() ? hideMasterbar() : showMasterbar();
		context.store.dispatch( masterbarToggle );
	}
	next();
}

export function loginBeforeJetpackSearch( context, next ) {
	debug( 'controller: loginBeforeJetpackSearch', context.params );
	const { params, path } = context;
	const { type } = params;
	const isLoggedOut = ! getCurrentUserId( context.store.getState() );

	// Log in to WP.com happens at the start of the flow for Search products
	// ( to facilitate site selection ).
	if ( JETPACK_SEARCH_PRODUCTS.includes( type ) && isLoggedOut ) {
		return page( login( { isNative: true, isJetpack: true, redirectTo: path } ) );
	}
	next();
}

export function connect( context, next ) {
	debug( 'controller: connect', context.params );
	const { path, pathname, params, query } = context;
	const { type = false, interval } = params;
	const planSlug = getPlanSlugFromFlowType( type, interval );

	// If `type` doesn't exist in `analyticsPageTitleByType`, we try to get the name of the
	// product from its slug (if we have one). If none of these options work, we use 'Jetpack Connect'
	// as the default value.
	let analyticsPageTitle = analyticsPageTitleByType[ type ];
	if ( ! analyticsPageTitle && planSlug ) {
		const product = getProductFromSlug( planSlug );
		analyticsPageTitle = getJetpackProductDisplayName( product );
	}
	recordPageView( pathname, analyticsPageTitle || 'Jetpack Connect' );

	// Not clearing the plan here, because other flows can set the cookie before arriving here.
	planSlug && storePlan( planSlug );

	if ( JETPACK_SEARCH_PRODUCTS.includes( type ) ) {
		context.primary = (
			<SearchPurchase
				ctaFrom={ query.cta_from /* origin tracking params */ }
				ctaId={ query.cta_id /* origin tracking params */ }
				locale={ params.locale }
				path={ path }
				type={ type }
				url={ query.url }
			/>
		);
	} else {
		context.primary = (
			<JetpackConnect
				ctaFrom={ query.cta_from /* origin tracking params */ }
				ctaId={ query.cta_id /* origin tracking params */ }
				locale={ params.locale }
				path={ path }
				type={ type }
				url={ query.url }
				queryArgs={ query }
				forceRemoteInstall={ query.forceInstall }
			/>
		);
	}

	next();
}

export function instructions( context, next ) {
	recordPageView( 'jetpack/connect/instructions', 'Jetpack Manual Install Instructions' );

	const url = context.query.url;
	if ( ! url ) {
		return page.redirect( '/jetpack/connect' );
	}
	context.primary = <InstallInstructions remoteSiteUrl={ url } />;
	next();
}

export function signupForm( context, next ) {
	recordPageView( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	const isLoggedIn = !! getCurrentUserId( context.store.getState() );
	if ( retrieveMobileRedirect() && ! isLoggedIn ) {
		// Force login for mobile app flow. App will intercept this request and prompt native login.
		return window.location.replace( login( { isNative: true, redirectTo: context.path } ) );
	}

	const { query } = context;
	const transformedQuery = parseAuthorizationQuery( query );

	if ( transformedQuery ) {
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );

		const { locale } = context.params;
		context.primary = (
			<JetpackSignup path={ context.path } locale={ locale } authQuery={ transformedQuery } />
		);
	} else {
		context.primary = <NoDirectAccessError />;
	}
	next();
}

export function credsForm( context, next ) {
	context.primary = <OrgCredentialsForm />;
	next();
}

export function authorizeForm( context, next ) {
	recordPageView( 'jetpack/connect/authorize', 'Jetpack Authorize' );

	const { query } = context;
	const transformedQuery = parseAuthorizationQuery( query );

	if ( transformedQuery ) {
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );
		context.primary = <JetpackAuthorize authQuery={ transformedQuery } />;
	} else {
		context.primary = <NoDirectAccessError />;
	}
	next();
}

export function sso( context, next ) {
	const analyticsBasePath = '/jetpack/sso';
	const analyticsPageTitle = 'Jetpack SSO';

	recordPageView( analyticsBasePath, analyticsPageTitle );

	context.primary = (
		<JetpackSsoForm
			locale={ context.params.locale }
			path={ context.path }
			siteId={ context.params.siteId }
			ssoNonce={ context.params.ssoNonce }
		/>
	);
	next();
}
