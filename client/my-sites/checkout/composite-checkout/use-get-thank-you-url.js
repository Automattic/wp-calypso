/**
 * External dependencies
 */
import { format as formatUrl, parse as parseUrl } from 'url';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { defaultRegistry } from '@automattic/composite-checkout';
import debugFactory from 'debug';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout-thank-you' );

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import config from 'config';
import {
	hasRenewalItem,
	getAllCartItems,
	getRenewalItems,
	hasConciergeSession,
	hasJetpackPlan,
	hasBloggerPlan,
	hasPersonalPlan,
	hasPremiumPlan,
	hasEcommercePlan,
} from 'lib/cart-values/cart-items';
import { managePurchase } from 'me/purchases/paths';
import { isValidFeatureKey } from 'lib/plans/features-list';
import { JETPACK_BACKUP_PRODUCTS } from 'lib/products-values/constants';
import { persistSignupDestination, retrieveSignupDestination } from 'signup/utils';
import { getSelectedSite } from 'state/ui/selectors';
import isEligibleForSignupDestination from 'state/selectors/is-eligible-for-signup-destination';
import getPreviousPath from 'state/selectors/get-previous-path.js';
import { abtest } from 'lib/abtest';

export function getThankYouPageUrl( {
	siteSlug,
	adminUrl,
	redirectTo,
	receiptId,
	orderId,
	purchaseId,
	feature,
	cart = {},
	isJetpackNotAtomic,
	product,
	getUrlFromCookie = retrieveSignupDestination,
	saveUrlToCookie = persistSignupDestination,
	previousRoute,
	isEligibleForSignupDestinationResult,
} ) {
	// If we're given an explicit `redirectTo` query arg, make sure it's either internal
	// (i.e. on WordPress.com), or a Jetpack or WP.com site's block editor (in wp-admin).
	// This is required for Jetpack's (and WP.com's) paid blocks Upgrade Nudge.
	if ( redirectTo && ! isExternal( redirectTo ) ) {
		return redirectTo;
	}
	if ( redirectTo ) {
		const { protocol, hostname, port, pathname, query } = parseUrl( redirectTo, true, true );

		// We cannot simply compare `hostname` to `siteSlug`, since the latter
		// might contain a path in the case of Jetpack subdirectory installs.
		if ( adminUrl && redirectTo.startsWith( `${ adminUrl }post.php?` ) ) {
			const sanitizedRedirectTo = formatUrl( {
				protocol,
				hostname,
				port,
				pathname,
				query: {
					post: parseInt( query.post, 10 ),
					action: 'edit',
					plan_upgraded: 1,
				},
			} );
			return sanitizedRedirectTo;
		}
	}

	// Note: this function is called early on for redirect-type payment methods, when the receipt isn't set yet.
	// The `:receiptId` string is filled in by our pending page after the PayPal checkout
	const pendingOrReceiptId = getPendingOrReceiptId( receiptId, orderId, purchaseId );

	const fallbackUrl = getFallbackDestination( {
		pendingOrReceiptId,
		siteSlug,
		feature,
		cart,
		isJetpackNotAtomic,
		product,
	} );

	saveUrlToCookieIfEcomm( saveUrlToCookie, cart, fallbackUrl );
	modifyCookieUrlIfAtomic( getUrlFromCookie, saveUrlToCookie, siteSlug );

	// Fetch the thank-you page url from a cookie if it is set
	const signupDestination = getUrlFromCookie();

	if ( hasRenewalItem( cart ) ) {
		const renewalItem = getRenewalItems( cart )[ 0 ];
		return managePurchase( renewalItem.extra.purchaseDomain, renewalItem.extra.purchaseId );
	}

	// If cart is empty, then send the user to a generic page (not post-purchase related).
	// For example, this case arises when a Skip button is clicked on a concierge upsell
	// nudge opened by a direct link to /offer-support-session.
	if ( ':receiptId' === pendingOrReceiptId && getAllCartItems( cart ).length === 0 ) {
		return signupDestination || fallbackUrl;
	}

	// Domain only flow
	if ( cart.create_new_blog ) {
		const newBlogUrl = signupDestination || fallbackUrl;
		return `${ newBlogUrl }/${ pendingOrReceiptId }`;
	}

	const redirectPathForConciergeUpsell = getRedirectUrlForConciergeNudge( {
		pendingOrReceiptId,
		cart,
		siteSlug,
		previousRoute,
	} );
	if ( redirectPathForConciergeUpsell ) {
		return redirectPathForConciergeUpsell;
	}

	// Display mode is used to show purchase specific messaging, for e.g. the Schedule Session button
	// when purchasing a concierge session.
	const displayModeParam = getDisplayModeParamFromCart( cart );
	if ( isEligibleForSignupDestinationResult && signupDestination ) {
		return getUrlWithQueryParam( signupDestination, displayModeParam );
	}
	return getUrlWithQueryParam( fallbackUrl, displayModeParam );
}

function getPendingOrReceiptId( receiptId, orderId, purchaseId ) {
	if ( receiptId ) {
		return receiptId;
	}
	if ( orderId ) {
		return `pending/${ orderId }`;
	}
	return purchaseId ?? ':receiptId';
}

function getFallbackDestination( {
	pendingOrReceiptId,
	siteSlug,
	feature,
	cart,
	isJetpackNotAtomic,
	product,
} ) {
	const isCartEmpty = getAllCartItems( cart ).length === 0;
	const isReceiptEmpty = ':receiptId' === pendingOrReceiptId;

	// We will show the Thank You page if there's a site slug and either one of the following is true:
	// - has a receipt number
	// - does not have a receipt number but has an item in cart(as in the case of paying with a redirect payment type)
	if ( siteSlug && ( ! isReceiptEmpty || ! isCartEmpty ) ) {
		const isJetpackProduct = product && JETPACK_BACKUP_PRODUCTS.includes( product );
		// If we just purchased a Jetpack product, redirect to the my plans page.
		if ( isJetpackNotAtomic && isJetpackProduct ) {
			return `/plans/my-plan/${ siteSlug }?thank-you=true&product=${ product }`;
		}
		// If we just purchased a Jetpack plan (not a Jetpack product), redirect to the Jetpack onboarding plugin install flow.
		if ( isJetpackNotAtomic ) {
			return `/plans/my-plan/${ siteSlug }?thank-you=true&install=all`;
		}

		return feature && isValidFeatureKey( feature )
			? `/checkout/thank-you/features/${ feature }/${ siteSlug }/${ pendingOrReceiptId }`
			: `/checkout/thank-you/${ siteSlug }/${ pendingOrReceiptId }`;
	}

	if ( siteSlug ) {
		return `/checkout/thank-you/${ siteSlug }`;
	}
	return '/';
}

function getRedirectUrlForConciergeNudge( { pendingOrReceiptId, cart, siteSlug, previousRoute } ) {
	// If the user has upgraded a plan from seeing our upsell(we find this by checking the previous route is /offer-plan-upgrade),
	// then skip this section so that we do not show further upsells.
	if (
		config.isEnabled( 'upsell/concierge-session' ) &&
		! hasConciergeSession( cart ) &&
		! hasJetpackPlan( cart ) &&
		( hasBloggerPlan( cart ) || hasPersonalPlan( cart ) || hasPremiumPlan( cart ) ) &&
		! previousRoute?.includes( `/checkout/${ siteSlug }/offer-plan-upgrade` )
	) {
		// A user just purchased one of the qualifying plans
		// Show them the concierge session upsell page

		// The conciergeUpsellDial test is used when we need to quickly dial back the volume of concierge sessions
		// being offered and so sold, to be inline with HE availability.
		// To dial back, uncomment the condition below and modify the test config.
		if ( 'offer' === abtest( 'conciergeUpsellDial' ) ) {
			return `/checkout/offer-quickstart-session/${ pendingOrReceiptId }/${ siteSlug }`;
		}
	}

	return;
}

function getDisplayModeParamFromCart( cart ) {
	if ( hasConciergeSession( cart ) ) {
		return { d: 'concierge' };
	}

	return {};
}

function getUrlWithQueryParam( url, queryParams ) {
	const { protocol, hostname, port, pathname, query } = parseUrl( url, true );

	return formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: {
			...query,
			...queryParams,
		},
	} );
}

/**
 * If there is an ecommerce plan in cart, then irrespective of the signup flow destination, the final destination
 * will always be "Thank You" page for the eCommerce plan. This is because the ecommerce store setup happens in this page.
 * If the user purchases additional products via upsell nudges, the original saved receipt ID will be used to
 * display the Thank You page for the eCommerce plan purchase.
 *
 * @param {Function} saveUrlToCookie The function that performs the saving
 * @param {object} cart The cart object
 * @param {string} destinationUrl The url to save
 */
function saveUrlToCookieIfEcomm( saveUrlToCookie, cart, destinationUrl ) {
	if ( hasEcommercePlan( cart ) ) {
		saveUrlToCookie( destinationUrl );
	}
}

function modifyCookieUrlIfAtomic( getUrlFromCookie, saveUrlToCookie, siteSlug ) {
	const signupDestination = getUrlFromCookie();
	if ( ! signupDestination ) {
		return;
	}

	// If atomic site, then replace wordpress.com with wpcomstaging.com
	if ( siteSlug && siteSlug.includes( '.wpcomstaging.com' ) ) {
		const wpcomStagingDestination = signupDestination.replace(
			/\b.wordpress.com/,
			'.wpcomstaging.com'
		);
		saveUrlToCookie( wpcomStagingDestination );
	}
}

export function useGetThankYouUrl( {
	siteSlug,
	redirectTo,
	purchaseId,
	feature,
	cart,
	isJetpackNotAtomic,
	product,
	siteId,
} ) {
	const selectedSiteData = useSelector( ( state ) => getSelectedSite( state ) );
	const adminUrl = selectedSiteData?.options?.admin_url;
	const isEligibleForSignupDestinationResult = useSelector( ( state ) =>
		isEligibleForSignupDestination( state, siteId, cart )
	);
	const previousRoute = useSelector( ( state ) => getPreviousPath( state ) );

	const getThankYouUrl = useCallback( () => {
		const transactionResult = select( 'wpcom' ).getTransactionResult();
		debug( 'for getThankYouUrl, transactionResult is', transactionResult );
		const receiptId = transactionResult.receipt_id;
		const orderId = transactionResult.order_id;

		debug( 'getThankYouUrl called with', {
			siteSlug,
			adminUrl,
			receiptId,
			orderId,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			product,
			previousRoute,
			isEligibleForSignupDestinationResult,
		} );
		const url = getThankYouPageUrl( {
			siteSlug,
			adminUrl,
			receiptId,
			orderId,
			redirectTo,
			purchaseId,
			feature,
			cart,
			isJetpackNotAtomic,
			product,
			previousRoute,
			isEligibleForSignupDestinationResult,
		} );
		debug( 'getThankYouUrl returned', url );
		return url;
	}, [
		previousRoute,
		isEligibleForSignupDestinationResult,
		siteSlug,
		adminUrl,
		isJetpackNotAtomic,
		product,
		redirectTo,
		feature,
		purchaseId,
		cart,
	] );
	return getThankYouUrl;
}
