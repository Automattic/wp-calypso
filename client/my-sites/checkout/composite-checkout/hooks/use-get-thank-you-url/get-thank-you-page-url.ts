import {
	JETPACK_PRODUCTS_LIST,
	JETPACK_RESET_PLANS,
	JETPACK_REDIRECT_URL,
	PLAN_BUSINESS,
	redirectCheckoutToWpAdmin,
	findFirstSimilarPlanKey,
	getPlan,
	isPlan,
	isWpComPremiumPlan,
	isTitanMail,
	isDomainRegistration,
} from '@automattic/calypso-products';
import {
	URL_TYPE,
	determineUrlType,
	format as formatUrl,
	getUrlParts,
	getUrlFromParts,
} from '@automattic/calypso-url';
import debugFactory from 'debug';
import {
	getGoogleApps,
	hasGoogleApps,
	hasRenewalItem,
	getAllCartItems,
	getDomainRegistrations,
	getRenewalItems,
	hasConciergeSession,
	hasJetpackPlan,
	hasBloggerPlan,
	hasPersonalPlan,
	hasPremiumPlan,
	hasBusinessPlan,
	hasEcommercePlan,
	hasTitanMail,
	hasTrafficGuide,
	hasDIFMProduct,
	hasProPlan,
	hasStarterPlan,
} from 'calypso/lib/cart-values/cart-items';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { getEligibleTitanDomain } from 'calypso/lib/titan';
import { addQueryArgs, isExternal, resemblesUrl } from 'calypso/lib/url';
import { managePurchase } from 'calypso/me/purchases/paths';
import {
	clearSignupCompleteFlowName,
	getSignupCompleteFlowName,
	persistSignupDestination,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const debug = debugFactory( 'calypso:composite-checkout:get-thank-you-page-url' );

type SaveUrlToCookie = ( url: string ) => void;
type GetUrlFromCookie = () => string | undefined;

type PurchaseId = number;
type ReceiptId = number;
type ReceiptIdPlaceholder = ':receiptId';
type ReceiptIdOrPlaceholder = ReceiptIdPlaceholder | PurchaseId | ReceiptId;

/**
 * Determine where to send the user after checkout is complete.
 *
 * This logic is complex and in many cases quite old. To keep it functional and
 * comprehensible and to prevent regressions, all possible outputs are covered
 * by unit tests in
 * `client/my-sites/checkout/composite-checkout/test/composite-checkout-thank-you`.
 *
 * IF YOU CHANGE THIS FUNCTION ALSO CHANGE THE TESTS!
 *
 * IMPORTANT NOTE: this function must be called BEFORE checkout is complete
 * because redirect payment methods like PayPal send the user to the URL
 * returned by this function directly, so the URL must be generated and passed
 * to PayPal before the transaction begins.
 */
export default function getThankYouPageUrl( {
	siteSlug,
	adminUrl,
	redirectTo,
	receiptId,
	noPurchaseMade,
	orderId,
	purchaseId,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	getUrlFromCookie = retrieveSignupDestination,
	saveUrlToCookie = persistSignupDestination,
	hideNudge,
	isInModal,
	isJetpackCheckout = false,
	jetpackTemporarySiteId,
	adminPageRedirect,
	domains,
}: {
	siteSlug?: string;
	adminUrl?: string;
	redirectTo?: string;
	receiptId?: number | string;
	noPurchaseMade?: boolean;
	orderId?: number | string;
	purchaseId?: number | string;
	feature?: string;
	cart?: ResponseCart;
	isJetpackNotAtomic?: boolean;
	productAliasFromUrl?: string;
	getUrlFromCookie?: GetUrlFromCookie;
	saveUrlToCookie?: SaveUrlToCookie;
	hideNudge?: boolean;
	isInModal?: boolean;
	isJetpackCheckout?: boolean;
	jetpackTemporarySiteId?: string;
	adminPageRedirect?: string;
	domains?: ResponseDomain[];
} ): string {
	debug( 'starting getThankYouPageUrl' );

	// If we're given an explicit `redirectTo` query arg, make sure it's either internal
	// (i.e. on WordPress.com), the same site as the cart's site, a Jetpack cloud URL,
	// or a Jetpack or WP.com site's block editor (in wp-admin). This is required for Jetpack's
	// (and WP.com's) paid blocks Upgrade Nudge.
	if ( redirectTo ) {
		const { protocol, hostname, port, pathname, searchParams } = getUrlParts( redirectTo );

		if ( resemblesUrl( redirectTo ) && isRedirectSameSite( redirectTo, siteSlug ) ) {
			debug( 'has same site redirectTo, so returning that', redirectTo );
			return redirectTo;
		}
		if ( ! isExternal( redirectTo ) ) {
			debug( 'has a redirectTo that is not external, so returning that', redirectTo );
			return redirectTo;
		}
		// We cannot simply compare `hostname` to `siteSlug`, since the latter
		// might contain a path in the case of Jetpack subdirectory installs.
		if ( adminUrl && redirectTo.startsWith( `${ adminUrl }post.php?` ) ) {
			const sanitizedRedirectTo = getUrlFromParts( {
				protocol: protocol,
				hostname: hostname,
				port: port,
				pathname: pathname,
				searchParams: new URLSearchParams( {
					post: searchParams.get( 'post' ) as string,
					action: 'edit',
					plan_upgraded: '1',
				} ),
			} ).href;
			debug( 'returning sanitized internal redirectTo', sanitizedRedirectTo );
			return sanitizedRedirectTo;
		}

		if ( hostname === 'cloud.jetpack.com' || hostname === 'jetpack.cloud.localhost' ) {
			debug( 'returning Jetpack cloud redirectTo', redirectTo );
			return redirectTo;
		}

		debug( 'ignorning redirectTo', redirectTo );
	}

	// If there's a redirect URL set on a product in the cart, use the most recent one.
	const urlFromCart = cart ? getRedirectUrlFromCart( cart ) : null;
	if ( urlFromCart ) {
		debug( 'returning url from cart', urlFromCart );
		return urlFromCart;
	}

	// Note: this function is called early on for redirect payment methods like
	// PayPal, when the receipt isn't set yet.
	//
	// For redirect payment methods like Bancontact or PayPal, the `return_url`
	// submitted to the payment partner (Stripe or PayPal) actually redirects to
	// a pseudo-endpoint (`/me/transactions/source-payment` or
	// `/me/transactions/paypal-express`) on `public-api.wordpress.com`.
	//
	// That pseudo-endpoint performs various duties and then uses a 302 redirect
	// to send the browser to the `success_url` originally sent by checkout to
	// start the transaction (to either the `/me/transactions` or
	// `/me/paypal-express-url` endpoint). That URL sometimes is for the calypso
	// "pending" page (`/checkout/thank-you/:site/pending/:orderId`) which
	// requires an order ID and its own `redirectTo` query param.
	//
	// The pseudo-endpoint modifies the `success_url` to add that order ID and to
	// replace the `:receiptId` placeholder with the actual receipt ID for the
	// transaction. The pending page (the `CheckoutPending` component in calypso)
	// then redirects the browser to the receipt page.
	//
	// If the receipt does not yet exist, then the pending page polls the orders
	// endpoint (`/me/transactions/order/:orderId`) for the transaction data,
	// then replaces the `:receiptId` placeholder itself and redirects to the
	// receipt page.
	const receiptIdOrPlaceholder = getReceiptIdOrPlaceholder( receiptId, purchaseId );
	debug( 'receiptIdOrPlaceholder is', receiptIdOrPlaceholder );

	// jetpack userless & siteless checkout uses a special thank you page
	if ( isJetpackCheckout ) {
		// extract a product from the cart, in userless/siteless checkout there should only be one
		const productSlug = cart?.products[ 0 ]?.product_slug ?? 'no_product';

		if ( siteSlug ) {
			debug( 'redirecting to userless jetpack thank you' );
			return `/checkout/jetpack/thank-you/${ siteSlug }/${ productSlug }`;
		}

		// siteless checkout
		debug( 'redirecting to siteless jetpack thank you' );
		const thankYouUrl = `/checkout/jetpack/thank-you/licensing-auto-activate/${ productSlug }`;

		return addQueryArgs(
			{
				receiptId: receiptIdOrPlaceholder,
				siteId: jetpackTemporarySiteId && parseInt( jetpackTemporarySiteId ),
			},
			thankYouUrl
		);
	}

	// If there is no purchase, then send the user to a generic page (not
	// post-purchase related). For example, this case arises when a Skip button
	// is clicked on a concierge upsell nudge opened by a direct link to
	// /checkout/offer-support-session.
	if ( noPurchaseMade ) {
		debug( 'there was no purchase, so returning calypso root' );
		return '/';
	}

	// Manual renewals usually have a `redirectTo` but if they do not, return to
	// the manage purchases page.
	const firstRenewalInCart =
		cart && hasRenewalItem( cart ) ? getRenewalItems( cart )[ 0 ] : undefined;
	if ( siteSlug && firstRenewalInCart?.subscription_id ) {
		const managePurchaseUrl = managePurchase( siteSlug, firstRenewalInCart.subscription_id );
		debug(
			'renewal item in cart',
			firstRenewalInCart,
			'so returning managePurchaseUrl',
			managePurchaseUrl
		);
		return managePurchaseUrl;
	}

	updateUrlInCookie( {
		adminPageRedirect,
		adminUrl,
		cart,
		feature,
		getUrlFromCookie,
		isInModal,
		isJetpackNotAtomic: Boolean( isJetpackNotAtomic ),
		orderId,
		productAliasFromUrl,
		receiptIdOrPlaceholder,
		redirectTo,
		saveUrlToCookie,
		siteSlug,
	} );

	// Fetch the thank-you page url from a cookie if it is set.
	const urlFromCookie = getUrlFromCookie();
	debug( 'cookie url is', urlFromCookie );

	// Use the cookie post-checkout URL followed by the receipt ID if this is a
	// signup flow that is not only for domain registrations and the cookie
	// post-checkout URL is not the signup "intent" flow.
	const signupFlowName = getSignupCompleteFlowName();
	const isDomainOnly =
		siteSlug === 'no-site' && getAllCartItems( cart ).every( isDomainRegistration );
	if (
		( cart?.create_new_blog || signupFlowName === 'domain' ) &&
		! isDomainOnly &&
		urlFromCookie &&
		receiptIdOrPlaceholder &&
		! urlFromCookie.includes( '/start/setup-site' )
	) {
		clearSignupCompleteFlowName();
		const newBlogReceiptUrl = `${ urlFromCookie }/${ receiptIdOrPlaceholder }`;
		debug( 'new blog created, so returning', newBlogReceiptUrl );
		return newBlogReceiptUrl;
	}

	const redirectUrlForPostCheckoutUpsell = receiptIdOrPlaceholder
		? getRedirectUrlForPostCheckoutUpsell( {
				receiptId: receiptIdOrPlaceholder,
				cart,
				siteSlug,
				hideUpsell: Boolean( hideNudge ),
				domains,
				isDomainOnly,
		  } )
		: undefined;

	if ( redirectUrlForPostCheckoutUpsell ) {
		debug(
			'redirect for post-checkout upsell exists, so returning',
			redirectUrlForPostCheckoutUpsell
		);

		return redirectUrlForPostCheckoutUpsell;
	}

	// Display the regular receipt thank-you page with specific messaging from
	// the display mode query param if the purchase includes the traffic-guide.
	if ( receiptIdOrPlaceholder && cart && hasTrafficGuide( cart ) ) {
		const thankYouPageUrlForTrafficGuide = getThankYouPageUrlForTrafficGuide( {
			siteSlug,
			receiptIdOrPlaceholder,
		} );
		return getUrlWithQueryParam( thankYouPageUrlForTrafficGuide, { d: 'traffic-guide' } );
	}

	// The display mode query param (eg: `?d=concierge`) is used to show
	// purchase-specific messaging, for e.g. the Schedule Session button when
	// purchasing a concierge session or when purchasing the Ultimate Traffic
	// Guide.
	const displayModeParam = getDisplayModeParamFromCart( cart );

	// Display the cookie post-checkout URL (with the display mode query param
	// for special product-specific messaging and a notice param used by
	// in-editor checkout) if there is one set and the cart does not contain
	// Google Apps without a domain receipt.
	if ( cart && ! doesCartContainGoogleAppsWithoutDomainReceipt( cart ) && urlFromCookie ) {
		debug( 'is eligible for signup destination', urlFromCookie );
		const noticeType = getNoticeType( cart );
		const queryParams = { ...displayModeParam, ...noticeType };
		return getUrlWithQueryParam( urlFromCookie, queryParams );
	}

	const fallbackUrl = getFallbackDestination( {
		receiptIdOrPlaceholder,
		orderId,
		siteSlug,
		adminUrl,
		feature,
		cart,
		isJetpackNotAtomic: Boolean( isJetpackNotAtomic ),
		productAliasFromUrl,
		adminPageRedirect,
		redirectTo,
	} );
	debug( 'returning fallback url', fallbackUrl );
	return getUrlWithQueryParam( fallbackUrl, displayModeParam ?? {} );
}

function updateUrlInCookie( {
	adminPageRedirect,
	adminUrl,
	cart,
	feature,
	getUrlFromCookie,
	isInModal,
	isJetpackNotAtomic,
	orderId,
	productAliasFromUrl,
	receiptIdOrPlaceholder,
	redirectTo,
	saveUrlToCookie,
	siteSlug,
}: {
	adminPageRedirect?: string;
	adminUrl?: string;
	cart?: ResponseCart;
	feature?: string;
	getUrlFromCookie: GetUrlFromCookie;
	isInModal?: boolean;
	isJetpackNotAtomic?: boolean;
	orderId?: number | string;
	productAliasFromUrl?: string;
	receiptIdOrPlaceholder: ReceiptIdOrPlaceholder | undefined;
	redirectTo?: string;
	saveUrlToCookie: SaveUrlToCookie;
	siteSlug?: string;
} ): void {
	// If there is an ecommerce plan in cart, then irrespective of the signup
	// flow destination (which tends to be set in a cookie), we will want the
	// final destination to always be "Thank You" page for the eCommerce plan.
	// This is because the ecommerce store setup happens in this page. If the
	// user purchases additional products via upsell nudges, the original saved
	// receipt ID will be used to display the Thank You page for the eCommerce
	// plan purchase.
	if ( cart && hasEcommercePlan( cart ) ) {
		const fallbackUrl = getFallbackDestination( {
			adminPageRedirect,
			adminUrl,
			cart,
			feature,
			isJetpackNotAtomic: Boolean( isJetpackNotAtomic ),
			orderId,
			productAliasFromUrl,
			receiptIdOrPlaceholder,
			redirectTo,
			siteSlug,
		} );

		saveUrlToCookie( fallbackUrl );
	}

	// If the user is making a purchase/upgrading within the editor, we want to
	// return them back to the editor after the purchase is successful.
	if ( isInModal && cart && ! hasEcommercePlan( cart ) ) {
		saveUrlToCookie( window?.location.href );
	}

	modifyCookieUrlIfAtomic( getUrlFromCookie, saveUrlToCookie, siteSlug );
}

function getReceiptIdOrPlaceholder(
	receiptId: string | number | undefined,
	purchaseId: string | number | undefined
): ReceiptIdOrPlaceholder | undefined {
	if ( receiptId && Number.isInteger( Number( receiptId ) ) ) {
		return Number( receiptId );
	}
	if ( receiptId && ! Number.isInteger( Number( receiptId ) ) ) {
		return undefined;
	}
	if ( purchaseId && Number.isInteger( Number( purchaseId ) ) ) {
		return Number( purchaseId );
	}
	if ( purchaseId && ! Number.isInteger( Number( purchaseId ) ) ) {
		return undefined;
	}
	return ':receiptId';
}

function getFallbackDestination( {
	receiptIdOrPlaceholder,
	orderId,
	siteSlug,
	adminUrl,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	adminPageRedirect,
	redirectTo,
}: {
	receiptIdOrPlaceholder: ReceiptIdOrPlaceholder | undefined;
	orderId?: string | number;
	siteSlug: string | undefined;
	adminUrl: string | undefined;
	feature: string | undefined;
	cart: ResponseCart | undefined;
	isJetpackNotAtomic: boolean;
	productAliasFromUrl: string | undefined;
	adminPageRedirect?: string;
	redirectTo?: string;
} ): string {
	const isCartEmpty = cart ? getAllCartItems( cart ).length === 0 : true;
	const isReceiptEmpty =
		':receiptId' === receiptIdOrPlaceholder || receiptIdOrPlaceholder === undefined;
	const isOrderEmpty = ! orderId;

	if ( ! siteSlug ) {
		debug( 'fallback is just root' );
		return '/';
	}

	if ( isReceiptEmpty && isCartEmpty && isOrderEmpty ) {
		debug( 'just site slug', siteSlug );
		return `/checkout/thank-you/${ siteSlug }`;
	}

	// If we just purchased a Jetpack product or a Jetpack plan (either Jetpack Security or Jetpack Complete),
	// redirect to the my plans page. The product being purchased can come from the `product` prop or from the
	// cart so we need to check both places.
	const productsWithCustomThankYou = [ ...JETPACK_PRODUCTS_LIST, ...JETPACK_RESET_PLANS ];

	// Check the cart (since our Thank You modal doesn't support multiple products, we only take the first
	// one found).
	const productFromCart = cart?.products?.find( ( { product_slug } ) =>
		( productsWithCustomThankYou as ReadonlyArray< string > ).includes( product_slug )
	)?.product_slug;

	const purchasedProduct =
		productFromCart ||
		productsWithCustomThankYou.find(
			( productWithCustom ) => productWithCustom === productAliasFromUrl
		);
	if ( isJetpackNotAtomic && purchasedProduct ) {
		debug( 'the site is jetpack and bought a jetpack product', siteSlug, purchasedProduct );

		const adminPath = redirectTo || adminPageRedirect || 'admin.php?page=jetpack#/recommendations';

		// Jetpack Cloud will either redirect to wp-admin (if JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN
		// flag is set), or otherwise will redirect to a Jetpack Redirect API url (source=jetpack-checkout-thankyou)
		if ( isJetpackCloud() ) {
			if ( redirectCheckoutToWpAdmin() && adminUrl ) {
				debug( 'checkout is Jetpack Cloud, returning wp-admin url' );
				return adminUrl + adminPath;
			}
			debug( 'checkout is Jetpack Cloud, returning Jetpack Redirect API url' );
			return `${ JETPACK_REDIRECT_URL }&site=${ siteSlug }&query=${ encodeURIComponent(
				`product=${ purchasedProduct }&thank-you=true`
			) }`;
		}
		// Otherwise if not Jetpack Cloud:
		return redirectCheckoutToWpAdmin() && adminUrl
			? adminUrl + adminPath
			: `/plans/my-plan/${ siteSlug }?thank-you=true&product=${ purchasedProduct }`;
	}

	// If we just purchased a legacy Jetpack plan, redirect to the Jetpack onboarding plugin install flow.
	if ( isJetpackNotAtomic ) {
		debug( 'the site is jetpack and has no jetpack product' );
		return `/plans/my-plan/${ siteSlug }?thank-you=true&install=all`;
	}

	if ( ! receiptIdOrPlaceholder ) {
		debug( 'product without receipt or placeholder' );
		return `/checkout/thank-you/${ siteSlug }`;
	}

	if ( feature && isValidFeatureKey( feature ) ) {
		debug( 'site with receipt or cart; feature is', feature );
		return `/checkout/thank-you/features/${ feature }/${ siteSlug }/${ receiptIdOrPlaceholder }`;
	}

	const titanProducts = cart?.products?.filter( ( product ) => isTitanMail( product ) );
	if ( titanProducts && titanProducts.length > 0 ) {
		const emails = titanProducts[ 0 ].extra?.email_users;
		if ( emails && emails.length > 0 ) {
			debug( 'site with titan products' );
			return `/checkout/thank-you/${ siteSlug }/${ receiptIdOrPlaceholder }?email=${ emails[ 0 ].email }`;
		}
	}

	debug( 'simple thank-you page' );
	return `/checkout/thank-you/${ siteSlug }/${ receiptIdOrPlaceholder }`;
}

/**
 * This function returns the product slug of the next higher plan of the plan item in the cart.
 * Currently, it only supports premium plans.
 *
 * @param {ResponseCart} cart the cart object
 * @returns {string|undefined} the product slug of the next higher plan if it exists, undefined otherwise.
 */
function getNextHigherPlanSlug( cart: ResponseCart ): string | undefined {
	const currentPlanSlug = cart && getAllCartItems( cart ).filter( isPlan )[ 0 ]?.product_slug;
	if ( ! currentPlanSlug ) {
		return;
	}

	const currentPlan = getPlan( currentPlanSlug );

	if ( isWpComPremiumPlan( currentPlanSlug ) ) {
		const planKey = findFirstSimilarPlanKey( PLAN_BUSINESS, { term: currentPlan?.term } );
		return planKey ? getPlan( planKey )?.getPathSlug?.() : undefined;
	}

	return;
}

function getPlanUpgradeUpsellUrl( {
	receiptId,
	cart,
	siteSlug,
}: {
	receiptId: ReceiptId | ReceiptIdPlaceholder;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
} ): string | undefined {
	if ( cart && hasPremiumPlan( cart ) ) {
		const upgradeItem = getNextHigherPlanSlug( cart );

		if ( upgradeItem ) {
			return `/checkout/${ siteSlug }/offer-plan-upgrade/${ upgradeItem }/${ receiptId }`;
		}
	}

	return;
}

function getRedirectUrlForPostCheckoutUpsell( {
	receiptId,
	cart,
	siteSlug,
	hideUpsell,
	domains,
	isDomainOnly,
}: {
	receiptId: ReceiptId | ReceiptIdPlaceholder;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	hideUpsell: boolean;
	domains: ResponseDomain[] | undefined;
	isDomainOnly?: boolean;
} ): string | undefined {
	if ( hideUpsell ) {
		return;
	}
	const professionalEmailUpsellUrl = getProfessionalEmailUpsellUrl( {
		receiptId,
		cart,
		siteSlug,
		domains,
		isDomainOnly,
	} );

	if ( professionalEmailUpsellUrl ) {
		return professionalEmailUpsellUrl;
	}

	if (
		cart &&
		! hasJetpackPlan( cart ) &&
		! hasDIFMProduct( cart ) &&
		( hasBloggerPlan( cart ) ||
			hasPersonalPlan( cart ) ||
			hasPremiumPlan( cart ) ||
			hasBusinessPlan( cart ) )
	) {
		// A user just purchased one of the qualifying plans

		const planUpgradeUpsellUrl = getPlanUpgradeUpsellUrl( {
			receiptId,
			cart,
			siteSlug,
		} );

		if ( planUpgradeUpsellUrl ) {
			return planUpgradeUpsellUrl;
		}
	}
}

function getProfessionalEmailUpsellUrl( {
	receiptId,
	cart,
	siteSlug,
	domains,
	isDomainOnly,
}: {
	receiptId: ReceiptId | ReceiptIdPlaceholder;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	domains: ResponseDomain[] | undefined;
	isDomainOnly?: boolean;
} ): string | undefined {
	if ( ! cart ) {
		return;
	}

	if ( hasGoogleApps( cart ) || hasTitanMail( cart ) ) {
		return;
	}

	if ( hasPremiumPlan( cart ) ) {
		return;
	}

	if (
		! isDomainOnly &&
		! hasBloggerPlan( cart ) &&
		! hasPersonalPlan( cart ) &&
		! hasBusinessPlan( cart ) &&
		! hasEcommercePlan( cart ) &&
		! hasProPlan( cart ) &&
		! hasStarterPlan( cart )
	) {
		return;
	}

	const domainRegistrations = getDomainRegistrations( cart );

	let domainName = null;

	// Uses either a domain being purchased, or the first domain eligible found in site domains
	if ( domainRegistrations.length > 0 ) {
		domainName = domainRegistrations[ 0 ].meta;
	} else if ( siteSlug && domains ) {
		const domain = getEligibleTitanDomain( siteSlug, domains, true );

		if ( domain ) {
			domainName = domain.name;
		}
	}

	if ( ! domainName ) {
		return;
	}

	return `/checkout/offer-professional-email/${ domainName }/${ receiptId }/${ siteSlug }`;
}

function getDisplayModeParamFromCart(
	cart: ResponseCart | undefined
): undefined | { d: 'concierge' | 'traffic-guide' } {
	if ( cart && hasConciergeSession( cart ) ) {
		return { d: 'concierge' };
	}
	if ( cart && hasTrafficGuide( cart ) ) {
		return { d: 'traffic-guide' };
	}
	return undefined;
}

function getNoticeType(
	cart: ResponseCart | undefined
): undefined | { notice: 'purchase-success' } {
	if ( cart ) {
		return { notice: 'purchase-success' };
	}
	return undefined;
}

function getUrlWithQueryParam( url = '/', queryParams: Record< string, string > = {} ): string {
	const urlType = determineUrlType( url );
	if ( urlType === URL_TYPE.INVALID || urlType === URL_TYPE.PATH_RELATIVE ) {
		return url;
	}
	const { search, origin, host, ...parsedURL } = getUrlParts( url );

	// getUrlFromParts can only handle absolute URLs, so add dummy data if needed.
	// formatUrl will remove it away, to match the previous url type.
	parsedURL.protocol = parsedURL.protocol || 'https:';
	parsedURL.hostname = parsedURL.hostname || '__domain__.invalid';

	const urlParts = {
		...parsedURL,
		searchParams: new URLSearchParams( {
			...Object.fromEntries( new URLSearchParams( search ) ),
			...queryParams,
		} ),
	};

	return formatUrl( getUrlFromParts( urlParts ), urlType );
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

function getThankYouPageUrlForTrafficGuide( {
	siteSlug,
	receiptIdOrPlaceholder,
}: {
	siteSlug: string | undefined;
	receiptIdOrPlaceholder: ReceiptIdOrPlaceholder;
} ) {
	return `/checkout/thank-you/${ siteSlug }/${ receiptIdOrPlaceholder }`;
}

function getRedirectUrlFromCart( cart: ResponseCart ): string | null {
	const firstProductWithUrl = cart.products.reduce(
		( mostRecent: ResponseCartProduct | null, product: ResponseCartProduct ) => {
			if ( product.extra?.afterPurchaseUrl ) {
				if ( ! mostRecent ) {
					return product;
				}
				if ( product.time_added_to_cart > mostRecent.time_added_to_cart ) {
					return product;
				}
			}
			return mostRecent;
		},
		null
	);
	debug(
		'looking for redirect url in cart products found',
		firstProductWithUrl?.extra.afterPurchaseUrl
	);
	return firstProductWithUrl?.extra.afterPurchaseUrl ?? null;
}

function isRedirectSameSite( redirectTo: string, siteSlug?: string ) {
	if ( ! siteSlug ) {
		return false;
	}
	const { hostname, pathname } = getUrlParts( redirectTo );
	// For subdirectory site, check that both hostname and subdirectory matches the siteSlug (host.name::subdirectory).
	if ( siteSlug.indexOf( '::' ) !== -1 ) {
		const slugParts = siteSlug.split( '::' );
		const hostnameFromSlug = slugParts[ 0 ];
		const subDirectoryPathFromSlug = slugParts.splice( 1 ).join( '/' );
		return (
			hostname === hostnameFromSlug && pathname?.startsWith( `/${ subDirectoryPathFromSlug }` )
		);
	}
	// For standard non-subdirectory site, check that hostname matches the siteSlug.
	return hostname === siteSlug;
}

function doesCartContainGoogleAppsWithoutDomainReceipt( cart: ResponseCart ): boolean {
	if ( ! hasGoogleApps( cart ) ) {
		return false;
	}
	const googleAppsProducts = getGoogleApps( cart );
	const domainReceiptId = googleAppsProducts[ 0 ].extra.receipt_for_domain;
	if ( ! domainReceiptId ) {
		return true;
	}
	return false;
}
