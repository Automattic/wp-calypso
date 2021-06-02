/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { get, isEmpty } from 'lodash';
import page from 'page';
import debugFactory from 'debug';
import { isJetpackLegacyItem } from '@automattic/calypso-products';

/**
 * Internal Dependencies
 */
import { getDomainOrProductFromContext } from './utils';
import {
	COMPARE_PLANS_QUERY_PARAM,
	LEGACY_TO_RECOMMENDED_MAP,
} from '../plans/jetpack-plans/plan-upgrade/constants';
import { CALYPSO_PLANS_PAGE } from 'calypso/jetpack-connect/constants';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import GSuiteNudge from './gsuite-nudge';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';
import CheckoutSystemDecider from './checkout-system-decider';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import JetpackCheckoutThankYou from './checkout-thank-you/jetpack-checkout-thank-you';
import CheckoutThankYouComponent from './checkout-thank-you';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { setSectionMiddleware } from 'calypso/controller';
import { sites } from 'calypso/my-sites/controller';
import userFactory from 'calypso/lib/user';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	retrieveSignupDestination,
	setSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import UpsellNudge, {
	BUSINESS_PLAN_UPGRADE_UPSELL,
	CONCIERGE_SUPPORT_SESSION,
	CONCIERGE_QUICKSTART_SESSION,
} from './upsell-nudge';
import { MARKETING_COUPONS_KEY } from 'calypso/lib/analytics/utils';
import { TRUENAME_COUPONS } from 'calypso/lib/domains';

const debug = debugFactory( 'calypso:checkout-controller' );

export function checkout( context, next ) {
	const { feature, plan, purchaseId } = context.params;

	const user = userFactory();
	const isLoggedOut = ! user.get();
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const currentUser = getCurrentUser( state );
	const hasSite = currentUser && currentUser.visible_site_count >= 1;
	const isDomainOnlyFlow = context.query?.isDomainOnly === '1';
	const isDisallowedForSitePicker =
		context.pathname.includes( '/checkout/no-site' ) &&
		( isLoggedOut || ! hasSite || isDomainOnlyFlow );
	const jetpackPurchaseToken = context.query.purchasetoken;
	const jetpackPurchaseNonce = context.query.purchaseNonce;
	const isJetpackCheckout =
		context.pathname.includes( '/checkout/jetpack' ) &&
		isLoggedOut &&
		( !! jetpackPurchaseToken || !! jetpackPurchaseNonce );
	const jetpackSiteSlug = context.params.siteSlug;

	// Do not use Jetpack checkout for Jetpack Anti Spam
	if ( 'jetpack_anti_spam' === context.params.productSlug ) {
		page( context.path.replace( '/checkout/jetpack', '/checkout' ) );
		return;
	}

	if ( ! selectedSite && ! isDisallowedForSitePicker && ! isJetpackCheckout ) {
		sites( context, next );
		return;
	}

	const product = isJetpackCheckout
		? context.params.productSlug
		: getDomainOrProductFromContext( context );

	if ( 'thank-you' === product ) {
		return;
	}

	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

	setSectionMiddleware( { name: 'checkout' } )( context );

	// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
	const couponCode = context.query.coupon || context.query.code || getRememberedCoupon();

	const isLoggedOutCart =
		isJetpackCheckout || ( isLoggedOut && context.pathname.includes( '/checkout/no-site' ) );
	const isNoSiteCart =
		isJetpackCheckout ||
		( ! isLoggedOut &&
			context.pathname.includes( '/checkout/no-site' ) &&
			'no-user' === context.query.cart );

	const searchParams = new URLSearchParams( window.location.search );
	const isSignupCheckout = searchParams.get( 'signup' ) === '1';

	// Tracks if checkout page was unloaded before purchase completion,
	// to prevent browser back duplicate sites. Check pau2Xa-1Io-p2#comment-6759.
	if ( isSignupCheckout && ! isDomainOnlyFlow ) {
		window.addEventListener( 'beforeunload', function () {
			const signupDestinationCookieExists = retrieveSignupDestination();
			signupDestinationCookieExists && setSignupCheckoutPageUnloaded( true );
		} );
	}

	context.primary = (
		<CheckoutSystemDecider
			productAliasFromUrl={ product }
			purchaseId={ purchaseId }
			selectedFeature={ feature }
			couponCode={ couponCode }
			isComingFromUpsell={ !! context.query.upgrade }
			plan={ plan }
			selectedSite={ selectedSite }
			redirectTo={ context.query.redirect_to }
			isLoggedOutCart={ isLoggedOutCart }
			isNoSiteCart={ isNoSiteCart }
			isJetpackCheckout={ isJetpackCheckout }
			jetpackSiteSlug={ jetpackSiteSlug }
			jetpackPurchaseToken={ jetpackPurchaseToken || jetpackPurchaseNonce }
		/>
	);

	next();
}

export function redirectJetpackLegacyPlans( context, next ) {
	const product = getDomainOrProductFromContext( context );

	if ( isJetpackLegacyItem( product ) ) {
		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );
		const recommendedItems = LEGACY_TO_RECOMMENDED_MAP[ product ].join( ',' );

		page(
			CALYPSO_PLANS_PAGE +
				( selectedSite?.slug || '' ) +
				`?${ COMPARE_PLANS_QUERY_PARAM }=${ product },${ recommendedItems }`
		);

		return;
	}

	next();
}

export function checkoutPending( context, next ) {
	const orderId = Number( context.params.orderId );
	const siteSlug = context.params.site;

	setSectionMiddleware( { name: 'checkout-thank-you' } )( context );

	context.primary = (
		<CheckoutPendingComponent
			orderId={ orderId }
			siteSlug={ siteSlug }
			redirectTo={ context.query.redirectTo }
		/>
	);

	next();
}

export function checkoutThankYou( context, next ) {
	const receiptId = Number( context.params.receiptId );
	const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const displayMode = get( context, 'query.d' );

	setSectionMiddleware( { name: 'checkout-thank-you' } )( context );

	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) );

	context.primary = (
		<CheckoutThankYouComponent
			receiptId={ receiptId }
			gsuiteReceiptId={ gsuiteReceiptId }
			domainOnlySiteFlow={ isEmpty( context.params.site ) }
			selectedFeature={ context.params.feature }
			redirectTo={ context.query.redirect_to }
			upgradeIntent={ context.query.intent }
			siteUnlaunchedBeforeUpgrade={ context.query.site_unlaunched_before_upgrade === 'true' }
			selectedSite={ selectedSite }
			displayMode={ displayMode }
		/>
	);

	next();
}

export function gsuiteNudge( context, next ) {
	const { domain, site, receiptId } = context.params;
	setSectionMiddleware( { name: 'gsuite-nudge' } )( context );

	const state = context.store.getState();
	const selectedSite =
		getSelectedSite( state ) || getSiteBySlug( state, site ) || getSiteBySlug( state, domain );

	if ( ! selectedSite ) {
		return null;
	}

	if ( ! canUserPurchaseGSuite( context.store.getState() ) ) {
		next();
	}

	context.primary = (
		<CalypsoShoppingCartProvider>
			<GSuiteNudge
				domain={ domain }
				receiptId={ Number( receiptId ) }
				selectedSiteId={ selectedSite.ID }
			/>
		</CalypsoShoppingCartProvider>
	);

	next();
}

export function upsellNudge( context, next ) {
	const { receiptId, site } = context.params;

	let upsellType;
	let upgradeItem;

	if ( context.path.includes( 'offer-quickstart-session' ) ) {
		upsellType = CONCIERGE_QUICKSTART_SESSION;
		upgradeItem = 'concierge-session';
	} else if ( context.path.match( /(add|offer)-support-session/ ) ) {
		upsellType = CONCIERGE_SUPPORT_SESSION;
		upgradeItem = 'concierge-session';
	} else if ( context.path.includes( 'offer-plan-upgrade' ) ) {
		upgradeItem = context.params.upgradeItem;

		switch ( upgradeItem ) {
			case 'business':
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
				break;

			default:
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
		}
	}

	setSectionMiddleware( { name: upsellType } )( context );

	context.primary = (
		<CalypsoShoppingCartProvider>
			<UpsellNudge
				siteSlugParam={ site }
				receiptId={ Number( receiptId ) }
				upsellType={ upsellType }
				upgradeItem={ upgradeItem }
			/>
		</CalypsoShoppingCartProvider>
	);

	next();
}

export function redirectToSupportSession( context ) {
	const { receiptId, site } = context.params;

	// Redirect the old URL structure to the new URL structure to maintain backwards compatibility.
	if ( context.params.receiptId ) {
		page.redirect( `/checkout/offer-support-session/${ receiptId }/${ site }` );
	}
	page.redirect( `/checkout/offer-support-session/${ site }` );
}

export function jetpackCheckoutThankYou( context, next ) {
	const isUserlessCheckoutFlow = context.path.includes( '/checkout/jetpack' );

	context.primary = (
		<JetpackCheckoutThankYou
			site={ context.params.site }
			productSlug={ context.params.product }
			isUserlessCheckoutFlow={ isUserlessCheckoutFlow }
		/>
	);

	next();
}

function getRememberedCoupon() {
	// read coupon list from localStorage, return early if it's not there
	let coupons = null;
	try {
		const couponsJson = window.localStorage.getItem( MARKETING_COUPONS_KEY );
		coupons = JSON.parse( couponsJson );
	} catch ( err ) {}
	if ( ! coupons ) {
		debug( 'No coupons found in localStorage: ', coupons );
		return null;
	}
	const ALLOWED_COUPON_CODE_LIST = [
		'ALT',
		'FBSAVE15',
		'FBSAVE25',
		'FIVERR',
		'FLASHFB20OFF',
		'FLASHFB50OFF',
		'GENEA',
		'KITVISA',
		'LINKEDIN',
		'PATREON',
		'ROCKETLAWYER',
		'RBC',
		'SAFE',
		'SBDC',
		'TXAM',
		...TRUENAME_COUPONS,
	];
	const THIRTY_DAYS_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
	const now = Date.now();
	debug( 'Found coupons in localStorage: ', coupons );

	// delete coupons if they're older than thirty days; find the most recent one
	let mostRecentTimestamp = 0;
	let mostRecentCouponCode = null;
	Object.keys( coupons ).forEach( ( key ) => {
		if ( now > coupons[ key ] + THIRTY_DAYS_MILLISECONDS ) {
			delete coupons[ key ];
		} else if ( coupons[ key ] > mostRecentTimestamp ) {
			mostRecentCouponCode = key;
			mostRecentTimestamp = coupons[ key ];
		}
	} );

	// write remembered coupons back to localStorage
	try {
		debug( 'Storing coupons in localStorage: ', coupons );
		window.localStorage.setItem( MARKETING_COUPONS_KEY, JSON.stringify( coupons ) );
	} catch ( err ) {}

	if (
		ALLOWED_COUPON_CODE_LIST.includes(
			mostRecentCouponCode?.includes( '_' )
				? mostRecentCouponCode.substring( 0, mostRecentCouponCode.indexOf( '_' ) )
				: mostRecentCouponCode
		)
	) {
		debug( 'returning coupon code:', mostRecentCouponCode );
		return mostRecentCouponCode;
	}
	debug( 'not returning any coupon code.' );
	return null;
}
