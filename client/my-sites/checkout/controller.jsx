import { isJetpackLegacyItem, isJetpackLegacyTermUpgrade } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { setSectionMiddleware } from 'calypso/controller';
import { CALYPSO_PLANS_PAGE } from 'calypso/jetpack-connect/constants';
import { MARKETING_COUPONS_KEY } from 'calypso/lib/analytics/utils';
import { getQueryArgs } from 'calypso/lib/query-args';
import { addQueryArgs } from 'calypso/lib/url';
import LicensingPendingAsyncActivation from 'calypso/my-sites/checkout/checkout-thank-you/licensing-pending-async-activation';
import LicensingThankYouAutoActivation from 'calypso/my-sites/checkout/checkout-thank-you/licensing-thank-you-auto-activation';
import LicensingThankYouAutoActivationCompleted from 'calypso/my-sites/checkout/checkout-thank-you/licensing-thank-you-auto-activation-completed';
import LicensingThankYouManualActivationInstructions from 'calypso/my-sites/checkout/checkout-thank-you/licensing-thank-you-manual-activation-instructions';
import LicensingThankYouManualActivationLicenseKey from 'calypso/my-sites/checkout/checkout-thank-you/licensing-thank-you-manual-activation-license-key';
import PostCheckoutUpsellExperimentRedirector from 'calypso/my-sites/checkout/post-checkout-upsell-experiment-redirector';
import { sites } from 'calypso/my-sites/controller';
import {
	retrieveSignupDestination,
	setSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import {
	getCurrentUser,
	getCurrentUserVisibleSiteCount,
	isUserLoggedIn,
} from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	COMPARE_PLANS_QUERY_PARAM,
	LEGACY_TO_RECOMMENDED_MAP,
} from '../plans/jetpack-plans/plan-upgrade/constants';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';
import CheckoutMainWrapper from './checkout-main-wrapper';
import CheckoutThankYouComponent from './checkout-thank-you';
import AkismetCheckoutThankYou from './checkout-thank-you/akismet-checkout-thank-you';
import DomainTransferToAnyUser from './checkout-thank-you/domain-transfer-to-any-user';
import { FailedPurchasePage } from './checkout-thank-you/failed-purchase-page';
import GiftThankYou from './checkout-thank-you/gift/gift-thank-you';
import HundredYearPlanThankYou from './checkout-thank-you/hundred-year-plan-thank-you';
import JetpackCheckoutThankYou from './checkout-thank-you/jetpack-checkout-thank-you';
import CheckoutPending from './checkout-thank-you/pending';
import UpsellNudge, {
	BUSINESS_PLAN_UPGRADE_UPSELL,
	CONCIERGE_SUPPORT_SESSION,
	CONCIERGE_QUICKSTART_SESSION,
	PROFESSIONAL_EMAIL_UPSELL,
} from './upsell-nudge';
import { getProductSlugFromContext, isContextJetpackSitelessCheckout } from './utils';

const debug = debugFactory( 'calypso:checkout-controller' );

export function checkoutFailedPurchases( context, next ) {
	context.primary = <FailedPurchasePage />;

	next();
}

export function checkoutJetpackSiteless( context, next ) {
	const connectAfterCheckout = context.query?.connect_after_checkout === 'true';
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as siteless checkout. As opposed to `siteSlug` which is the
	 * site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 * @type {string|undefined}
	 */
	const fromSiteSlug = context.query?.from_site_slug;
	const adminUrl = context.query?.admin_url;
	sitelessCheckout( context, next, {
		sitelessCheckoutType: 'jetpack',
		connectAfterCheckout,
		...( fromSiteSlug && { fromSiteSlug } ),
		...( adminUrl && { adminUrl } ),
	} );
}

export function checkoutAkismetSiteless( context, next ) {
	sitelessCheckout( context, next, { sitelessCheckoutType: 'akismet' } );
}

export function checkoutMarketplaceSiteless( context, next ) {
	sitelessCheckout( context, next, { sitelessCheckoutType: 'marketplace' } );
}

function sitelessCheckout( context, next, extraProps ) {
	const state = context.store.getState();
	const isLoggedOut = ! isUserLoggedIn( state );
	const { productSlug: product, purchaseId } = context.params;
	const isUserComingFromLoginForm = context.query?.flow === 'coming_from_login';

	setSectionMiddleware( { name: 'checkout' } )( context );

	// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
	const couponCode = context.query.coupon || context.query.code || getRememberedCoupon();

	const CheckoutSitelessDocumentTitle = () => {
		const translate = useTranslate();
		return <DocumentHead title={ translate( 'Checkout' ) } />;
	};

	context.primary = (
		<>
			<CheckoutSitelessDocumentTitle />

			<CheckoutMainWrapper
				purchaseId={ purchaseId }
				productAliasFromUrl={ product }
				productSourceFromUrl={ context.query.source }
				couponCode={ couponCode }
				isComingFromUpsell={ !! context.query.upgrade }
				redirectTo={ context.query.redirect_to }
				isLoggedOutCart={ isLoggedOut }
				isNoSiteCart
				isUserComingFromLoginForm={ isUserComingFromLoginForm }
				{ ...extraProps }
			/>
		</>
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
	// TODO: The only thing that we really need to check for here is whether or not the user is logged out.
	// A siteless Jetpack purchase (logged in or out) will be handled by checkoutJetpackSiteless
	// Additionally, the isJetpackCheckout variable would be more aptly named isJetpackSitelessCheckout
	// isContextJetpackSitelessCheckout is really checking for whether this is a logged-out purchase, but this is uncelar at first
	const isJetpackCheckout = isContextJetpackSitelessCheckout( context );
	const jetpackSiteSlug = context.params.siteSlug;

	const isGiftPurchase = context.pathname.includes( '/gift/' );
	const isRenewal = context.pathname.includes( '/renew/' );

	// Do not use Jetpack checkout for Jetpack Anti Spam
	if ( 'jetpack_anti_spam' === context.params.productSlug ) {
		page( context.path.replace( '/checkout/jetpack', '/checkout' ) );
		return;
	}

	const shouldAllowNoSelectedSite = () => {
		if ( isDisallowedForSitePicker ) {
			return true;
		}
		if ( isJetpackCheckout ) {
			return true;
		}
		if ( isGiftPurchase ) {
			return true;
		}
		// We allow renewals without a site through because we want to show these
		// users an error message on the checkout page.
		if ( isRenewal ) {
			return true;
		}
		return false;
	};

	if ( ! selectedSite && ! shouldAllowNoSelectedSite() ) {
		sites( context, next );
		return;
	}

	const product = getProductSlugFromContext( context );

	if ( 'thank-you' === product ) {
		return;
	}

	const CheckoutDocumentTitle = () => {
		const translate = useTranslate();
		return <DocumentHead title={ translate( 'Checkout' ) } />;
	};

	setSectionMiddleware( { name: 'checkout' } )( context );

	// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
	const couponCode = context.query.coupon || context.query.code || getRememberedCoupon();

	const isLoggedOutCart =
		isJetpackCheckout ||
		( isLoggedOut &&
			( context.pathname.includes( '/checkout/no-site' ) ||
				context.pathname.includes( '/gift/' ) ) );
	const isNoSiteCart =
		isJetpackCheckout ||
		( ! isLoggedOut &&
			context.pathname.includes( '/checkout/no-site' ) &&
			'no-user' === context.query.cart );

	// Tracks if checkout page was unloaded before purchase completion,
	// to prevent browser back duplicate sites. Check pau2Xa-1Io-p2#comment-6759.
	if ( ! isDomainOnlyFlow ) {
		window.addEventListener( 'beforeunload', function () {
			const signupDestinationCookieExists = retrieveSignupDestination();
			signupDestinationCookieExists && setSignupCheckoutPageUnloaded( true );
		} );
	}

	context.primary = (
		<>
			<CheckoutDocumentTitle />

			<CheckoutMainWrapper
				productAliasFromUrl={ product }
				productSourceFromUrl={ context.query.source }
				purchaseId={ purchaseId }
				selectedFeature={ feature }
				couponCode={ couponCode }
				isComingFromUpsell={ !! context.query.upgrade }
				plan={ plan }
				selectedSite={ selectedSite }
				redirectTo={ context.query.redirect_to }
				isLoggedOutCart={ isLoggedOutCart }
				isNoSiteCart={ isNoSiteCart }
				// TODO: in theory, isJetpackCheckout should always be false here if it is indicating whether this is a siteless Jetpack purchase
				// However, in this case, it's indicating that this checkout is a logged-out site purchase for Jetpack.
				// This is creating some mixed use cases for the sitelessCheckoutType prop
				sitelessCheckoutType={ isJetpackCheckout ? 'jetpack' : undefined }
				isGiftPurchase={ isGiftPurchase }
				jetpackSiteSlug={ jetpackSiteSlug }
				jetpackPurchaseToken={ jetpackPurchaseToken || jetpackPurchaseNonce }
				isUserComingFromLoginForm={ isUserComingFromLoginForm }
			/>
		</>
	);

	next();
}

export function redirectJetpackLegacyPlans( context, next ) {
	const product = getProductSlugFromContext( context );
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const upgradeFrom = getQueryArgs()?.upgrade_from;

	if ( isJetpackLegacyItem( product ) && ! isJetpackLegacyTermUpgrade( product, upgradeFrom ) ) {
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
	const orderId = Number.isInteger( Number( context.params.orderId ) )
		? Number( context.params.orderId )
		: ':orderId';

	/**
	 * @type {string|undefined}
	 */
	const siteSlug = context.params.site;

	/**
	 * @type {string|undefined}
	 */
	const redirectTo = context.query.redirectTo;

	const receiptId = Number.isInteger( Number( context.query.receiptId ) )
		? Number( context.query.receiptId )
		: undefined;

	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as siteless checkout. As opposed to `siteSlug` which is the
	 * site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 * @type {string|undefined}
	 */
	const fromSiteSlug = context.query?.from_site_slug;

	setSectionMiddleware( { name: 'checkout-pending' } )( context );

	context.primary = (
		<CheckoutPending
			orderId={ orderId }
			siteSlug={ siteSlug }
			redirectTo={ redirectTo }
			receiptId={ receiptId }
			fromSiteSlug={ fromSiteSlug }
		/>
	);

	next();
}

export function checkoutThankYou( context, next ) {
	// This route requires a numeric receipt ID like
	// `/checkout/thank-you/example.com/1234` but it also operates as a fallback
	// if something goes wrong with the "pending" page and will respond to a URL
	// like `/checkout/thank-you/example.com/pending`. In that case, the word
	// `pending` is a placeholder for the receipt ID that never got properly
	// replaced (perhaps it could not find the receipt ID, for example).
	//
	// In that case, we still want to display a generic thank-you page (because
	// the transaction was probably still successful), so we set `receiptId` to
	// `undefined`.
	const receiptId = Number.isInteger( Number( context.params.receiptId ) )
		? Number( context.params.receiptId )
		: undefined;
	const gsuiteReceiptId = Number( context.params.gsuiteReceiptId ) || 0;

	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );
	const displayMode = context.query?.d;

	setSectionMiddleware( { name: 'checkout-thank-you' } )( context );

	const CheckoutThankYouDocumentTitle = () => {
		const translate = useTranslate();
		return <DocumentHead title={ translate( 'Thank You' ) } />;
	};

	context.primary = (
		<>
			<CheckoutThankYouDocumentTitle />

			<CheckoutThankYouComponent
				displayMode={ displayMode }
				domainOnlySiteFlow={ ! context.params.site }
				email={ context.query.email }
				gsuiteReceiptId={ gsuiteReceiptId }
				receiptId={ receiptId }
				redirectTo={ context.query.redirect_to }
				selectedFeature={ context.params.feature }
				selectedSite={ selectedSite }
				upgradeIntent={ context.query.intent }
			/>
		</>
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
			case 'business-3-years':
			case 'business-monthly':
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
				break;
			default:
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
		}
	} else if ( context.path.includes( 'offer-professional-email' ) ) {
		upsellType = PROFESSIONAL_EMAIL_UPSELL;
		upgradeItem = context.params.domain;
	} else {
		upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
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
	const { receiptId, site /*, upsellMeta, upsellType */ } = context.params;

	setSectionMiddleware( { name: 'checkout-offer-redirect' } )( context );

	let upsellExperimentName;
	let upsellExperimentAssignmentName;
	let upsellUrl;

	/*
	 * When next we need a redirect based on A/B test, add any logic based on upsellType here
	 * While this code block is empty, this function is effectively a no-op.

	if ( PROFESSIONAL_EMAIL_OFFER === upsellType ) {
		upsellExperimentName = 'calypso_promote_professional_email_post_checkout_2022_02';
		upsellExperimentAssignmentName = 'treatment';
		upsellUrl = `/checkout/offer-professional-email/${ upsellMeta }/${ receiptId }/${ site }`;
	}
	*/

	if ( upsellExperimentName && upsellExperimentAssignmentName && upsellUrl ) {
		context.primary = (
			<PostCheckoutUpsellExperimentRedirector
				receiptId={ receiptId }
				siteSlug={ site }
				upsellExperimentName={ upsellExperimentName }
				upsellExperimentAssignmentName={ upsellExperimentAssignmentName }
				upsellUrl={ upsellUrl }
			/>
		);
	}

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

export function licensingPendingAsyncActivation( context, next ) {
	const { product: productSlug } = context.params;
	const { receiptId, source, siteId, fromSiteSlug, redirect_to } = context.query;

	if ( ! fromSiteSlug ) {
		page.redirect(
			addQueryArgs(
				{ receiptId },
				`/checkout/jetpack/thank-you/licensing-manual-activate/${ productSlug }`
			)
		);
	} else {
		context.primary = (
			<LicensingPendingAsyncActivation
				productSlug={ productSlug }
				receiptId={ receiptId }
				source={ source }
				jetpackTemporarySiteId={ siteId }
				fromSiteSlug={ fromSiteSlug }
				redirectTo={ redirect_to }
			/>
		);
	}

	next();
}

export function licensingThankYouManualActivationInstructions( context, next ) {
	const { product } = context.params;
	const { receiptId } = context.query;

	context.primary = (
		<LicensingThankYouManualActivationInstructions
			productSlug={ product }
			receiptId={ receiptId }
		/>
	);

	next();
}

export function licensingThankYouManualActivationLicenseKey( context, next ) {
	const { product } = context.params;
	const { receiptId } = context.query;

	context.primary = (
		<LicensingThankYouManualActivationLicenseKey productSlug={ product } receiptId={ receiptId } />
	);

	next();
}

export function licensingThankYouAutoActivation( context, next ) {
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );
	const userHasJetpackSites = currentUser && currentUser.jetpack_visible_site_count >= 1;

	const { product } = context.params;
	const { receiptId, source, siteId, fromSiteSlug, redirect_to } = context.query;

	if ( ! userHasJetpackSites ) {
		page.redirect(
			addQueryArgs(
				{ receiptId },
				`/checkout/jetpack/thank-you/licensing-manual-activate/${ product }`
			)
		);
	} else {
		context.primary = (
			<LicensingThankYouAutoActivation
				userHasJetpackSites={ userHasJetpackSites }
				productSlug={ context.params.product }
				receiptId={ receiptId }
				source={ source }
				jetpackTemporarySiteId={ siteId }
				fromSiteSlug={ fromSiteSlug }
				redirectTo={ redirect_to }
			/>
		);
	}

	next();
}

export function licensingThankYouAutoActivationCompleted( context, next ) {
	const { destinationSiteId, redirect_to } = context.query;

	context.primary = (
		<LicensingThankYouAutoActivationCompleted
			productSlug={ context.params.product }
			destinationSiteId={ destinationSiteId }
			redirectTo={ redirect_to }
		/>
	);

	next();
}

export function hundredYearCheckoutThankYou( context, next ) {
	context.primary = (
		<HundredYearPlanThankYou
			siteSlug={ context.params.site }
			receiptId={ context.params.receiptId }
		/>
	);
	next();
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

export function akismetCheckoutThankYou( context, next ) {
	context.primary = <AkismetCheckoutThankYou productSlug={ context.params.productSlug } />;

	next();
}

export function giftThankYou( context, next ) {
	// Overriding section name here in order to apply a top level
	// background via .is-section-checkout-gift-thank-you
	context.section.name = 'checkout-gift-thank-you';
	context.primary = <GiftThankYou site={ context.params.site } />;
	next( context );
}

export function transferDomainToAnyUser( context, next ) {
	// Overriding section name here in order to apply a top level
	// background via .is-section-checkout-thank-you
	context.section.name = 'checkout-thank-you';
	context.primary = <DomainTransferToAnyUser domain={ context.params.domain } />;
	next( context );
}

export async function refreshUserSession( context, next ) {
	await context.store.dispatch( fetchCurrentUser() );
	next( context );
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
		'WC',
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
