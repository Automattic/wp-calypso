/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import React from 'react';
import { get, isEmpty } from 'lodash';
import page from 'page';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import GSuiteNudge from './gsuite-nudge';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';
import CheckoutSystemDecider from './checkout-system-decider';
import CheckoutPendingComponent from './checkout-thank-you/pending';
import CheckoutThankYouComponent from './checkout-thank-you';
import { canUserPurchaseGSuite } from 'calypso/lib/gsuite';
import { getRememberedCoupon } from 'calypso/lib/cart/actions';
import { setSectionMiddleware } from 'calypso/controller';
import { sites } from 'calypso/my-sites/controller';
import CartData from 'calypso/components/data/cart';
import userFactory from 'calypso/lib/user';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	retrieveSignupDestination,
	setSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import UpsellNudge, {
	PREMIUM_PLAN_UPGRADE_UPSELL,
	BUSINESS_PLAN_UPGRADE_UPSELL,
	CONCIERGE_SUPPORT_SESSION,
	CONCIERGE_QUICKSTART_SESSION,
	DIFM_UPSELL,
} from './upsell-nudge';

export function checkout( context, next ) {
	const { feature, plan, domainOrProduct, purchaseId } = context.params;

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

	if ( ! selectedSite && ! isDisallowedForSitePicker ) {
		sites( context, next );
		return;
	}

	let product;
	if ( selectedSite && selectedSite.slug !== domainOrProduct && domainOrProduct ) {
		product = domainOrProduct;
	} else {
		product = context.params.product;
	}

	if ( 'thank-you' === product ) {
		return;
	}

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

	setSectionMiddleware( { name: 'checkout' } )( context );

	// NOTE: `context.query.code` is deprecated in favor of `context.query.coupon`.
	const couponCode = context.query.coupon || context.query.code || getRememberedCoupon();

	const isLoggedOutCart = isLoggedOut && context.pathname.includes( '/checkout/no-site' );
	const isNoSiteCart =
		! isLoggedOut &&
		context.pathname.includes( '/checkout/no-site' ) &&
		'no-user' === context.query.cart;

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
		<CartData>
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
			/>
		</CartData>
	);

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

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
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

	if ( ! canUserPurchaseGSuite() ) {
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
	let addnlProps;

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

			case 'premium':
				upsellType = PREMIUM_PLAN_UPGRADE_UPSELL;
				break;

			default:
				upsellType = BUSINESS_PLAN_UPGRADE_UPSELL;
		}
	} else if ( context.path.includes( 'offer-difm' ) ) {
		upsellType = DIFM_UPSELL;
		const isFromEcommercePurchase = context.query?.isEcommerce === '1';
		addnlProps = { isFromEcommercePurchase };
	}

	setSectionMiddleware( { name: upsellType } )( context );

	context.primary = (
		<CalypsoShoppingCartProvider>
			<UpsellNudge
				siteSlugParam={ site }
				receiptId={ Number( receiptId ) }
				upsellType={ upsellType }
				upgradeItem={ upgradeItem }
				addnlProps={ addnlProps }
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
