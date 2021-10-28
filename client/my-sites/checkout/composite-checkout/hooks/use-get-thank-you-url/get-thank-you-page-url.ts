import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
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
} from '@automattic/calypso-products';
import debugFactory from 'debug';
import {
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
	hasGoogleApps,
	hasTitanMail,
	hasTrafficGuide,
	hasDIFMProduct,
} from 'calypso/lib/cart-values/cart-items';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { getEligibleTitanDomain } from 'calypso/lib/titan';
import { addQueryArgs, isExternal, resemblesUrl, urlToSlug } from 'calypso/lib/url';
import { managePurchase } from 'calypso/me/purchases/paths';
import { PROFESSIONAL_EMAIL_OFFER } from 'calypso/my-sites/checkout/post-checkout-upsell-experiment-redirector';
import { persistSignupDestination, retrieveSignupDestination } from 'calypso/signup/storageUtils';
import type { Domain } from '@automattic/data-stores';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:composite-checkout:get-thank-you-page-url' );

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
	isJetpackCheckout = false,
	jetpackTemporarySiteId,
	adminPageRedirect,
	domains,
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
	isJetpackCheckout?: boolean;
	jetpackTemporarySiteId?: string;
	adminPageRedirect?: string;
	domains: Domain[] | undefined;
} ): string {
	debug( 'starting getThankYouPageUrl' );

	// If we're given an explicit `redirectTo` query arg, make sure it's either internal
	// (i.e. on WordPress.com), the same site as the cart's site, or a Jetpack or WP.com
	// site's block editor (in wp-admin). This is required for Jetpack's (and WP.com's)
	// paid blocks Upgrade Nudge.
	if ( redirectTo ) {
		const { protocol, hostname, port, pathname, query } = parseUrl( redirectTo, true, true );

		if ( resemblesUrl( redirectTo ) && hostname && urlToSlug( hostname ) === siteSlug ) {
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

	// If there's a redirect URL set on a product in the cart, use the most recent one.
	const urlFromCart = cart ? getRedirectUrlFromCart( cart ) : null;
	if ( urlFromCart ) {
		debug( 'returning url from cart', urlFromCart );
		return urlFromCart;
	}

	// Note: this function is called early on for redirect-type payment methods, when the receipt isn't set yet.
	// The `:receiptId` string is filled in by our pending page after the PayPal checkout
	const pendingOrReceiptId = getPendingOrReceiptId( receiptId, orderId, purchaseId );
	debug( 'pendingOrReceiptId is', pendingOrReceiptId );

	// jetpack userless & siteless checkout uses a special thank you page
	if ( isJetpackCheckout ) {
		if ( siteSlug ) {
			debug( 'redirecting to userless jetpack thank you' );

			// extract a product from the cart, in userless checkout there should only be one
			const productSlug = cart?.products[ 0 ]?.product_slug;

			return `/checkout/jetpack/thank-you/${ siteSlug }/${ productSlug ?? 'no_product' }`;
		}
		// siteless checkout
		debug( 'redirecting to siteless jetpack thank you' );

		// extract a product from the cart, in siteless checkout there should only be one
		const productSlug = cart?.products[ 0 ]?.product_slug;

		const thankYouUrlSiteLess = `/checkout/jetpack/thank-you/no-site/${
			productSlug ?? 'no_product'
		}`;

		const isValidReceiptId =
			! isNaN( parseInt( pendingOrReceiptId ) ) || pendingOrReceiptId === ':receiptId';
		return addQueryArgs(
			{
				receiptId: isValidReceiptId ? pendingOrReceiptId : undefined,
				siteId: jetpackTemporarySiteId && parseInt( jetpackTemporarySiteId ),
			},
			thankYouUrlSiteLess
		);
	}

	const fallbackUrl = getFallbackDestination( {
		pendingOrReceiptId,
		siteSlug,
		adminUrl,
		feature,
		cart,
		isJetpackNotAtomic: Boolean( isJetpackNotAtomic ),
		productAliasFromUrl,
		adminPageRedirect,
	} );
	debug( 'fallbackUrl is', fallbackUrl );

	// If receipt ID is 'noPreviousPurchase', then send the user to a generic page (not post-purchase related).
	// For example, this case arises when a Skip button is clicked on a concierge upsell
	// nudge opened by a direct link to /checkout/offer-support-session.
	if ( 'noPreviousPurchase' === pendingOrReceiptId ) {
		debug( 'receipt ID is "noPreviousPurchase", so returning: ', fallbackUrl );
		return fallbackUrl;
	}

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

	if ( cart && hasRenewalItem( cart ) && siteSlug ) {
		const renewalItem: ResponseCartProduct = getRenewalItems( cart )[ 0 ];
		if ( renewalItem && renewalItem.subscription_id ) {
			const managePurchaseUrl = managePurchase( siteSlug, renewalItem.subscription_id );
			debug(
				'renewal item in cart',
				renewalItem,
				'so returning managePurchaseUrl',
				managePurchaseUrl
			);
			return managePurchaseUrl;
		}
	}

	// Domain only flow
	if ( cart?.create_new_blog ) {
		const newBlogReceiptUrl = urlFromCookie
			? `${ urlFromCookie }/${ pendingOrReceiptId }`
			: fallbackUrl;
		debug( 'new blog created, so returning', newBlogReceiptUrl );
		return newBlogReceiptUrl;
	}

	const redirectUrlForPostCheckoutUpsell = getRedirectUrlForPostCheckoutUpsell( {
		pendingOrReceiptId,
		orderId,
		cart,
		siteSlug,
		hideUpsell: Boolean( hideNudge ),
		domains,
	} );

	if ( redirectUrlForPostCheckoutUpsell ) {
		debug(
			'redirect for post-checkout upsell exists, so returning',
			redirectUrlForPostCheckoutUpsell
		);

		return redirectUrlForPostCheckoutUpsell;
	}

	// Display mode is used to show purchase specific messaging, for e.g. the Schedule Session button
	// when purchasing a concierge session or when purchasing the Ultimate Traffic Guide
	const displayModeParam = getDisplayModeParamFromCart( cart );

	const thankYouPageUrlForTrafficGuide = getThankYouPageUrlForTrafficGuide( {
		cart,
		siteSlug,
		pendingOrReceiptId,
	} );
	if ( thankYouPageUrlForTrafficGuide ) {
		return getUrlWithQueryParam( thankYouPageUrlForTrafficGuide, displayModeParam );
	}

	if ( isEligibleForSignupDestinationResult && urlFromCookie ) {
		debug( 'is eligible for signup destination', urlFromCookie );
		const noticeType = getNoticeType( cart );
		const queryParams = { ...displayModeParam, ...noticeType };
		return getUrlWithQueryParam( urlFromCookie, queryParams );
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
	adminUrl,
	feature,
	cart,
	isJetpackNotAtomic,
	productAliasFromUrl,
	adminPageRedirect,
}: {
	pendingOrReceiptId: string;
	siteSlug: string | undefined;
	adminUrl: string | undefined;
	feature: string | undefined;
	cart: ResponseCart | undefined;
	isJetpackNotAtomic: boolean;
	productAliasFromUrl: string | undefined;
	adminPageRedirect?: string;
} ): string {
	const isCartEmpty = cart ? getAllCartItems( cart ).length === 0 : true;
	const isReceiptEmpty = ':receiptId' === pendingOrReceiptId;

	if ( 'noPreviousPurchase' === pendingOrReceiptId ) {
		debug( 'fallback is just root' );
		return '/';
	}

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

			const adminPath = adminPageRedirect || 'admin.php?page=jetpack#/recommendations';

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
		return getPlan(
			findFirstSimilarPlanKey( PLAN_BUSINESS, { term: currentPlan.term } )
		)?.getPathSlug();
	}

	return;
}

function getPlanUpgradeUpsellUrl( {
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

	if ( cart && hasPremiumPlan( cart ) ) {
		const upgradeItem = getNextHigherPlanSlug( cart );

		if ( upgradeItem ) {
			return `/checkout/${ siteSlug }/offer-plan-upgrade/${ upgradeItem }/${ pendingOrReceiptId }`;
		}
	}

	return;
}

function getRedirectUrlForPostCheckoutUpsell( {
	pendingOrReceiptId,
	orderId,
	cart,
	siteSlug,
	hideUpsell,
	domains,
}: {
	pendingOrReceiptId: string;
	orderId: number | undefined;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	hideUpsell: boolean;
	domains: Domain[] | undefined;
} ): string | undefined {
	if ( hideUpsell ) {
		return;
	}

	const professionalEmailUpsellUrl = getProfessionalEmailUpsellUrl( {
		pendingOrReceiptId,
		cart,
		orderId,
		siteSlug,
		domains,
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
			pendingOrReceiptId,
			cart,
			orderId,
			siteSlug,
		} );

		if ( planUpgradeUpsellUrl ) {
			return planUpgradeUpsellUrl;
		}
	}

	return;
}

function getProfessionalEmailUpsellUrl( {
	pendingOrReceiptId,
	cart,
	siteSlug,
	orderId,
	domains,
}: {
	pendingOrReceiptId: string;
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	orderId: number | undefined;
	domains: Domain[] | undefined;
} ): string | undefined {
	if ( orderId || ! cart ) {
		return;
	}

	if ( hasGoogleApps( cart ) || hasTitanMail( cart ) ) {
		return;
	}

	if ( hasPremiumPlan( cart ) ) {
		return;
	}

	if (
		! hasBloggerPlan( cart ) &&
		! hasPersonalPlan( cart ) &&
		! hasBusinessPlan( cart ) &&
		! hasEcommercePlan( cart )
	) {
		return;
	}

	const domainRegistrations = getDomainRegistrations( cart );

	let domainName = null;

	// Uses either a domain being purchased, or the first domain eligible found in site domains
	if ( domainRegistrations.length > 0 ) {
		domainName = domainRegistrations[ 0 ].meta;
	} else {
		const domain = getEligibleTitanDomain( siteSlug, domains, true );

		if ( domain ) {
			domainName = domain.name;
		}
	}

	if ( ! domainName ) {
		return;
	}

	return `/checkout/offer/${ PROFESSIONAL_EMAIL_OFFER }/${ domainName }/${ pendingOrReceiptId }/${ siteSlug }`;
}

function getDisplayModeParamFromCart( cart: ResponseCart | undefined ): Record< string, string > {
	if ( cart && hasConciergeSession( cart ) ) {
		return { d: 'concierge' };
	}
	if ( cart && hasTrafficGuide( cart ) ) {
		return { d: 'traffic-guide' };
	}
	return {};
}

function getNoticeType( cart: ResponseCart | undefined ): Record< string, string > {
	if ( cart ) {
		return { notice: 'purchase-success' };
	}

	return {};
}

function getUrlWithQueryParam( url: string, queryParams: Record< string, string > ): string {
	const { protocol, hostname, port, pathname, query, hash } = parseUrl( url, true );

	return formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: {
			...query,
			...queryParams,
		},
		hash,
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

function getThankYouPageUrlForTrafficGuide( {
	cart,
	siteSlug,
	pendingOrReceiptId,
}: {
	cart: ResponseCart | undefined;
	siteSlug: string | undefined;
	pendingOrReceiptId: string;
} ) {
	if ( ! cart ) return;
	if ( hasTrafficGuide( cart ) ) {
		return `/checkout/thank-you/${ siteSlug }/${ pendingOrReceiptId }`;
	}
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
