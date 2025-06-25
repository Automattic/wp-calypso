import config from '@automattic/calypso-config';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
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
import page from '@automattic/calypso-router';
import { getLocaleFromPath, removeLocaleFromPath } from '@automattic/i18n-utils';
import { JETPACK_PRICING_PAGE } from '@automattic/urls';
import Debug from 'debug';
import { get, some, startsWith } from 'lodash';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { navigate } from 'calypso/lib/navigate';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { startAuthorizeStep } from 'calypso/state/jetpack-connect/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/actions';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackAuthorize from './authorize';
import {
	ALLOWED_MOBILE_APP_REDIRECT_URL_LIST,
	CALYPSO_PLANS_PAGE,
	CALYPSO_REDIRECTION_PAGE,
	JETPACK_ADMIN_PATH,
	JETPACK_COUPON_PARTNERS,
	JETPACK_COUPON_PRESET_MAPPING,
	JPC_PATH_CHECKOUT,
} from './constants';
import { OFFER_RESET_FLOW_TYPES } from './flow-types';
import InstallInstructions from './install-instructions';
import JetpackConnect from './main';
import NoDirectAccessError from './no-direct-access-error';
import {
	isCalypsoStartedConnection,
	persistMobileRedirect,
	retrieveMobileRedirect,
	storePlan,
} from './persistence-utils';
import OrgCredentialsForm from './remote-credentials';
import SearchPurchase from './search';
import JetpackSignup from './signup';
import JetpackSsoForm from './sso';
import StoreHeader from './store-header';
import { parseAuthorizationQuery } from './utils';

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

/**
 * Allow special behavior for Jetpack partner coupons
 *
 * Jetpack Avalon (Infinity) has introduced a Jetpack Partner Coupon API
 * which requires special behavior.
 * This behavior could be a (not yet developed) upsell plans screen where
 * we take the partner coupon discount into account. E.g. a 100% discount
 * for Jetpack Backup, but we want to upsell Security T1 instead, so we
 * show a price for Security where we take the 100% discounted Backup
 * product into account (this makes sense because partners pay us for
 * these coupons).
 * For now we just redirect directly to checkout since we do not have any
 * upsell logic ready and want to avoid confusion by show full price products
 * on the plan page.
 * @todo Should we dynamically fetch partners and presets?
 * @todo Should we make a coupon validation request? If the coupon is invalid, we leave the user on the plans page.
 * @todo Accept partner coupon as a query parameter during the initial auth request (client/jetpack-connect/schema.js).
 *       This should allow us to have more flexible return URLs as well.
 * @todo Fetch the partner coupon with a selector instead (e.g. like: getPartnerIdFromQuery()).
 */
export function partnerCouponRedirects( context, next ) {
	const queryArgs = new URLSearchParams( context?.query?.redirect );
	const partnerCoupon = queryArgs.get( 'partnerCoupon' );

	if ( ! partnerCoupon || ! partnerCoupon.includes( '_' ) ) {
		next();
		return;
	}

	// All partner coupons assumes a logic like {PARTNER}_{PRESET}_abc123.
	// A coupon preset in this context should just be seen as a product but does
	// technically include other options like purchase type, single use etc.
	const splitCoupon = partnerCoupon.split( '_' );

	// Simple coupon verification by:
	//   * Check for 2 underscores in the coupon for partner, preset and unique code.
	//   * Check for allowed coupon partners.
	//   * Check for known coupon presets.
	if (
		splitCoupon.length !== 3 ||
		! JETPACK_COUPON_PARTNERS.includes( splitCoupon[ 0 ] ) ||
		! JETPACK_COUPON_PRESET_MAPPING.hasOwnProperty( splitCoupon[ 1 ] )
	) {
		next();
		return;
	}

	const state = context.store.getState();
	const siteSlug = getSelectedSiteSlug( state );
	const productOrPlan = JETPACK_COUPON_PRESET_MAPPING[ splitCoupon[ 1 ] ];

	return navigate(
		`${ JPC_PATH_CHECKOUT }/${ siteSlug }/${ productOrPlan }?coupon=${ partnerCoupon }`
	);
}

export function offerResetRedirects( context, next ) {
	debug( 'controller: offerResetRedirects', context.params );

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const queryRedirect = context.query.redirect;
	const hasPaidPlan = selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null;
	const isNotJetpack = selectedSite ? ! isJetpackSite( state, selectedSite.ID ) : null;
	const canPurchasePlans = selectedSite
		? canCurrentUser( state, selectedSite.ID, 'manage_options' )
		: true;
	const calypsoStartedConnection = isCalypsoStartedConnection( selectedSite.slug );

	// Redirect AT sites back to wp-admin
	const isAutomatedTransfer = selectedSite
		? isSiteAutomatedTransfer( state, selectedSite.ID )
		: null;
	if ( isAutomatedTransfer ) {
		debug(
			'controller: offerResetRedirects -> redirecting WoA site back to wp-admin',
			context.params
		);
		return navigate( selectedSite.URL + JETPACK_ADMIN_PATH );
	}

	if ( isNotJetpack ) {
		debug(
			'controller: offerResetRedirects -> redirecting to /plans since site is not a Jetpack site',
			context.params
		);
		return page.redirect( CALYPSO_PLANS_PAGE + selectedSite.slug );
	}

	// If current user is not an admin (can't purchase plans), redirect the user to /posts if
	// the connection was started within Calypso, otherwise redirect the user to wp-admin
	if ( ! canPurchasePlans ) {
		if ( calypsoStartedConnection ) {
			debug(
				'controller: offerResetRedirects -> redirecting to /posts/ because Calypso initiated the connection and the user role cannot manage options.'
			);
			return page.redirect( CALYPSO_REDIRECTION_PAGE );
		}

		if ( queryRedirect ) {
			debug(
				"controller: offerResetRedirects -> redirecting to 'redirect' url query arg because user role cannot manage options.",
				queryRedirect
			);
			return navigate( queryRedirect );
		} else if ( selectedSite ) {
			debug(
				'controller: offerResetRedirects -> redirecting to wp-admin because user role cannot manage options.',
				selectedSite.URL + JETPACK_ADMIN_PATH
			);
			return navigate( selectedSite.URL + JETPACK_ADMIN_PATH );
		}
	}

	// If the site already has a paid plan, skip the plans/products page and redirect back to wp-admin.
	if ( hasPaidPlan ) {
		debug(
			'controller: offerResetRedirects -> redirecting to back to wp-admin because site already has a paid plan',
			context.params
		);

		if ( queryRedirect ) {
			return navigate( queryRedirect );
		} else if ( selectedSite ) {
			return navigate( selectedSite.URL + JETPACK_ADMIN_PATH );
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
	const isLoggedIn = isUserLoggedIn( context.store.getState() );
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
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	// Log in to WP.com happens at the start of the flow for Search products
	// ( to facilitate site selection ).
	if ( JETPACK_SEARCH_PRODUCTS.includes( type ) && ! isLoggedIn ) {
		return page( login( { isJetpack: true, redirectTo: path } ) );
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
	recordPageView(
		pathname,
		analyticsPageTitle || 'Jetpack Connect',
		{},
		{
			useJetpackGoogleAnalytics: true,
		}
	);

	// Not clearing the plan here, because other flows can set the cookie before arriving here.
	planSlug && storePlan( planSlug );

	if ( JETPACK_SEARCH_PRODUCTS.includes( type ) ) {
		context.primary = (
			<SearchPurchase
				ctaFrom={ query.cta_from /* origin tracking params */ }
				ctaId={ query.cta_id /* origin tracking params */ }
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
	recordPageView(
		'jetpack/connect/instructions',
		'Jetpack Manual Install Instructions',
		{},
		{
			useJetpackGoogleAnalytics: true,
		}
	);

	const url = context.query.url;
	if ( ! url ) {
		return page.redirect( '/jetpack/connect' );
	}
	context.primary = <InstallInstructions remoteSiteUrl={ url } />;
	next();
}

export function signupForm( context, next ) {
	recordPageView(
		'jetpack/connect/authorize',
		'Jetpack Authorize',
		{},
		{
			useJetpackGoogleAnalytics: true,
		}
	);

	const isLoggedIn = isUserLoggedIn( context.store.getState() );
	const { query } = context;
	const from = query.from;
	if ( from && startsWith( from, 'wpcom-migration' ) ) {
		const urlQueryArgs = {
			redirect_to: context.path,
			from,
		};
		return page( addQueryArgs( urlQueryArgs, '/start/account' ) );
	}

	if ( retrieveMobileRedirect() && ! isLoggedIn ) {
		// Force login for mobile app flow. App will intercept this request and prompt native login.
		return window.location.replace( login( { redirectTo: context.path } ) );
	}

	const transformedQuery = parseAuthorizationQuery( query );

	if ( transformedQuery ) {
		context.store.dispatch( startAuthorizeStep( transformedQuery.clientId ) );

		const { lang } = context.params;
		context.primary = (
			<JetpackSignup path={ context.path } locale={ lang } authQuery={ transformedQuery } />
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
	recordPageView(
		'jetpack/connect/authorize',
		'Jetpack Authorize',
		{},
		{
			useJetpackGoogleAnalytics: true,
		}
	);

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

	recordPageView(
		analyticsBasePath,
		analyticsPageTitle,
		{},
		{
			useJetpackGoogleAnalytics: true,
		}
	);

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

export function authorizeOrSignup( context, next ) {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( isLoggedIn ) {
		authorizeForm( context, next );
		return;
	}

	signupForm( context, next );
}

export function redirectToLoginIfLoggedOut( context, next ) {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	if ( ! isLoggedIn ) {
		page( login( { isJetpack: true, redirectTo: context.path } ) );
		return;
	}

	next();
}

export function redirectToSiteLessCheckout( context, next ) {
	const { type, interval } = context.params;

	const planSlug = getPlanSlugFromFlowType( type, interval );

	const urlQueryArgs = context.query;

	if ( ! JETPACK_SEARCH_PRODUCTS.includes( planSlug ) ) {
		if ( ! urlQueryArgs?.checkoutBackUrl ) {
			urlQueryArgs.checkoutBackUrl = 'https://jetpack.com';
		}

		page( addQueryArgs( urlQueryArgs, `/checkout/jetpack/${ planSlug }` ) );
		return;
	}

	next();
}

export function redirectToCloudPricingPage() {
	window.location.href = JETPACK_PRICING_PAGE;
}
