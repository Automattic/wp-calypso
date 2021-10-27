import { isJetpackLegacyItem } from '@automattic/calypso-products';
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import page from 'page';
import { setSectionMiddleware } from 'calypso/controller';
import { CALYPSO_PLANS_PAGE } from 'calypso/jetpack-connect/constants';
import { MARKETING_COUPONS_KEY } from 'calypso/lib/analytics/utils';
import { TRUENAME_COUPONS } from 'calypso/lib/domains';
import PostCheckoutUpsellRedirector from 'calypso/my-sites/checkout/post-checkout-upsell-redirector';
import { sites } from 'calypso/my-sites/controller';
import {
	retrieveSignupDestination,
	setSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import {
	getCurrentUserVisibleSiteCount,
	isUserLoggedIn,
} from 'calypso/state/current-user/selectors';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	COMPARE_PLANS_QUERY_PARAM,
	LEGACY_TO_RECOMMENDED_MAP,
} from '../plans/jetpack-plans/plan-upgrade/constants';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';
import CheckoutSystemDecider from './checkout-system-decider';
import CheckoutThankYouComponent from './checkout-thank-you';
import JetpackCheckoutSitelessThankYou from './checkout-thank-you/jetpack-checkout-siteless-thank-you';
import JetpackCheckoutSitelessThankYouCompleted from './checkout-thank-you/jetpack-checkout-siteless-thank-you-completed';
import JetpackCheckoutThankYou from './checkout-thank-you/jetpack-checkout-thank-you';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import UpsellNudge, {
	BUSINESS_PLAN_UPGRADE_UPSELL,
	CONCIERGE_SUPPORT_SESSION,
	CONCIERGE_QUICKSTART_SESSION,
	PROFESSIONAL_EMAIL_UPSELL,
} from './upsell-nudge';
import { getDomainOrProductFromContext } from './utils';

const debug = debugFactory( 'calypso:checkout-controller' );

export function checkoutSiteless( context, next ) {
	const state = context.store.getState();
	const isLoggedOut = ! isUserLoggedIn( state );
	const { productSlug: product } = context.params;
	const isUserComingFromLoginForm = context.query?.flow === 'coming_from_login';

	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

	setSectionMiddleware( { name: 'checkout' } )( context );

	// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
	const couponCode = context.query.coupon || context.query.code || getRememberedCoupon();

	context.primary = (
		<CheckoutSystemDecider
			productAliasFromUrl={ product }
			couponCode={ couponCode }
			isComingFromUpsell={ !! context.query.upgrade }
			redirectTo={ context.query.redirect_to }
			isLoggedOutCart={ isLoggedOut }
			isNoSiteCart={ true }
			isJetpackCheckout={ true }
			isUserComingFromLoginForm={ isUserComingFromLoginForm }
		/>
	);

	next();
}

export function checkout( context, next ) {
	const { feature, plan, purchaseId } = context.params;

	const state = context.store.getState();
	const isLoggedOut = ! isUserLoggedIn( state );
	const selectedSite = getSelectedSite( state );
	const hasSite = getCurrentUserVisibleSiteCount( state ) >= 1;
	const isDomainOnlyFlow = context.query?.isDomainOnly === '1';
	const isDisallowedForSitePicker =
		context.pathname.includes( '/checkout/no-site' ) &&
		( isLoggedOut || ! hasSite || isDomainOnlyFlow );
	const jetpackPurchaseToken = context.query.purchasetoken;
	const jetpackPurchaseNonce = context.query.purchaseNonce;
	const isUserComingFromLoginForm = context.query?.flow === 'coming_from_login';
	const isUserComingFromPlansPage = [ 'jetpack-plans', 'jetpack-connect-plans' ].includes(
		context.query?.source
	);
	const isJetpackCheckout =
		context.pathname.includes( '/checkout/jetpack' ) &&
		( isLoggedOut || isUserComingFromLoginForm || isUserComingFromPlansPage ) &&
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
			isUserComingFromLoginForm={ isUserComingFromLoginForm }
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
			case 'business-2-years':
			case 'business-monthly':
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
				break;
			default:
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
		}
	} else if ( context.path.includes( 'offer-professional-email' ) ) {
		upsellType = PROFESSIONAL_EMAIL_UPSELL;
		upgradeItem = context.params.domain;
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

export function upsellRedirect( context, next ) {
	const { receiptId, site, upsellMeta, upsellType } = context.params;

	setSectionMiddleware( { name: 'checkout-offer-redirect' } )( context );

	context.primary = (
		<PostCheckoutUpsellRedirector
			receiptId={ receiptId }
			siteSlug={ site }
			upsellMeta={ upsellMeta }
			upsellType={ upsellType }
		/>
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
	const isSitelessCheckoutFlow = context.path.includes( '/checkout/jetpack/thank-you/no-site' );

	const { receiptId, source, siteId } = context.query;

	context.primary = isSitelessCheckoutFlow ? (
		<JetpackCheckoutSitelessThankYou
			productSlug={ context.params.product }
			receiptId={ receiptId }
			source={ source }
			jetpackTemporarySiteId={ siteId }
		/>
	) : (
		<JetpackCheckoutThankYou
			site={ context.params.site }
			productSlug={ context.params.product }
			isUserlessCheckoutFlow={ isUserlessCheckoutFlow }
		/>
	);

	next();
}

export function jetpackCheckoutThankYouCompleted( context, next ) {
	const { siteId, receiptId } = context.query;
	context.primary = (
		<JetpackCheckoutSitelessThankYouCompleted
			productSlug={ context.params.product }
			jetpackTemporarySiteId={ siteId }
			receiptId={ receiptId }
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
