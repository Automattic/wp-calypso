import {
	camelOrSnakeSlug,
	getPlan,
	getTermDuration,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_EXTRA_LICENSE_SLUG,
	isBiennially,
	isBlogger,
	isBloggerPlan,
	isBusiness,
	isConciergeSession,
	isCustomDesign,
	isDIFMProduct,
	isDomainMapping,
	isDomainMoveInternal,
	isDomainProduct,
	isDomainRegistration,
	isDomainTransfer,
	isEcommerce,
	isFreeWordPressComDomain,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackProduct,
	isMonthlyProduct,
	isNoAds,
	isP2Plus,
	isPersonal,
	isPlan,
	isPremium,
	isPro,
	isRenewable,
	isSiteRedirect,
	isSpaceUpgrade,
	isStarter,
	isTriennially,
	isTitanMail,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isVideoPress,
	isWpComBloggerPlan,
	isWpComFreePlan,
	TITAN_MAIL_MONTHLY_SLUG,
	TITAN_MAIL_YEARLY_SLUG,
	isAkismetProduct,
	isWpcomEnterpriseGridPlan,
	is100Year,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { isDomainForGravatarFlow, isHundredYearDomainFlow } from '@automattic/onboarding';
import { isWpComProductRenewal as isRenewal } from '@automattic/wpcom-checkout';
import { getTld } from 'calypso/lib/domains';
import { domainProductSlugs } from 'calypso/lib/domains/constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	ResponseCart,
	ResponseCartProduct,
	RequestCartProduct,
	RequestCartProductExtra,
	GSuiteProductUser,
	MinimalRequestCartProduct,
} from '@automattic/shopping-cart';

export const DOMAIN_PRICE_RULE = {
	ONE_TIME_PRICE: 'ONE_TIME_PRICE',
	FREE_DOMAIN: 'FREE_DOMAIN',
	FREE_FOR_FIRST_YEAR: 'FREE_FOR_FIRST_YEAR',
	FREE_WITH_PLAN: 'FREE_WITH_PLAN',
	PRICE: 'PRICE',
	DOMAIN_MOVE_PRICE: 'DOMAIN_MOVE_PRICE',
	INCLUDED_IN_HIGHER_PLAN: 'INCLUDED_IN_HIGHER_PLAN',
	UPGRADE_TO_HIGHER_PLAN_TO_BUY: 'UPGRADE_TO_HIGHER_PLAN_TO_BUY',
} as const;

type DomainPriceRule = ( typeof DOMAIN_PRICE_RULE )[ keyof typeof DOMAIN_PRICE_RULE ];

export type ObjectWithProducts = Pick< ResponseCart, 'products' >;

export function getAllCartItems( cart?: ObjectWithProducts ): ResponseCartProduct[] {
	return ( cart && cart.products ) || [];
}

export function getRenewalItems( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter( isRenewal );
}

/**
 * Determines whether there is a DIFM (Do it for me) product in the shopping cart.
 */
export function hasDIFMProduct( cart: ObjectWithProducts ): boolean {
	return cart && getAllCartItems( cart ).some( isDIFMProduct );
}

/**
 * Determines whether there is any kind of plan (e.g. Premium or Business) in the shopping cart.
 */
export function hasPlan( cart: ObjectWithProducts ): boolean {
	return cart && getAllCartItems( cart ).some( isPlan );
}

/**
 * Determines whether there is a Jetpack plan in the shopping cart.
 */
export function hasJetpackPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isJetpackPlan );
}

/**
 * Determines whether there is a P2+ plan in the shopping cart.
 */
export function hasP2PlusPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isP2Plus );
}

/**
 * Determines whether there is an ecommerce plan in the shopping cart.
 */
export function hasEcommercePlan( cart: ObjectWithProducts ): boolean {
	return cart && getAllCartItems( cart ).some( isEcommerce );
}

export function hasBloggerPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isBlogger );
}

export function hasPersonalPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isPersonal );
}

export function hasPremiumPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isPremium );
}

export function hasProPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isPro );
}

export function hasBusinessPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isBusiness );
}

export function has100YearPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( is100Year );
}

const isHundredYearDomain = ( product: {
	extra?: RequestCartProductExtra;
	volume?: number;
} ): boolean => {
	return Boolean( product.extra?.is_hundred_year_domain || product.volume === 100 );
};

export function has100YearDomain( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isHundredYearDomain );
}

export function hasStarterPlan( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isStarter );
}

export function hasMonthlyCartItem( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isMonthlyProduct );
}

export function hasBiennialCartItem( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isBiennially );
}

export function hasTriennialCartItem( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isTriennially );
}

/**
 * Determines whether there is at least one item of a given product in the specified shopping cart.
 */
export function hasProduct( cart: ObjectWithProducts, productSlug: string ): boolean {
	return getAllCartItems( cart ).some( function ( cartItem ) {
		return cartItem.product_slug === productSlug;
	} );
}

export function hasDomainRegistration( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isDomainRegistration );
}

export function hasDomainBeingUsedForPlan( cart: ObjectWithProducts ): boolean {
	return getDomainRegistrations( cart ).some( ( registration ) =>
		isDomainBeingUsedForPlan( cart, registration.meta )
	);
}

export function hasRenewalItem( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isRenewal );
}

export function hasTransferProduct( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isDomainTransfer );
}

export function hasFreeCouponTransfersOnly( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).every( ( item ) => {
		return (
			( isDomainTransfer( item ) &&
				item.is_sale_coupon_applied &&
				item.item_subtotal_integer === 0 ) ||
			isPartialCredits( item )
		);
	} );
}

export function getDomainTransfers( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter(
		( product ) => product.product_slug === domainProductSlugs.TRANSFER_IN
	);
}

/**
 * Determines whether all items are renewal items in the specified shopping cart.
 *
 * Ignores partial credits, which aren't really a line item in this sense.
 */
export function hasOnlyRenewalItems( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).every( ( item ) => isRenewal( item ) || isPartialCredits( item ) );
}

export function hasConciergeSession( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isConciergeSession );
}

/**
 * Returns a bill period of given cartItem
 */
export function getCartItemBillPeriod( cartItem: ResponseCartProduct ): number {
	const billPeriod = cartItem.bill_period ? parseInt( cartItem.bill_period, 10 ) : undefined;
	if ( ! Number.isInteger( billPeriod ) ) {
		const plan = getPlan( cartItem.product_slug );
		if ( plan ) {
			return getTermDuration( plan.term ) ?? 0;
		}
	}
	return billPeriod ?? 0;
}

/**
 * Determines whether any product in the specified shopping cart is a renewable subscription.
 *
 * Will return false if the cart is empty.
 */
export function hasRenewableSubscription( cart: ObjectWithProducts ): boolean {
	return (
		cart.products &&
		getAllCartItems( cart ).some( ( cartItem ) => getCartItemBillPeriod( cartItem ) > 0 )
	);
}

/**
 * Creates a new shopping cart item for a plan.
 */
export function planItem( productSlug: string ): { product_slug: string } | null {
	// Free and Enterprise plans don't have shopping cart.
	if ( isWpComFreePlan( productSlug ) || isWpcomEnterpriseGridPlan( productSlug ) ) {
		return null;
	}

	return {
		product_slug: productSlug,
	};
}

/**
 * Determines whether a domain Item supports purchasing a privacy subscription
 * @param {string} productSlug - e.g. domain_reg, dotblog_domain
 * @param {{product_slug: string, is_privacy_protection_product_purchase_allowed?: boolean}[]} productsList - The list of products retrieved using getProductsList from state/products-list/selectors
 * @returns {boolean} true if the domainItem supports privacy protection purchase
 */
export function supportsPrivacyProtectionPurchase(
	productSlug: string,
	productsList: { product_slug: string; is_privacy_protection_product_purchase_allowed?: boolean }[]
): boolean {
	const product = Object.values( productsList ).find(
		( item ) => item.product_slug === productSlug
	);
	return product?.is_privacy_protection_product_purchase_allowed ?? false;
}

/**
 * Creates a new shopping cart item for a domain.
 * @param {string} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @param {string|undefined} [source] - optional source for the domain item, e.g. `getdotblog`.
 * @returns {MinimalRequestCartProduct} the new item
 */
export function domainItem(
	productSlug: string,
	domain: string,
	source?: string
): MinimalRequestCartProduct {
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
 * @param {string} themeSlug - the unique string that identifies the product
 * @param {string} [source] - optional source for the domain item, e.g. `getdotblog`.
 * @returns {MinimalRequestCartProduct} the new item
 */
export function themeItem( themeSlug: string, source?: string ): MinimalRequestCartProduct {
	return {
		product_slug: 'premium_theme',
		meta: themeSlug,
		extra: {
			source: source,
		},
	};
}

/**
 * Creates a new shopping cart item for a marketplace theme subscription.
 * @param productSlug the unique string that identifies the product
 * @returns {MinimalRequestCartProduct} the new item
 */
export function marketplaceThemeProduct( productSlug: string ): MinimalRequestCartProduct {
	return {
		product_slug: productSlug,
	};
}

/**
 * Creates a new shopping cart item for a domain registration.
 */
export function domainRegistration( properties: {
	productSlug: string;
	domain: string;
	source?: string;
	extra?: RequestCartProductExtra;
	volume?: number;
} ): MinimalRequestCartProduct & { is_domain_registration: boolean } {
	return {
		...domainItem( properties.productSlug, properties.domain, properties.source ),
		is_domain_registration: true,
		...( properties.volume ? { volume: properties.volume } : {} ),
		...( properties.extra ? { extra: properties.extra } : {} ),
	};
}

/**
 * Creates a new shopping cart item for a domain mapping.
 */
export function domainMapping( properties: {
	domain: string;
	source?: string;
} ): MinimalRequestCartProduct {
	return domainItem( 'domain_map', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for Site Redirect.
 */
export function siteRedirect( properties: {
	domain?: string;
	source?: string;
} ): MinimalRequestCartProduct {
	if ( ! properties.domain ) {
		throw new Error( 'Site redirect product requires a domain' );
	}
	return domainItem( 'offsite_redirect', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for an incoming domain transfer.
 */
export function domainTransfer( properties: {
	domain: string;
	source?: string;
	extra?: RequestCartProductExtra;
	volume?: number;
} ): MinimalRequestCartProduct {
	return {
		...domainItem( domainProductSlugs.TRANSFER_IN, properties.domain, properties.source ),
		...( properties.extra ? { extra: properties.extra } : {} ),
		...( properties.volume ? { volume: properties.volume } : {} ),
	};
}

/**
 * Retrieves all the items in the specified shopping cart for G Suite or Google Workspace.
 */
export function getGoogleApps( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter( isGSuiteOrExtraLicenseOrGoogleWorkspace );
}

/**
 * Creates a new shopping cart item for G Suite or Google Workspace.
 */
export function googleApps(
	properties: {
		domain?: string;
		meta?: string;
		new_quantity?: number;
		quantity?: number | null;
		users?: GSuiteProductUser[];
	} & ( WithCamelCaseSlug | WithSnakeCaseSlug )
): MinimalRequestCartProduct {
	const { quantity, new_quantity, users } = properties;

	const domainName = 'meta' in properties ? properties.meta : properties.domain;
	if ( ! domainName ) {
		throw new Error( 'A domain is required for a Google Apps item' );
	}

	const productSlug = camelOrSnakeSlug( properties ) || GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;

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

export function googleAppsExtraLicenses( properties: {
	domain: string;
	source?: string;
	users: GSuiteProductUser[];
} ): MinimalRequestCartProduct {
	const item = domainItem( GSUITE_EXTRA_LICENSE_SLUG, properties.domain, properties.source );

	return {
		...item,
		extra: { google_apps_users: properties.users },
	};
}

export interface TitanProductProps {
	domain?: string;
	meta?: string;
	source?: string;
	quantity?: number | null;
	extra?: RequestCartProductExtra;
}

/**
 * Creates a new shopping cart item for Titan Mail.
 */
function titanMailProduct(
	properties: TitanProductProps,
	productSlug: string
): MinimalRequestCartProduct {
	const domainName = properties.meta ?? properties.domain;

	if ( ! domainName ) {
		throw new Error( 'Titan mail requires a domain' );
	}

	return {
		...domainItem( productSlug, domainName, properties.source ),
		quantity: properties.quantity,
		extra: properties.extra,
	};
}

/**
 * Creates a new shopping cart item for Titan Mail Yearly.
 */
export function titanMailYearly( properties: TitanProductProps ): MinimalRequestCartProduct {
	return titanMailProduct( properties, TITAN_MAIL_YEARLY_SLUG );
}

/**
 * Creates a new shopping cart item for Titan Mail Monthly.
 */
export function titanMailMonthly( properties: TitanProductProps ): MinimalRequestCartProduct {
	return titanMailProduct( properties, TITAN_MAIL_MONTHLY_SLUG );
}

export function hasGoogleApps( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isGSuiteOrExtraLicenseOrGoogleWorkspace );
}

export function hasTitanMail( cart: ObjectWithProducts ): boolean {
	return getAllCartItems( cart ).some( isTitanMail );
}

export function customDesignItem(): MinimalRequestCartProduct {
	return {
		product_slug: 'custom-design',
	};
}

export function noAdsItem(): MinimalRequestCartProduct {
	return {
		product_slug: 'no-adverts/no-adverts.php',
	};
}

export function videoPressItem(): MinimalRequestCartProduct {
	return {
		product_slug: 'videopress',
	};
}

export function unlimitedSpaceItem(): MinimalRequestCartProduct {
	return {
		product_slug: 'unlimited_space',
	};
}

export function unlimitedThemesItem(): MinimalRequestCartProduct {
	return {
		product_slug: 'unlimited_themes',
	};
}

export function spaceUpgradeItem( slug: string ): MinimalRequestCartProduct {
	return {
		product_slug: slug,
	};
}

/**
 * Creates a new shopping cart item for a jetpack product.
 */
export function jetpackProductItem( slug: string ): MinimalRequestCartProduct {
	return {
		product_slug: slug,
	};
}

/**
 * Creates a new shopping cart item for an Akismet product.
 */
export function akismetProductItem( slug: string ): MinimalRequestCartProduct {
	return {
		product_slug: slug,
	};
}

/**
 * Creates a new shopping cart item for a renewable product.
 */
export function renewableProductItem( slug: string ): MinimalRequestCartProduct {
	return {
		product_slug: slug,
	};
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 */
export function getDomainRegistrations( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter( ( product ) => product.is_domain_registration === true );
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 */
export function getDomainsInCart( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter(
		( product ) => isDomainRegistration( product ) || isDomainMoveInternal( product )
	);
}

/**
 * Retrieves all the domain mapping items in the specified shopping cart.
 */
export function getDomainMappings( cart: ObjectWithProducts ): ResponseCartProduct[] {
	return getAllCartItems( cart ).filter( ( product ) => product.product_slug === 'domain_map' );
}

function createRenewalCartItemFromProduct(
	product: ( WithCamelCaseSlug | WithSnakeCaseSlug ) & {
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
		id: string | number;
		isRenewable?: boolean;
	} & Partial< RequestCartProduct > & {
			domain?: string;
			users?: GSuiteProductUser[];
		},
	properties: { domain?: string }
) {
	const slug = camelOrSnakeSlug( product );

	if ( isSpaceUpgrade( product ) ) {
		return spaceUpgradeItem( slug );
	}

	if ( isJetpackProduct( product ) ) {
		return jetpackProductItem( slug );
	}

	if ( isAkismetProduct( product ) ) {
		return akismetProductItem( slug );
	}

	if ( isUnlimitedThemes( product ) ) {
		return unlimitedThemesItem();
	}

	if ( isUnlimitedSpace( product ) ) {
		return unlimitedSpaceItem();
	}

	if ( isVideoPress( product ) ) {
		return videoPressItem();
	}

	if ( isCustomDesign( product ) ) {
		return customDesignItem();
	}

	if ( isNoAds( product ) ) {
		return noAdsItem();
	}

	if ( isSiteRedirect( product ) ) {
		return siteRedirect( properties );
	}

	if ( isTitanMail( product ) ) {
		return titanMailProduct( product, slug );
	}

	if ( isGSuiteOrGoogleWorkspace( product ) ) {
		return googleApps( product );
	}

	if ( isPlan( product ) ) {
		return planItem( slug );
	}

	if ( isDomainProduct( product ) ) {
		return domainItem( slug, properties.domain ?? '' );
	}

	if ( isRenewable( product ) ) {
		return renewableProductItem( slug );
	}

	return undefined;
}

/**
 * Returns a renewal CartItem object with the given properties and product slug.
 */
export function getRenewalItemFromProduct(
	product: ( WithCamelCaseSlug | WithSnakeCaseSlug ) & {
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
		id: string | number;
		isRenewable?: boolean;
	} & Partial< RequestCartProduct > & {
			domain?: string;
			users?: GSuiteProductUser[];
		},
	properties: { domain?: string; isMarketplaceProduct?: boolean }
): MinimalRequestCartProduct {
	const cartItem = createRenewalCartItemFromProduct( product, properties );
	if ( ! cartItem ) {
		throw new Error( 'This product cannot be renewed.' );
	}
	return getRenewalItemFromCartItem( cartItem, product );
}

/**
 * Returns a renewal CartItem object from the given cartItem and properties.
 */
export function getRenewalItemFromCartItem< T extends MinimalRequestCartProduct >(
	cartItem: T,
	properties: { id: string | number }
): T {
	return {
		...cartItem,
		extra: {
			...cartItem.extra,
			purchaseId: properties.id,
			purchaseType: 'renewal',
		},
	};
}

export function hasDomainInCart( cart: ObjectWithProducts, domain: string ): boolean {
	return getAllCartItems( cart ).some( ( product ) => {
		return (
			product.meta === domain &&
			( isDomainRegistration( product ) || isDomainMoveInternal( product ) )
		);
	} );
}

/**
 * Changes presence of a privacy protection for the given domain cart item.
 */
export function updatePrivacyForDomain< T extends MinimalRequestCartProduct >(
	item: T,
	value: boolean
): T {
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
 */
function isPartialCredits( cartItem: ResponseCartProduct ): boolean {
	return cartItem.product_slug === 'wordpress-com-credits';
}

/**
 * Returns true if, according to cart attributes, a `domain` should be free
 */
export function isNextDomainFree( cart?: ResponseCart, domain = '' ): boolean {
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

export function isDomainBundledWithPlan( cart?: ResponseCart, domain?: string ): boolean {
	const bundledDomain = cart?.bundled_domain ?? '';
	return '' !== bundledDomain && ( domain ?? '' ).toLowerCase() === bundledDomain.toLowerCase();
}

/**
 * Returns true if cart contains a plan and also a domain that comes for free with that plan
 */
export function isDomainBeingUsedForPlan( cart?: ObjectWithProducts, domain?: string ): boolean {
	if ( ! cart || ! domain ) {
		return false;
	}

	if ( ! hasPlan( cart ) ) {
		return false;
	}

	const domainProducts = getDomainRegistrations( cart ).concat( getDomainMappings( cart ) );
	const domainProduct = domainProducts.shift() || { meta: '' };
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

function hasSomeSlug( data: unknown ): data is WithSnakeCaseSlug | WithCamelCaseSlug {
	return Boolean(
		( data as WithSnakeCaseSlug ).product_slug || ( data as WithCamelCaseSlug ).productSlug
	);
}

export function shouldBundleDomainWithPlan(
	withPlansOnly: boolean,
	selectedSite: undefined | SiteDetails,
	cart: ResponseCart,
	suggestionOrCartItem: {
		product_slug?: string;
		productSlug?: string;
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
		domain_name?: string;
		is_free?: boolean;
	}
): boolean {
	return Boolean(
		withPlansOnly &&
			// not free or a cart item
			( isDomainRegistration( suggestionOrCartItem ) ||
				( hasSomeSlug( suggestionOrCartItem ) && isDomainMapping( suggestionOrCartItem ) ) ||
				( suggestionOrCartItem.domain_name &&
					! isFreeWordPressComDomain( suggestionOrCartItem ) ) ) &&
			! isDomainBeingUsedForPlan( cart, suggestionOrCartItem.domain_name ) && // a plan in cart
			! isNextDomainFree( cart ) && // domain credit
			! hasPlan( cart ) && // already a plan in cart
			( ! selectedSite || selectedSite.plan?.product_slug === 'free_plan' )
	); // site has a plan
}

/**
 * Sites on a blogger plan are not allowed to get an additional domain - they need to buy an upgrade to do that.
 * This function checks tells if user has to upgrade just to be able to pay for a domain.
 */
export function hasToUpgradeToPayForADomain(
	selectedSite: undefined | SiteDetails,
	cart: ObjectWithProducts,
	domain?: string
): boolean {
	if ( ! domain || ! getTld( domain ) ) {
		return false;
	}

	const sitePlanSlug = selectedSite?.plan?.product_slug;
	const isDotBlogDomain = 'blog'.startsWith( getTld( domain ) );

	if ( sitePlanSlug && isWpComBloggerPlan( sitePlanSlug ) && ! isDotBlogDomain ) {
		return true;
	}

	if ( hasBloggerPlan( cart ) && ! isDotBlogDomain ) {
		return true;
	}

	return false;
}

export function isDomainMappingFree( selectedSite: SiteDetails | null | undefined ): boolean {
	return Boolean(
		selectedSite?.plan &&
			isPlan( selectedSite.plan ) &&
			! isBloggerPlan( selectedSite.plan.product_slug )
	);
}

export function isPaidDomain( domainPriceRule: string ): boolean {
	return DOMAIN_PRICE_RULE.PRICE === domainPriceRule;
}

const isMonthlyOrFreeFlow = ( flowName: string | undefined ): boolean => {
	return Boolean(
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
	withPlansOnly: boolean,
	selectedSite: undefined | SiteDetails,
	cart: ResponseCart,
	suggestion: {
		product_slug?: string;
		productSlug?: string;
		cost?: string;
		sale_cost?: number;
		domain_name?: string;
		is_premium?: boolean;
	},
	isDomainOnly: boolean,
	flowName: string,
	domainAndPlanUpsellFlow: boolean
): DomainPriceRule {
	// We'll show a fixed, one time price in the 100-year domain flow
	if ( isHundredYearDomainFlow( flowName ) ) {
		return DOMAIN_PRICE_RULE.ONE_TIME_PRICE;
	}

	if ( ! suggestion.product_slug || suggestion.cost === 'Free' ) {
		return DOMAIN_PRICE_RULE.FREE_DOMAIN;
	}

	if ( suggestion?.is_premium ) {
		return DOMAIN_PRICE_RULE.PRICE;
	}

	if ( hasSomeSlug( suggestion ) && isDomainMoveInternal( suggestion ) ) {
		return DOMAIN_PRICE_RULE.DOMAIN_MOVE_PRICE;
	}

	if ( isMonthlyOrFreeFlow( flowName ) ) {
		return DOMAIN_PRICE_RULE.PRICE;
	}

	if ( isDomainForGravatarFlow( flowName ) ) {
		return suggestion.sale_cost === 0
			? DOMAIN_PRICE_RULE.FREE_FOR_FIRST_YEAR
			: DOMAIN_PRICE_RULE.PRICE;
	}

	if ( domainAndPlanUpsellFlow ) {
		return DOMAIN_PRICE_RULE.FREE_WITH_PLAN;
	}

	if ( isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) {
		return DOMAIN_PRICE_RULE.FREE_WITH_PLAN;
	}

	if ( hasSomeSlug( suggestion ) && isDomainMapping( suggestion ) ) {
		if ( isDomainMappingFree( selectedSite ) ) {
			return DOMAIN_PRICE_RULE.FREE_WITH_PLAN;
		}

		if ( withPlansOnly ) {
			return DOMAIN_PRICE_RULE.INCLUDED_IN_HIGHER_PLAN;
		}

		return DOMAIN_PRICE_RULE.PRICE;
	}

	if ( isNextDomainFree( cart, suggestion.domain_name ) ) {
		return DOMAIN_PRICE_RULE.FREE_WITH_PLAN;
	}

	if ( shouldBundleDomainWithPlan( withPlansOnly, selectedSite, cart, suggestion ) ) {
		return DOMAIN_PRICE_RULE.INCLUDED_IN_HIGHER_PLAN;
	}

	if ( hasToUpgradeToPayForADomain( selectedSite, cart, suggestion.domain_name ) ) {
		return DOMAIN_PRICE_RULE.UPGRADE_TO_HIGHER_PLAN_TO_BUY;
	}

	return DOMAIN_PRICE_RULE.PRICE;
}

export function getPlanCartItem( cartItems?: MinimalRequestCartProduct[] | null ) {
	/**
	 * A null planCartItem corresponds to a free plan. It seems like this is case throughout the signup/plans
	 * onboarding codebase. There are, however, tests in client/signup/steps/plans/test/index.jsx that
	 * represent a free plan as a non null product.
	 *
	 * Additionally, free plans are, in fact, represented as products with product slugs elsewhere in the
	 * codebase. This is why we check for both cases here. When we conduct a more thorough investigation and
	 * determine that PLAN_FREE is no longer, in fact, used to represent free plans in signup/onboarding, we
	 * can remove PLAN_FREE check. p4TIVU-aLF-p2
	 */
	return cartItems?.find( ( item ) => isPlan( item ) || item.product_slug === PLAN_FREE ) ?? null;
}
