/**
 * External dependencies
 */
import update from 'immutability-helper';
import {
	assign,
	concat,
	every,
	filter,
	find,
	flatten,
	flow,
	get,
	isEqual,
	map,
	merge,
	reject,
	some,
	toLower,
	uniq,
} from 'lodash';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import { GSUITE_BASIC_SLUG, GSUITE_EXTRA_LICENSE_SLUG } from 'lib/gsuite/constants';
import {
	formatProduct,
	getDomain,
	isCustomDesign,
	isDependentProduct,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDomainTransfer,
	isBundled,
	isEcommerce,
	isFreeTrial,
	isFreeWordPressComDomain,
	isGoogleApps,
	isJetpackPlan,
	isJetpackProduct,
	isNoAds,
	isPlan,
	isBlogger,
	isPersonal,
	isPremium,
	isSiteRedirect,
	isSpaceUpgrade,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isVideoPress,
	isConciergeSession,
} from 'lib/products-values';
import sortProducts from 'lib/products-values/sort';
import { getTld } from 'lib/domains';
import { domainProductSlugs } from 'lib/domains/constants';
import {
	getPlan,
	isBloggerPlan,
	isBusinessPlan,
	isPersonalPlan,
	isPremiumPlan,
	isWpComFreePlan,
	isWpComBloggerPlan,
} from 'lib/plans';
import { getTermDuration } from 'lib/plans/constants';

/**
 * Adds the specified item to a shopping cart.
 *
 * @param {object} newCartItem - new item as `CartItemValue` object
 * @returns {Function} the function that adds the item to a shopping cart
 */
export function addCartItem( newCartItem ) {
	function appendItem( products ) {
		products = products || [];

		const isDuplicate = products.some( function( existingCartItem ) {
			return isEqual( newCartItem, existingCartItem );
		} );

		return isDuplicate ? products : products.concat( [ newCartItem ] );
	}

	return function( cart ) {
		if ( cartItemShouldReplaceCart( newCartItem, cart ) ) {
			return update( cart, { products: { $set: [ newCartItem ] } } );
		}

		return update( cart, { products: { $apply: appendItem } } );
	};
}

export function clearCart() {
	return function( cart ) {
		return update( cart, { products: { $set: [] } } );
	};
}

/**
 * Adds the specified item to a shopping cart without replacing the cart
 *
 * @param {object} newCartItem - new item as `CartItemValue` object
 * @returns {Function} the function that adds the item to a shopping cart
 */
export function addCartItemWithoutReplace( newCartItem ) {
	function appendItem( products ) {
		products = products || [];

		const isDuplicate = products.some( function( existingCartItem ) {
			return isEqual( newCartItem, existingCartItem );
		} );

		return isDuplicate ? products : products.concat( [ newCartItem ] );
	}

	return function( cart ) {
		return update( cart, { products: { $apply: appendItem } } );
	};
}

/**
 * Determines if the given cart item should replace the cart.
 * This can happen if the given item:
 * - will result in mixed renewals/non-renewals or multiple renewals (excluding privacy protection).
 * - is a free trial plan
 *
 * @param {object} cartItem - `CartItemValue` object
 * @param {object} cart - the existing shopping cart
 * @returns {boolean} whether or not the item should replace the cart
 */
export function cartItemShouldReplaceCart( cartItem, cart ) {
	if ( isRenewal( cartItem ) && ! isDomainRedemption( cartItem ) ) {
		// adding a renewal replaces the cart unless it is a privacy protection
		return true;
	}

	if ( ! isRenewal( cartItem ) && hasRenewalItem( cart ) ) {
		// all items should replace the cart if the cart contains a renewal
		return true;
	}

	if ( isFreeTrial( cartItem ) || hasFreeTrial( cart ) ) {
		// adding a free trial plan to your cart replaces the cart
		// adding another product to a cart containing a free trial removes the free trial
		return true;
	}

	if ( isJetpackPlan( cartItem ) ) {
		// adding a jetpack bundle should replace the cart
		return true;
	}

	if ( isJetpackProduct( cartItem ) ) {
		// adding a Jetpack product should replace the cart
		return true;
	}

	return false;
}

/**
 * Removes the specified item from a shopping cart.
 *
 * @param {object} cartItemToRemove - item as `CartItemValue` object
 * @returns {Function} the function that removes the item from a shopping cart
 */
export function remove( cartItemToRemove ) {
	function rejectItem( products ) {
		const productsLeft = reject( products, function( existingCartItem ) {
			return (
				cartItemToRemove.product_slug === existingCartItem.product_slug &&
				cartItemToRemove.meta === existingCartItem.meta
			);
		} );

		const isRemovingDomainProduct =
			isDomainMapping( cartItemToRemove ) || isDomainRegistration( cartItemToRemove );
		return productsLeft.map( existingCartItem => {
			if (
				isPlan( existingCartItem ) &&
				isRemovingDomainProduct &&
				getDomain( cartItemToRemove ) === getDomain( existingCartItem )
			) {
				return update( existingCartItem, { extra: { $merge: { domain_to_bundle: '' } } } );
			}

			return existingCartItem;
		} );
	}

	return function( cart ) {
		return update( cart, { products: { $apply: rejectItem } } );
	};
}

/**
 * Removes the specified item and its dependency items from a shopping cart.
 *
 * @param {object} cartItemToRemove - item as `CartItemValue` object
 * @param {object} cart - cart as `CartValue` object
 * @param {boolean} domainsWithPlansOnly - Whether we should consider domains as dependents of products
 * @returns {Function} the function that removes the items from a shopping cart
 */
export function removeItemAndDependencies( cartItemToRemove, cart, domainsWithPlansOnly ) {
	const dependencies = getDependentProducts( cartItemToRemove, cart, domainsWithPlansOnly );
	const changes = dependencies.map( remove ).concat( remove( cartItemToRemove ) );

	return flow.apply( null, changes );
}

/**
 * Removes the specified item and its dependency items from a shopping cart.
 *
 * @param {object} oldItem - item as `CartItemValue` object
 * @param {object} newItem - item as `CartItemValue` object
 * @returns {Function} the function that removes the items from a shopping cart
 */
export function replaceItem( oldItem, newItem ) {
	return function( cart ) {
		return flow( [ remove( oldItem ), addCartItem( newItem ) ] )( cart );
	};
}

/**
 * Retrieves the dependency items from the shopping cart for the given cart item.
 *
 * @param {object} cartItem - item as `CartItemValue` object
 * @param {object} cart - cart as `CartValue` object
 * @param {boolean} domainsWithPlansOnly - Whether we should consider domains as dependents of products
 * @returns {object[]} the list of dependency items in the shopping cart
 */
export function getDependentProducts( cartItem, cart, domainsWithPlansOnly ) {
	const dependentProducts = getAllCartItems( cart ).filter( function( existingCartItem ) {
		return isDependentProduct( cartItem, existingCartItem, domainsWithPlansOnly );
	} );

	return uniq(
		flatten(
			dependentProducts.concat(
				dependentProducts.map( dependentProduct => getDependentProducts( dependentProduct, cart ) )
			)
		)
	);
}

/**
 * Retrieves all the items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of items in the shopping cart as `CartItemValue` objects
 */
export function getAllCartItems( cart ) {
	return ( cart && cart.products ) || [];
}

/**
 * Retrieves all the items in the shopping cart sorted
 *
 * @param {object} cart - cart as `CartValue` object
 *
 * @returns {object[]} the sorted list of items in the shopping cart
 */
export function getAllCartItemsSorted( cart ) {
	return sortProducts( getAllCartItems( cart ) );
}

/**
 * Gets the renewal items from the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {Array} an array of renewal items
 */
export function getRenewalItems( cart ) {
	return getAllCartItems( cart ).filter( isRenewal );
}

/**
 * Determines whether there is at least one item with free trial in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one item with free trial, false otherwise
 */
export function hasFreeTrial( cart ) {
	return some( getAllCartItems( cart ), 'free_trial' );
}

/**
 * Determines whether there is any kind of plan (e.g. Premium or Business) in the shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
export function hasPlan( cart ) {
	return cart && some( getAllCartItems( cart ), isPlan );
}

/**
 * Determines whether there is a Jetpack plan in the shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one Jetpack plan, false otherwise
 */
export function hasJetpackPlan( cart ) {
	return some( getAllCartItems( cart ), isJetpackPlan );
}

/**
 * Determines whether there is an ecommerce plan in the shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
export function hasEcommercePlan( cart ) {
	return cart && some( getAllCartItems( cart ), isEcommerce );
}

/**
 * Does the cart contain only bundled domains and transfers
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there are only bundled domains and transfers
 */
export function hasOnlyBundledDomainProducts( cart ) {
	return (
		cart && every( [ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ], isBundled )
	);
}

export function hasBloggerPlan( cart ) {
	return some( getAllCartItems( cart ), isBlogger );
}

export function hasPersonalPlan( cart ) {
	return some( getAllCartItems( cart ), isPersonal );
}

export function hasPremiumPlan( cart ) {
	return some( getAllCartItems( cart ), isPremium );
}

export function hasDomainCredit( cart ) {
	return cart.has_bundle_credit || hasPlan( cart );
}

/**
 * Whether the cart has a registration with a specific TLD
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {string} tld - TLD to look for, no leading dot
 *
 * @returns {boolean} - Whether or not the cart contains a domain with that TLD
 */
export function hasTld( cart, tld ) {
	const domains = concat( getDomainRegistrations( cart ), getDomainTransfers( cart ) );

	return some( domains, cartItem => getTld( cartItem.meta ) === tld );
}

export function getTlds( cart ) {
	const domains = concat( getDomainRegistrations( cart ), getDomainTransfers( cart ) );

	return uniq( map( domains, cartItem => getTld( cartItem.meta ) ) );
}

/**
 * Determines whether all items in the specified shopping are free trial or free domains
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if all items have free trial, false otherwise
 * @todo This will fail when a domain is purchased with a plan, as the domain will be included in the free trial
 */
export function hasOnlyFreeTrial( cart ) {
	return cart.products && findFreeTrial( cart ) && every( getAllCartItems( cart ), { cost: 0 } );
}

/**
 * Determines whether there is at least one item of a given product in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {object} productSlug - the unique string that identifies the product
 * @returns {boolean} true if there is at least one item of the specified product type, false otherwise
 */
export function hasProduct( cart, productSlug ) {
	return getAllCartItems( cart ).some( function( cartItem ) {
		return cartItem.product_slug === productSlug;
	} );
}

/**
 * Determines whether every product in the specified shopping cart is of the same productSlug.
 * Will return false if the cart is empty.
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {object} productSlug - the unique string that identifies the product
 * @returns {boolean} true if all the products in the cart are of the productSlug type
 */
export function hasOnlyProductsOf( cart, productSlug ) {
	return cart.products && every( getAllCartItems( cart ), { product_slug: productSlug } );
}

/**
 * Determines whether there is at least one domain registration item in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one domain registration item, false otherwise
 */
export function hasDomainRegistration( cart ) {
	return some( getAllCartItems( cart ), isDomainRegistration );
}

export function hasAllDomainProductsWithPrivacySupport( cart ) {
	return every(
		concat( getDomainTransfers( cart ), getDomainRegistrations( cart ) ),
		privacyAvailable
	);
}

export function hasSomeDomainProductsWithPrivacySupport( cart ) {
	return some(
		concat( getDomainTransfers( cart ), getDomainRegistrations( cart ) ),
		privacyAvailable
	);
}

export function hasDomainMapping( cart ) {
	return some( getAllCartItems( cart ), isDomainMapping );
}

export function hasDomainBeingUsedForPlan( cart ) {
	return some( getDomainRegistrations( cart ), registration =>
		isDomainBeingUsedForPlan( cart, registration.meta )
	);
}

/**
 * Determines whether there is at least one renewal item in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one renewal item, false otherwise
 */
export function hasRenewalItem( cart ) {
	return some( getAllCartItems( cart ), isRenewal );
}

/**
 * Determines whether there is at least one domain transfer item in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one domain transfer item, false otherwise
 */
export function hasTransferProduct( cart ) {
	return some( getAllCartItems( cart ), isDomainTransfer );
}

/**
 * Retrieves all the domain transfer items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainTransfers( cart ) {
	return filter( getAllCartItems( cart ), { product_slug: domainProductSlugs.TRANSFER_IN } );
}

/**
 * Determines whether all items are renewal items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there are only renewal items, false otherwise
 */
export function hasOnlyRenewalItems( cart ) {
	return every( getAllCartItems( cart ), isRenewal );
}

/**
 * Determines whether there is at least one concierge session item in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one concierge session item, false otherwise
 */
export function hasConciergeSession( cart ) {
	return some( getAllCartItems( cart ), isConciergeSession );
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
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if any product in the cart renews
 */
export function hasRenewableSubscription( cart ) {
	return (
		cart.products &&
		some( getAllCartItems( cart ), cartItem => getCartItemBillPeriod( cartItem ) > 0 )
	);
}

/**
 * Creates a new shopping cart item for a plan.
 *
 * @param {object} productSlug - the unique string that identifies the product
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function planItem( productSlug, properties ) {
	// Free plan doesn't have shopping cart.
	if ( isWpComFreePlan( productSlug ) ) {
		return null;
	}

	const domainToBundle = get( properties, 'domainToBundle', '' );

	return {
		product_slug: productSlug,
		free_trial: get( properties, 'isFreeTrialItem', false ),
		...( domainToBundle ? { extra: { domain_to_bundle: domainToBundle } } : {} ),
	};
}

/**
 * Creates a new shopping cart item for a Personal plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function personalPlan( slug, properties ) {
	return planItem( slug, properties );
}

/**
 * Creates a new shopping cart item for a Premium plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function premiumPlan( slug, properties ) {
	return planItem( slug, properties );
}

/**
 * Creates a new shopping cart item for a Business plan.
 *
 * @param {string} slug - e.g. business-bundle, jetpack_business
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function businessPlan( slug, properties ) {
	return planItem( slug, properties );
}

/**
 * Determines whether a domain Item supports purchasing a privacy subscription
 *
 * @param {string} productSlug - e.g. domain_reg, dotblog_domain
 * @param {Array} productsList - The list of products retrieved using getProductsList from state/products-list/selectors
 * @returns {boolean} true if the domainItem supports privacy protection purchase
 */
export function supportsPrivacyProtectionPurchase( productSlug, productsList ) {
	const product = find( productsList, [ 'product_slug', productSlug ] ) || {};
	return get( product, 'is_privacy_protection_product_purchase_allowed', false );
}

/**
 * Creates a new shopping cart item for a domain.
 *
 * @param {object} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @param {string} source - optional source for the domain item, e.g. `getdotblog`.
 * @returns {object} the new item as `CartItemValue` object
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
 * @returns {object} the new item as `CartItemValue` object
 */
export function domainRegistration( properties ) {
	return assign( domainItem( properties.productSlug, properties.domain, properties.source ), {
		is_domain_registration: true,
		...( properties.extra ? { extra: properties.extra } : {} ),
	} );
}

/**
 * Creates a new shopping cart item for a domain mapping.
 *
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function domainMapping( properties ) {
	return domainItem( 'domain_map', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for Site Redirect.
 *
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function siteRedirect( properties ) {
	return domainItem( 'offsite_redirect', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for an incoming domain transfer.
 *
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function domainTransfer( properties ) {
	return assign(
		domainItem( domainProductSlugs.TRANSFER_IN, properties.domain, properties.source ),
		{
			...( properties.extra ? { extra: properties.extra } : {} ),
		}
	);
}

/**
 * Retrieves all the G Suite items in the specified shopping cart.
 * Out-dated name Google Apps is still used here for consistency in naming.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getGoogleApps( cart ) {
	return filter( getAllCartItems( cart ), isGoogleApps );
}

export function googleApps( properties ) {
	const productSlug = properties.product_slug || GSUITE_BASIC_SLUG,
		item = domainItem( productSlug, properties.meta ? properties.meta : properties.domain );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

export function googleAppsExtraLicenses( properties ) {
	const item = domainItem( GSUITE_EXTRA_LICENSE_SLUG, properties.domain, properties.source );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

export function fillGoogleAppsRegistrationData( cart, registrationData ) {
	const googleAppsItems = filter( getAllCartItems( cart ), isGoogleApps );
	return flow.apply(
		null,
		googleAppsItems.map( function( item ) {
			item.extra = assign( item.extra, { google_apps_registration_data: registrationData } );
			return addCartItem( item );
		} )
	);
}

/**
 * Returns the domain part of an email address.
 *
 * @param {string} emailAddress - a valid email address
 * @returns {string} the domain
 */
const getDomainPartFromEmail = emailAddress =>
	// Domain is any string after `@` character
	'string' === typeof emailAddress || 0 < emailAddress.indexOf( '@' )
		? emailAddress.replace( /.*@([^@>]+)>?$/, '$1' )
		: null;

/**
 * Returns a predicate that determines if a domain matches a product meta.
 *
 * @param {string} domain domain to compare.
 * @returns {Function(*=): (boolean)} true if the domain matches.
 */
const isSameDomainAsProductMeta = domain => product =>
	product &&
	product.meta &&
	'string' === typeof domain &&
	'string' === typeof product.meta &&
	product.meta.trim().toUpperCase() === domain.trim().toUpperCase();

export function needsExplicitAlternateEmailForGSuite( cart, contactDetails ) {
	return (
		! emailValidator.validate( contactDetails.email ) ||
		some(
			cart.products,
			isSameDomainAsProductMeta( getDomainPartFromEmail( contactDetails.email ) )
		)
	);
}

export function hasInvalidAlternateEmailDomain( cart, contactDetails ) {
	return some(
		cart.products,
		isSameDomainAsProductMeta( getDomainPartFromEmail( contactDetails.alternateEmail ) )
	);
}

export function hasGoogleApps( cart ) {
	return some( getAllCartItems( cart ), isGoogleApps );
}

export function customDesignItem() {
	return {
		product_slug: 'custom-design',
	};
}

export function guidedTransferItem() {
	return {
		product_slug: 'guided_transfer',
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

export function conciergeSessionItem() {
	return {
		product_slug: 'concierge-session',
	};
}

export function jetpackProductItem( slug ) {
	return {
		product_slug: slug,
	};
}

/**
 * Creates a new shopping cart item for the specified plan.
 *
 * @param {object} plan - plan provided by the `PlansList` object
 * @param {object} properties - list of properties
 * @returns {object} the new item as `CartItemValue` object
 */
export function getItemForPlan( plan, properties ) {
	properties = properties || {};

	if ( isPersonalPlan( plan.product_slug ) ) {
		return personalPlan( plan.product_slug, properties );
	}

	if ( isPremiumPlan( plan.product_slug ) ) {
		return premiumPlan( plan.product_slug, properties );
	}

	if ( isBusinessPlan( plan.product_slug ) ) {
		return businessPlan( plan.product_slug, properties );
	}

	throw new Error( 'Invalid plan product slug: ' + plan.product_slug );
}

/**
 * Retrieves the first item with free trial in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object} the corresponding item in the shopping cart as `CartItemValue` object
 */
export function findFreeTrial( cart ) {
	return find( getAllCartItems( cart ), { free_trial: true } );
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainRegistrations( cart ) {
	return filter( getAllCartItems( cart ), { is_domain_registration: true } );
}

/**
 * Retrieves all the domain mapping items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainMappings( cart ) {
	return filter( getAllCartItems( cart ), { product_slug: 'domain_map' } );
}

/**
 * Returns a renewal CartItem object with the given properties and product slug.
 *
 * @param {string} product - the product object
 * @param {object} [properties] - properties to be included in the new CartItem object
 * @returns {object} a CartItem object
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

	if ( isGoogleApps( product ) ) {
		cartItem = googleApps( product );
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
 * @param {object} cartItem - item as `CartItemValue` object
 * @param {object} properties - properties to be included in the new CartItem object
 * @returns {object} a CartItem object
 */
export function getRenewalItemFromCartItem( cartItem, properties ) {
	return merge( {}, cartItem, {
		extra: {
			purchaseId: properties.id,
			purchaseDomain: properties.domain,
			purchaseType: 'renewal',
			includedDomain: properties.includedDomain,
		},
	} );
}

/**
 * Retrieves all the site redirect items in the specified shopping cart.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getSiteRedirects( cart ) {
	return filter( getAllCartItems( cart ), { product_slug: 'offsite_redirect' } );
}

export function hasDomainInCart( cart, domain ) {
	return some( getAllCartItems( cart ), { is_domain_registration: true, meta: domain } );
}

/**
 * Retrieves the domain registration items in the specified shopping cart that do not have corresponding
 * private whois items.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainRegistrationsWithoutPrivacy( cart ) {
	return getDomainRegistrations( cart ).filter( function( cartItem ) {
		return ! some( cart.products, {
			meta: cartItem.meta,
			extra: { privacy: true },
		} );
	} );
}

/**
 * Retrieves the domain incoming transfer items in the specified shopping cart that do not have corresponding
 * private incoming transfer item.
 *
 * @param {object} cart - cart as `CartValue` object
 * @returns {object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainTransfersWithoutPrivacy( cart ) {
	return getDomainTransfers( cart ).filter( function( cartItem ) {
		return ! some( cart.products, {
			meta: cartItem.meta,
			extra: { privacy: true },
		} );
	} );
}

/**
 * Changes presence of a privacy protection for the given domain cart items.
 *
 * @param {object} cart - cart as `CartValue` object
 * @param {object[]} domainItems - the list of `CartItemValue` objects for domain registrations
 * @param {Function} changeFunction - the function that adds/removes the privacy protection to a shopping cart
 * @param {boolean} value - whether privacy is on or off
 *
 * @returns {Function} the function that adds/removes privacy protections from the shopping cart
 */
export function changePrivacyForDomains( cart, domainItems, changeFunction, value ) {
	return flow.apply(
		null,
		domainItems.map( function( item ) {
			return changeFunction( item, updatePrivacyForDomain( item, value ) );
		} )
	);
}

/**
 * Changes presence of a privacy protection for the given domain cart item.
 *
 * @param {object} item - the `CartItemValue` object for domain registrations
 * @param {boolean} value - whether privacy is on or off
 *
 * @returns {object} the new `CartItemValue` with added/removed privacy
 */
export function updatePrivacyForDomain( item, value ) {
	return merge( {}, item, {
		extra: {
			privacy: value,
		},
	} );
}

export function addPrivacyToAllDomains( cart ) {
	return changePrivacyForDomains(
		cart,
		[
			...getDomainRegistrationsWithoutPrivacy( cart ),
			...getDomainTransfersWithoutPrivacy( cart ),
		],
		replaceItem,
		true
	);
}

export function removePrivacyFromAllDomains( cart ) {
	return changePrivacyForDomains(
		cart,
		[ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ],
		replaceItem,
		false
	);
}

/**
 * Determines whether a cart item is a renewal
 *
 * @param {object} cartItem - `CartItemValue` object
 * @returns {boolean} true if item is a renewal
 */
export function isRenewal( cartItem ) {
	return cartItem.extra && cartItem.extra.purchaseType === 'renewal';
}

/**
 * Determines whether a cart item supports privacy
 *
 * @param {object} cartItem - `CartItemValue` object
 * @returns {boolean} true if item supports privacy
 */
export function privacyAvailable( cartItem ) {
	return get( cartItem, 'extra.privacy_available', true );
}

/**
 * Get the included domain for a cart item
 *
 * @param {object} cartItem - `CartItemValue` object
 * @returns {string} the included domain
 */
export function getIncludedDomain( cartItem ) {
	return cartItem.extra && cartItem.extra.includedDomain;
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
	const bundledDomain = get( cart, 'bundled_domain', '' );

	return '' !== bundledDomain && toLower( domain ) === toLower( get( cart, 'bundled_domain', '' ) );
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

	const domainProducts = getDomainRegistrations( cart ).concat( getDomainMappings( cart ) ),
		domainProduct = domainProducts.shift() || {};
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

export function getDomainPriceRule( withPlansOnly, selectedSite, cart, suggestion, isDomainOnly ) {
	if ( ! suggestion.product_slug || suggestion.cost === 'Free' ) {
		return 'FREE_DOMAIN';
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
 * @param {object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one cart item added more than X time ago, false otherwise
 */
export function hasStaleItem( cart ) {
	return some( getAllCartItems( cart ), function( cartItem ) {
		// time_added_to_cart is in seconds, Date.now() returns milliseconds
		return (
			cartItem.time_added_to_cart &&
			cartItem.time_added_to_cart * 1000 < Date.now() - 10 * 60 * 1000
		);
	} );
}
