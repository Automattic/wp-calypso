/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_EXTRA_LICENSE_SLUG,
} from 'calypso/lib/gsuite/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import {
	formatProduct,
	isCustomDesign,
	isDomainMapping,
	isDomainProduct,
	isDomainRegistration,
	isDomainTransfer,
	isEcommerce,
	isFreeWordPressComDomain,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackProduct,
	isNoAds,
	isPlan,
	isBlogger,
	isPersonal,
	isPremium,
	isBusiness,
	isSiteRedirect,
	isSpaceUpgrade,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isVideoPress,
	isConciergeSession,
	isTrafficGuide,
	isTitanMail,
	isP2Plus,
	isMonthlyProduct,
	getTermDuration,
	getPlan,
	isBloggerPlan,
	isWpComFreePlan,
	isWpComBloggerPlan,
} from '@automattic/calypso-products';
import { getTld } from 'calypso/lib/domains';
import { domainProductSlugs } from 'calypso/lib/domains/constants';

/**
 * Retrieves all the items in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct[]} the list of items in the shopping cart as `ResponseCartProduct` objects
 */
export function getAllCartItems( cart ) {
	return ( cart && cart.products ) || [];
}

/**
 * Gets the renewal items from the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {Array} an array of renewal items
 */
export function getRenewalItems( cart ) {
	return getAllCartItems( cart ).filter( isRenewal );
}

/**
 * Determines whether there is any kind of plan (e.g. Premium or Business) in the shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
export function hasPlan( cart ) {
	return cart && getAllCartItems( cart ).some( isPlan );
}

/**
 * Determines whether there is a Jetpack plan in the shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one Jetpack plan, false otherwise
 */
export function hasJetpackPlan( cart ) {
	return getAllCartItems( cart ).some( isJetpackPlan );
}

/**
 * Determines whether there is a P2+ plan in the shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one P2+ plan, false otherwise
 */
export function hasP2PlusPlan( cart ) {
	return getAllCartItems( cart ).some( isP2Plus );
}

/**
 * Determines whether there is an ecommerce plan in the shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
export function hasEcommercePlan( cart ) {
	return cart && getAllCartItems( cart ).some( isEcommerce );
}

export function hasBloggerPlan( cart ) {
	return getAllCartItems( cart ).some( isBlogger );
}

export function hasPersonalPlan( cart ) {
	return getAllCartItems( cart ).some( isPersonal );
}

export function hasPremiumPlan( cart ) {
	return getAllCartItems( cart ).some( isPremium );
}

export function hasBusinessPlan( cart ) {
	return getAllCartItems( cart ).some( isBusiness );
}

export function hasDomainCredit( cart ) {
	return cart.has_bundle_credit || hasPlan( cart );
}

export function hasMonthlyCartItem( cart ) {
	return getAllCartItems( cart ).some( isMonthlyProduct );
}

/**
 * Determines whether there is at least one item of a given product in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @param {string} productSlug - the unique string that identifies the product
 * @returns {boolean} true if there is at least one item of the specified product type, false otherwise
 */
export function hasProduct( cart, productSlug ) {
	return getAllCartItems( cart ).some( function ( cartItem ) {
		return cartItem.product_slug === productSlug;
	} );
}

/**
 * Determines whether there is at least one domain registration item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one domain registration item, false otherwise
 */
export function hasDomainRegistration( cart ) {
	return getAllCartItems( cart ).some( isDomainRegistration );
}

/**
 * Determines whether there is at least one new domain registration item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one new domain registration item, false otherwise
 */
export function hasNewDomainRegistration( cart ) {
	return getAllCartItems( cart ).some( isNewDomainRegistration );
}

/**
 * Determines whether there is at least one domain registration renewal item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one domain registration renewal item, false otherwise
 */
export function hasDomainRenewal( cart ) {
	return getAllCartItems( cart ).some( isDomainRenewal );
}

/**
 * Determines whether the supplied cart item is a new domain registration (i.e. not a renewal).
 *
 * @param {import('@automattic/shopping-cart').ResponseCartProduct} cartItem - cart item
 * @returns {boolean} true if the cart item is a new domain registration, false otherwise.
 */
function isNewDomainRegistration( cartItem ) {
	return isDomainRegistration( cartItem ) && ! isRenewal( cartItem );
}

/**
 * Determines whether the supplied cart item is a domain renewal.
 *
 * @param {import('@automattic/shopping-cart').ResponseCartProduct} cartItem - cart item
 * @returns {boolean} true if the cart item is a domain renewal, false otherwise.
 */
function isDomainRenewal( cartItem ) {
	return isRenewal( cartItem ) && isDomainRegistration( cartItem );
}

export function hasDomainBeingUsedForPlan( cart ) {
	return getDomainRegistrations( cart ).some( ( registration ) =>
		isDomainBeingUsedForPlan( cart, registration.meta )
	);
}

/**
 * Determines whether there is at least one renewal item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one renewal item, false otherwise
 */
export function hasRenewalItem( cart ) {
	return getAllCartItems( cart ).some( isRenewal );
}

/**
 * Determines whether there is at least one domain transfer item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one domain transfer item, false otherwise
 */
export function hasTransferProduct( cart ) {
	return getAllCartItems( cart ).some( isDomainTransfer );
}

/**
 * Retrieves all the domain transfer items in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct[]} the list of the corresponding items in the shopping cart as `ResponseCartProduct` objects
 */
export function getDomainTransfers( cart ) {
	return getAllCartItems( cart ).filter(
		( product ) => product.product_slug === domainProductSlugs.TRANSFER_IN
	);
}

/**
 * Determines whether all items are renewal items in the specified shopping cart.
 *
 * Ignores partial credits, which aren't really a line item in this sense.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there are only renewal items, false otherwise
 */
export function hasOnlyRenewalItems( cart ) {
	return getAllCartItems( cart ).every( ( item ) => isRenewal( item ) || isPartialCredits( item ) );
}

/**
 * Determines whether there is at least one concierge session item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one concierge session item, false otherwise
 */
export function hasConciergeSession( cart ) {
	return getAllCartItems( cart ).some( isConciergeSession );
}

/**
 * Determines whether there is a traffic guide item in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is a traffic guide item, false otherwise
 */
export function hasTrafficGuide( cart ) {
	return getAllCartItems( cart ).some( isTrafficGuide );
}

/**
 * Returns a bill period of given cartItem
 *
 * @param {object} cartItem - cartItem
 * @returns {number|null} bill period of given cartItem
 */
export function getCartItemBillPeriod( cartItem ) {
	let billPeriod = cartItem.bill_period;
	if ( ! Number.isInteger( billPeriod ) ) {
		const plan = getPlan( cartItem.product_slug );
		if ( plan ) {
			billPeriod = getTermDuration( plan.term );
		}
	}
	return billPeriod;
}

/**
 * Determines whether any product in the specified shopping cart is a renewable subscription.
 * Will return false if the cart is empty.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if any product in the cart renews
 */
export function hasRenewableSubscription( cart ) {
	return (
		cart.products &&
		getAllCartItems( cart ).some( ( cartItem ) => getCartItemBillPeriod( cartItem ) > 0 )
	);
}

/**
 * Creates a new shopping cart item for a plan.
 *
 * @param {string} productSlug - the unique string that identifies the product
 * @param {object} [properties] - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct | null} the new item
 */
export function planItem( productSlug, properties ) {
	// Free plan doesn't have shopping cart.
	if ( isWpComFreePlan( productSlug ) ) {
		return null;
	}

	const domainToBundle = properties?.domainToBundle ?? '';

	return {
		product_slug: productSlug,
		...( domainToBundle ? { extra: { domain_to_bundle: domainToBundle } } : {} ),
	};
}

/**
 * Determines whether a domain Item supports purchasing a privacy subscription
 *
 * @param {string} productSlug - e.g. domain_reg, dotblog_domain
 * @param {object} productsList - The list of products retrieved using getProductsList from state/products-list/selectors
 * @returns {boolean} true if the domainItem supports privacy protection purchase
 */
export function supportsPrivacyProtectionPurchase( productSlug, productsList ) {
	const product =
		Object.values( productsList ).find( ( item ) => item.product_slug === productSlug ) || {};
	return product?.is_privacy_protection_product_purchase_allowed ?? false;
}

/**
 * Creates a new shopping cart item for a domain.
 *
 * @param {string} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @param {string} source - optional source for the domain item, e.g. `getdotblog`.
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function domainItem( productSlug, domain, source ) {
	const extra = source ? { extra: { source: source } } : undefined;

	return Object.assign(
		{
			product_slug: productSlug,
			meta: domain,
		},
		extra
	);
}

/**
 * Creates a new shopping cart item for a premium theme.
 *
 * @param {string} themeSlug - the unique string that identifies the product
 * @param {string} [source] - optional source for the domain item, e.g. `getdotblog`.
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function themeItem( themeSlug, source ) {
	return {
		product_slug: 'premium_theme',
		meta: themeSlug,
		extra: {
			source: source,
		},
	};
}

/**
 * Creates a new shopping cart item for a domain registration.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function domainRegistration( properties ) {
	return {
		...domainItem( properties.productSlug, properties.domain, properties.source ),
		is_domain_registration: true,
		...( properties.extra ? { extra: properties.extra } : {} ),
	};
}

/**
 * Creates a new shopping cart item for a domain mapping.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function domainMapping( properties ) {
	return domainItem( 'domain_map', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for Site Redirect.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function siteRedirect( properties ) {
	return domainItem( 'offsite_redirect', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for an incoming domain transfer.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function domainTransfer( properties ) {
	return {
		...domainItem( domainProductSlugs.TRANSFER_IN, properties.domain, properties.source ),
		...( properties.extra ? { extra: properties.extra } : {} ),
	};
}

/**
 * Retrieves all the items in the specified shopping cart for G Suite or Google Workspace.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct[]} the list of the corresponding items in the shopping cart as `ResponseCartProduct` objects
 */
export function getGoogleApps( cart ) {
	return getAllCartItems( cart ).filter( isGSuiteOrExtraLicenseOrGoogleWorkspace );
}

/**
 * Creates a new shopping cart item for G Suite or Google Workspace.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function googleApps( properties ) {
	const { domain, meta, product_slug, quantity, new_quantity, users } = properties;

	const domainName = meta ?? domain;

	const productSlug =
		product_slug ||
		( config.isEnabled( 'google-workspace-migration' )
			? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GSUITE_BASIC_SLUG );

	const extra = {
		google_apps_users: users,
		...( new_quantity ? { new_quantity } : {} ),
	};

	return {
		...domainItem( productSlug, domainName ),
		...( quantity ? { quantity } : {} ),
		extra,
	};
}

export function googleAppsExtraLicenses( properties ) {
	const item = domainItem( GSUITE_EXTRA_LICENSE_SLUG, properties.domain, properties.source );

	return {
		...item,
		extra: { google_apps_users: properties.users },
	};
}

/**
 * Creates a new shopping cart item for Titan Mail Monthly.
 *
 * @param {object} properties - list of properties
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function titanMailMonthly( properties ) {
	return {
		...domainItem(
			TITAN_MAIL_MONTHLY_SLUG,
			properties.meta ?? properties.domain,
			properties.source
		),
		quantity: properties.quantity,
		extra: properties.extra,
	};
}

export function hasGoogleApps( cart ) {
	return getAllCartItems( cart ).some( isGSuiteOrExtraLicenseOrGoogleWorkspace );
}

export function hasTitanMail( cart ) {
	return getAllCartItems( cart ).some( isTitanMail );
}

export function customDesignItem() {
	return {
		product_slug: 'custom-design',
	};
}

export function noAdsItem() {
	return {
		product_slug: 'no-adverts/no-adverts.php',
	};
}

export function videoPressItem() {
	return {
		product_slug: 'videopress',
	};
}

export function unlimitedSpaceItem() {
	return {
		product_slug: 'unlimited_space',
	};
}

export function unlimitedThemesItem() {
	return {
		product_slug: 'unlimited_themes',
	};
}

export function spaceUpgradeItem( slug ) {
	return {
		product_slug: slug,
	};
}

/**
 * Creates a new shopping cart item for a jetpack product.
 *
 * @param {string} slug - the slug for the product
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new item
 */
export function jetpackProductItem( slug ) {
	return {
		product_slug: slug,
	};
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct[]} the list of the corresponding items in the shopping cart as `import('@automattic/shopping-cart').ResponseCartProduct` objects
 */
export function getDomainRegistrations( cart ) {
	return getAllCartItems( cart ).filter( ( product ) => product.is_domain_registration === true );
}

/**
 * Retrieves all the domain mapping items in the specified shopping cart.
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct[]} the list of the corresponding items in the shopping cart as `import('@automattic/shopping-cart').ResponseCartProduct` objects
 */
export function getDomainMappings( cart ) {
	return getAllCartItems( cart ).filter( ( product ) => product.product_slug === 'domain_map' );
}

/**
 * Returns a renewal CartItem object with the given properties and product slug.
 *
 * @param {string|object} product - the product object
 * @param {object} [properties] - properties to be included in the new CartItem object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} a CartItem object
 */
export function getRenewalItemFromProduct( product, properties ) {
	product = formatProduct( product );

	let cartItem;

	if ( isDomainProduct( product ) ) {
		cartItem = domainItem( product.product_slug, properties.domain, properties.source );
	}

	if ( isPlan( product ) ) {
		cartItem = planItem( product.product_slug );
	}

	if ( isGSuiteOrGoogleWorkspace( product ) ) {
		cartItem = googleApps( product );
	}

	if ( isTitanMail( product ) ) {
		cartItem = titanMailMonthly( product );
	}

	if ( isSiteRedirect( product ) ) {
		cartItem = siteRedirect( properties );
	}

	if ( isNoAds( product ) ) {
		cartItem = noAdsItem();
	}

	if ( isCustomDesign( product ) ) {
		cartItem = customDesignItem();
	}

	if ( isVideoPress( product ) ) {
		cartItem = videoPressItem();
	}

	if ( isUnlimitedSpace( product ) ) {
		cartItem = unlimitedSpaceItem();
	}

	if ( isUnlimitedThemes( product ) ) {
		cartItem = unlimitedThemesItem();
	}

	if ( isJetpackProduct( product ) ) {
		cartItem = jetpackProductItem( product.product_slug );
	}

	if ( isSpaceUpgrade( product ) ) {
		cartItem = spaceUpgradeItem( product.product_slug );
	}

	if ( ! cartItem ) {
		throw new Error( 'This product cannot be renewed.' );
	}

	return getRenewalItemFromCartItem( cartItem, product );
}

/**
 * Returns a renewal CartItem object from the given cartItem and properties.
 *
 * @param {import('@automattic/shopping-cart').ResponseCartProduct} cartItem - item
 * @param {object} properties - properties to be included in the new CartItem object
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} a CartItem object
 */
export function getRenewalItemFromCartItem( cartItem, properties ) {
	return {
		...cartItem,
		extra: {
			...cartItem.extra,
			purchaseId: properties.id,
			purchaseType: 'renewal',
		},
	};
}

export function hasDomainInCart( cart, domain ) {
	return getAllCartItems( cart ).some( ( product ) => {
		return product.is_domain_registration === true && product.meta === domain;
	} );
}

/**
 * Changes presence of a privacy protection for the given domain cart item.
 *
 * @param {import('@automattic/shopping-cart').ResponseCartProduct} item - the object for domain registrations
 * @param {boolean} value - whether privacy is on or off
 *
 * @returns {import('@automattic/shopping-cart').ResponseCartProduct} the new ResponseCartProduct with added/removed privacy
 */
export function updatePrivacyForDomain( item, value ) {
	return {
		...item,
		extra: {
			...item.extra,
			privacy: value,
		},
	};
}

/**
 * Determines whether a cart item is partial credits
 *
 * @param {import('@automattic/shopping-cart').ResponseCartProduct} cartItem - the cart product
 * @returns {boolean} true if item is credits
 */
function isPartialCredits( cartItem ) {
	return cartItem.product_slug === 'wordpress-com-credits';
}

/**
 * Determines whether a cart item is a renewal
 *
 * @param {{extra?: import('@automattic/shopping-cart').ResponseCartProductExtra}} cartItem - object with `extra` property
 * @returns {boolean} true if item is a renewal
 */
export function isRenewal( cartItem ) {
	return cartItem.extra && cartItem.extra.purchaseType === 'renewal';
}

/**
 * Returns true if, according to cart attributes, a `domain` should be free
 *
 * @param {object} cart Cart
 * @param {string} domain Domain
 * @returns {boolean} See description
 */
export function isNextDomainFree( cart, domain = '' ) {
	if ( ! cart || ! cart.next_domain_is_free ) {
		return false;
	}

	if ( cart.next_domain_condition === 'blog' ) {
		if ( getTld( domain ) !== 'blog' ) {
			return false;
		}
	}

	return true;
}

export function isDomainBundledWithPlan( cart, domain ) {
	const bundledDomain = cart?.bundledDomain ?? '';
	return '' !== bundledDomain && ( domain ?? '' ).toLowerCase() === bundledDomain.toLowerCase();
}

/**
 * Returns true if cart contains a plan and also a domain that comes for free with that plan
 *
 * @param {object} cart Cart
 * @param {string} domain Domain
 * @returns {boolean} see description
 */
export function isDomainBeingUsedForPlan( cart, domain ) {
	if ( ! cart || ! domain ) {
		return false;
	}

	if ( ! hasPlan( cart ) ) {
		return false;
	}

	const domainProducts = getDomainRegistrations( cart ).concat( getDomainMappings( cart ) );
	const domainProduct = domainProducts.shift() || {};
	const processedDomainInCart = domain === domainProduct.meta;
	if ( ! processedDomainInCart ) {
		return false;
	}

	if ( hasBloggerPlan( cart ) ) {
		const tld = domain.split( '.' ).pop();
		if ( tld !== 'blog' ) {
			return false;
		}
	}

	return true;
}

export function shouldBundleDomainWithPlan(
	withPlansOnly,
	selectedSite,
	cart,
	suggestionOrCartItem
) {
	return (
		withPlansOnly &&
		// not free or a cart item
		( isDomainRegistration( suggestionOrCartItem ) ||
			isDomainMapping( suggestionOrCartItem ) ||
			( suggestionOrCartItem.domain_name &&
				! isFreeWordPressComDomain( suggestionOrCartItem ) ) ) &&
		! isDomainBeingUsedForPlan( cart, suggestionOrCartItem.domain_name ) && // a plan in cart
		! isNextDomainFree( cart ) && // domain credit
		! hasPlan( cart ) && // already a plan in cart
		( ! selectedSite || ( selectedSite && selectedSite.plan.product_slug === 'free_plan' ) )
	); // site has a plan
}

/**
 * Sites on a blogger plan are not allowed to get an additional domain - they need to buy an upgrade to do that.
 * This function checks tells if user has to upgrade just to be able to pay for a domain.
 *
 * @param {object} selectedSite Site
 * @param {object} cart Cart
 * @param {string} domain Domain name
 * @returns {boolean} See description
 */
export function hasToUpgradeToPayForADomain( selectedSite, cart, domain ) {
	if ( ! domain || ! getTld( domain ) ) {
		return false;
	}

	const sitePlanSlug = ( ( selectedSite || {} ).plan || {} ).product_slug;
	const isDotBlogDomain = 'blog'.startsWith( getTld( domain ) );

	if ( sitePlanSlug && isWpComBloggerPlan( sitePlanSlug ) && ! isDotBlogDomain ) {
		return true;
	}

	if ( hasBloggerPlan( cart ) && ! isDotBlogDomain ) {
		return true;
	}

	return false;
}

export function isDomainMappingFree( selectedSite ) {
	return selectedSite && isPlan( selectedSite.plan ) && ! isBloggerPlan( selectedSite.plan );
}

export function isPaidDomain( domainPriceRule ) {
	return 'PRICE' === domainPriceRule;
}

const isMonthlyOrFreeFlow = ( flowName ) => {
	return (
		flowName &&
		[
			'free',
			'personal-monthly',
			'premium-monthly',
			'business-monthly',
			'ecommerce-monthly',
		].includes( flowName )
	);
};

export function getDomainPriceRule(
	withPlansOnly,
	selectedSite,
	cart,
	suggestion,
	isDomainOnly,
	flowName
) {
	if ( ! suggestion.product_slug || suggestion.cost === 'Free' ) {
		return 'FREE_DOMAIN';
	}

	if ( suggestion?.is_premium ) {
		return 'PRICE';
	}

	if ( isMonthlyOrFreeFlow( flowName ) ) {
		return 'PRICE';
	}

	if ( isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) {
		return 'FREE_WITH_PLAN';
	}

	if ( isDomainMapping( suggestion ) ) {
		if ( isDomainMappingFree( selectedSite ) ) {
			return 'FREE_WITH_PLAN';
		}

		if ( withPlansOnly ) {
			return 'INCLUDED_IN_HIGHER_PLAN';
		}

		return 'PRICE';
	}

	if ( isDomainOnly ) {
		return 'PRICE';
	}

	if ( isNextDomainFree( cart, suggestion.domain_name ) ) {
		return 'FREE_WITH_PLAN';
	}

	if ( shouldBundleDomainWithPlan( withPlansOnly, selectedSite, cart, suggestion ) ) {
		return 'INCLUDED_IN_HIGHER_PLAN';
	}

	if ( hasToUpgradeToPayForADomain( selectedSite, cart, suggestion.domain_name ) ) {
		return 'UPGRADE_TO_HIGHER_PLAN_TO_BUY';
	}

	return 'PRICE';
}

/**
 * Determines whether any items in the cart were added more than X time ago (10 minutes)
 *
 * @param {import('@automattic/shopping-cart').ResponseCart} cart - cart as `ResponseCart` object
 * @returns {boolean} true if there is at least one cart item added more than X time ago, false otherwise
 */
export function hasStaleItem( cart ) {
	return getAllCartItems( cart ).some( function ( cartItem ) {
		// time_added_to_cart is in seconds, Date.now() returns milliseconds
		return (
			cartItem.time_added_to_cart &&
			cartItem.time_added_to_cart * 1000 < Date.now() - 10 * 60 * 1000
		);
	} );
}
