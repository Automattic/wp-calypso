/**
 * External dependencies
 */
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
import debugFactory from 'debug';
import type { ResponseCart } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:get-thank-you-page-url' );

/**
 * Internal dependencies
 */
import { isExternal } from 'calypso/lib/url';
import config from 'calypso/config';
import {
	hasRenewalItem,
	getAllCartItems,
	getRenewalItems,
	hasConciergeSession,
	hasJetpackPlan,
	hasBloggerPlan,
	hasPersonalPlan,
	hasPremiumPlan,
	hasBusinessPlan,
	hasEcommercePlan,
	hasMonthlyCartItem,
} from 'calypso/lib/cart-values/cart-items';
import { managePurchase } from 'calypso/me/purchases/paths';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/constants';
import { JETPACK_RESET_PLANS } from 'calypso/lib/plans/constants';
import { persistSignupDestination, retrieveSignupDestination } from 'calypso/signup/storageUtils';
import { abtest } from 'calypso/lib/abtest';

type SaveUrlToCookie = ( url: string ) => void;
type GetUrlFromCookie = () => string | undefined;

export default function getThankYouPageUrl( {
	siteSlug,
	adminUrl,
	redirectTo,
	receiptId,
	orderId,
	purchaseId,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	getUrlFromCookie = retrieveSignupDestination,
	saveUrlToCookie = persistSignupDestination,
	isEligibleForSignupDestinationResult,
	hideNudge,
	isInEditor,
}: {
	siteSlug: string | undefined;
	adminUrl: string | undefined;
	redirectTo?: string | undefined;
	receiptId: number | undefined;
	orderId: number | undefined;
	purchaseId: number | undefined;
	feature: string | undefined;
	cart: ResponseCart | undefined;
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl: string | undefined;
	getUrlFromCookie?: GetUrlFromCookie;
	saveUrlToCookie?: SaveUrlToCookie;
	isEligibleForSignupDestinationResult?: boolean;
	hideNudge?: boolean;
	isInEditor?: boolean;
} ): string {
	debug( 'starting getThankYouPageUrl' );

	// If we're given an explicit `redirectTo` query arg, make sure it's either internal
	// (i.e. on WordPress.com), or a Jetpack or WP.com site's block editor (in wp-admin).
	// This is required for Jetpack's (and WP.com's) paid blocks Upgrade Nudge.
	if ( redirectTo && ! isExternal( redirectTo ) ) {
		debug( 'has external redirectTo, so returning that', redirectTo );
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
					post: parseInt( String( query.post ), 10 ),
					action: 'edit',
					plan_upgraded: 1,
				},
			} );
			debug( 'returning sanitized internal redirectTo', redirectTo );
			return sanitizedRedirectTo;
		}
		debug( 'ignorning redirectTo', redirectTo );
	}

	// Note: this function is called early on for redirect-type payment methods, when the receipt isn't set yet.
	// The `:receiptId` string is filled in by our pending page after the PayPal checkout
	const pendingOrReceiptId = getPendingOrReceiptId( receiptId, orderId, purchaseId );
	debug( 'pendingOrReceiptId is', pendingOrReceiptId );

	const fallbackUrl = getFallbackDestination( {
		pendingOrReceiptId,
		siteSlug,
		feature,
		cart,
		isJetpackNotAtomic: Boolean( isJetpackNotAtomic ),
		productAliasFromUrl,
	} );
	debug( 'fallbackUrl is', fallbackUrl );

	saveUrlToCookieIfEcomm( saveUrlToCookie, cart, fallbackUrl );

	// If the user is making a purchase/upgrading within the editor,
	// we want to return them back to the editor after the purchase is successful.
	if ( isInEditor && cart && ! hasEcommercePlan( cart ) ) {
		saveUrlToCookie( window?.location.href );
	}

	modifyCookieUrlIfAtomic( getUrlFromCookie, saveUrlToCookie, siteSlug );

	// Fetch the thank-you page url from a cookie if it is set
	const urlFromCookie = getUrlFromCookie();
	debug( 'cookie url is', urlFromCookie );

	if ( cart && hasRenewalItem( cart ) ) {
		const renewalItem = getRenewalItems( cart )[ 0 ];
		const managePurchaseUrl = managePurchase(
			renewalItem.extra.purchaseDomain,
			renewalItem.extra.purchaseId
		);
		debug(
			'renewal item in cart',
			renewalItem,
			'so returning managePurchaseUrl',
			managePurchaseUrl
		);
		return managePurchaseUrl;
	}

	// If cart is empty, then send the user to a generic page (not post-purchase related).
	// For example, this case arises when a Skip button is clicked on a concierge upsell
	// nudge opened by a direct link to /offer-support-session.
	const isCartEmpty = cart && getAllCartItems( cart ).length === 0;
	if ( ':receiptId' === pendingOrReceiptId && isCartEmpty ) {
		const emptyCartUrl = urlFromCookie || fallbackUrl;
		debug( 'cart is empty or receipt ID is pending, so returning', emptyCartUrl );
		return emptyCartUrl;
	}

	// Domain only flow
	if ( cart?.create_new_blog ) {
		const newBlogUrl = urlFromCookie || fallbackUrl;
		const newBlogReceiptUrl = `${ newBlogUrl }/${ pendingOrReceiptId }`;
		debug( 'new blog created, so returning', newBlogReceiptUrl );
		return newBlogReceiptUrl;
	}

	const redirectPathForConciergeUpsell = getRedirectUrlForConciergeNudge( {
		pendingOrReceiptId,
		orderId,
		cart,
		siteSlug,
		hideNudge: Boolean( hideNudge ),
	} );
	if ( redirectPathForConciergeUpsell ) {
		debug( 'redirect for concierge exists, so returning', redirectPathForConciergeUpsell );
		return redirectPathForConciergeUpsell;
	}

	// Display mode is used to show purchase specific messaging, for e.g. the Schedule Session button
	// when purchasing a concierge session.
	const displayModeParam = getDisplayModeParamFromCart( cart );
	if ( isEligibleForSignupDestinationResult && urlFromCookie ) {
		debug( 'is eligible for signup destination', urlFromCookie );
		return getUrlWithQueryParam( urlFromCookie, displayModeParam );
	}
	debug( 'returning fallback url', fallbackUrl );
	return getUrlWithQueryParam( fallbackUrl, displayModeParam );
}

function getPendingOrReceiptId(
	receiptId: number | undefined,
	orderId: number | undefined,
	purchaseId: number | undefined
): string {
	if ( receiptId ) {
		return String( receiptId );
	}
	if ( orderId ) {
		return `pending/${ orderId }`;
	}
	if ( purchaseId ) {
		return String( purchaseId );
	}
	return ':receiptId';
}

function getFallbackDestination( {
	pendingOrReceiptId,
	siteSlug,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
}: {
	pendingOrReceiptId: string;
	siteSlug: string | undefined;
	feature: string | undefined;
	cart: ResponseCart | undefined;
	isJetpackNotAtomic: boolean;
	productAliasFromUrl: string | undefined;
} ): string {
	const isCartEmpty = cart ? getAllCartItems( cart ).length === 0 : true;
	const isReceiptEmpty = ':receiptId' === pendingOrReceiptId;

	// We will show the Thank You page if there's a site slug and either one of the following is true:
	// - has a receipt number
	// - does not have a receipt number but has an item in cart(as in the case of paying with a redirect payment type)
	if ( siteSlug && ( ! isReceiptEmpty || ! isCartEmpty ) ) {
		// If we just purchased a Jetpack product or a Jetpack plan (either Jetpack Security or Jetpack Complete),
		// redirect to the my plans page. The product being purchased can come from the `product` prop or from the
		// cart so we need to check both places.
		const productsWithCustomThankYou = [ ...JETPACK_PRODUCTS_LIST, ...JETPACK_RESET_PLANS ];

		// Check the cart (since our Thank You modal doesn't support multiple products, we only take the first
		// one found).
		const productFromCart = cart?.products?.find( ( { product_slug } ) =>
			productsWithCustomThankYou.includes( product_slug )
		)?.product_slug;

		const purchasedProduct =
			productFromCart ||
			productsWithCustomThankYou.find(
				( productWithCustom ) => productWithCustom === productAliasFromUrl
			);
		if ( isJetpackNotAtomic && purchasedProduct ) {
			debug( 'the site is jetpack and bought a jetpack product', siteSlug, purchasedProduct );
			return `/plans/my-plan/${ siteSlug }?thank-you=true&product=${ purchasedProduct }`;
		}

		// If we just purchased a legacy Jetpack plan, redirect to the Jetpack onboarding plugin install flow.
		if ( isJetpackNotAtomic ) {
			debug( 'the site is jetpack and has no jetpack product' );
			return `/plans/my-plan/${ siteSlug }?thank-you=true&install=all`;
		}

		const siteWithReceiptOrCartUrl =
			feature && isValidFeatureKey( feature )
				? `/checkout/thank-you/features/${ feature }/${ siteSlug }/${ pendingOrReceiptId }`
				: `/checkout/thank-you/${ siteSlug }/${ pendingOrReceiptId }`;
		debug( 'site with receipt or cart; feature is', feature );
		return siteWithReceiptOrCartUrl;
	}

	if ( siteSlug ) {
		debug( 'just site slug', siteSlug );
		return `/checkout/thank-you/${ siteSlug }`;
	}
	debug( 'fallback is just root' );
	return '/';
}

function maybeShowPlanBumpOffer( {
	pendingOrReceiptId,
	cart,
	siteSlug,
	orderId,
}: {
	pendingOrReceiptId: string;
	orderId: number | undefined;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
} ): string | undefined {
	if ( orderId ) {
		return;
	}
	if ( hasPremiumPlan( cart ) ) {
		const upgradeItem = hasMonthlyCartItem( cart ) ? 'business-monthly' : 'business';
		return `/checkout/${ siteSlug }/offer-plan-upgrade/${ upgradeItem }/${ pendingOrReceiptId }`;
	}
	return;
}

function getRedirectUrlForConciergeNudge( {
	pendingOrReceiptId,
	orderId,
	cart,
	siteSlug,
	hideNudge,
}: {
	pendingOrReceiptId: string;
	orderId: number | undefined;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	hideNudge: boolean;
} ): string | undefined {
	if ( hideNudge ) {
		return;
	}

	// If the user has upgraded a plan from seeing our upsell(we find this by checking the previous route is /offer-plan-upgrade),
	// then skip this section so that we do not show further upsells.
	if (
		config.isEnabled( 'upsell/concierge-session' ) &&
		cart &&
		! hasConciergeSession( cart ) &&
		! hasJetpackPlan( cart ) &&
		( hasBloggerPlan( cart ) ||
			hasPersonalPlan( cart ) ||
			hasPremiumPlan( cart ) ||
			hasBusinessPlan( cart ) )
	) {
		// A user just purchased one of the qualifying plans
		// Show them the concierge session upsell page

		const upgradePath = maybeShowPlanBumpOffer( {
			pendingOrReceiptId,
			cart,
			orderId,
			siteSlug,
		} );
		if ( upgradePath ) {
			return upgradePath;
		}

		// The conciergeUpsellDial test is used when we need to quickly dial back the volume of concierge sessions
		// being offered and so sold, to be inline with HE availability.
		// To dial back, uncomment the condition below and modify the test config.
		if ( 'offer' === abtest( 'conciergeUpsellDial' ) ) {
			return getQuickstartUrl( { pendingOrReceiptId, siteSlug, orderId } );
		}
	}

	return;
}

function getQuickstartUrl( {
	pendingOrReceiptId,
	siteSlug,
	orderId,
}: {
	pendingOrReceiptId: string;
	siteSlug: string | undefined;
	orderId: number | undefined;
} ): string | undefined {
	if ( orderId ) {
		return;
	}
	return `/checkout/offer-quickstart-session/${ pendingOrReceiptId }/${ siteSlug }`;
}

function getDisplayModeParamFromCart( cart: ResponseCart | undefined ): Record< string, string > {
	if ( cart && hasConciergeSession( cart ) ) {
		return { d: 'concierge' };
	}
	return {};
}

function getUrlWithQueryParam( url: string, queryParams: Record< string, string > ): string {
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
function saveUrlToCookieIfEcomm(
	saveUrlToCookie: SaveUrlToCookie,
	cart: ResponseCart | undefined,
	destinationUrl: string
): void {
	if ( cart && hasEcommercePlan( cart ) ) {
		saveUrlToCookie( destinationUrl );
	}
}

function modifyUrlIfAtomic( siteSlug: string | undefined, url: string ): string {
	// If atomic site, then replace wordpress.com with wpcomstaging.com
	if ( siteSlug?.includes( '.wpcomstaging.com' ) ) {
		return url.replace( /\b.wordpress.com/, '.wpcomstaging.com' );
	}
	return url;
}

function modifyCookieUrlIfAtomic(
	getUrlFromCookie: GetUrlFromCookie,
	saveUrlToCookie: SaveUrlToCookie,
	siteSlug: string | undefined
): void {
	const urlFromCookie = getUrlFromCookie();
	if ( ! urlFromCookie ) {
		return;
	}
	const updatedUrl = modifyUrlIfAtomic( siteSlug, urlFromCookie );

	if ( updatedUrl !== urlFromCookie ) {
		saveUrlToCookie( updatedUrl );
	}
}
