/** @ssr-ready **/

/**
 * External dependencies
 */
var update = require( 'react-addons-update' ),
	every = require( 'lodash/every' ),
	assign = require( 'lodash/assign' ),
	flow = require( 'lodash/flow' ),
	isEqual = require( 'lodash/isEqual' ),
	merge = require( 'lodash/merge' ),
	reject = require( 'lodash/reject' ),
	tail = require( 'lodash/tail' ),
	some = require( 'lodash/some' ),
	uniq = require( 'lodash/uniq' ),
	flatten = require( 'lodash/flatten' ),
	filter = require( 'lodash/filter' );

/**
 * Internal dependencies
 */
var productsValues = require( 'lib/products-values' ),
	formatProduct = productsValues.formatProduct,
	isCustomDesign = productsValues.isCustomDesign,
	isDependentProduct = productsValues.isDependentProduct,
	isDomainProduct = productsValues.isDomainProduct,
	isDomainRedemption = productsValues.isDomainRedemption,
	isDomainRegistration = productsValues.isDomainRegistration,
	isGoogleApps = productsValues.isGoogleApps,
	isNoAds = productsValues.isNoAds,
	isPlan = productsValues.isPlan,
	isPremium = productsValues.isPremium,
	isPrivateRegistration = productsValues.isPrivateRegistration,
	isSiteRedirect = productsValues.isSiteRedirect,
	isSpaceUpgrade = productsValues.isSpaceUpgrade,
	isUnlimitedSpace = productsValues.isUnlimitedSpace,
	isUnlimitedThemes = productsValues.isUnlimitedThemes,
	isVideoPress = productsValues.isVideoPress,
	isJetpackPlan = productsValues.isJetpackPlan,
	sortProducts = require( 'lib/products-values/sort' ),
	PLAN_PERSONAL = require( 'lib/plans/constants' ).PLAN_PERSONAL;

/**
 * Adds the specified item to a shopping cart.
 *
 * @param {Object} newCartItem - new item as `CartItemValue` object
 * @returns {Function} the function that adds the item to a shopping cart
 */
function add( newCartItem ) {
	function appendItem( products ) {
		var isDuplicate;

		products = products || [];

		isDuplicate = products.some( function( existingCartItem ) {
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

/**
 * Determines if the given cart item should replace the cart.
 * This can happen if the given item:
 * - will result in mixed renewals/non-renewals or multiple renewals (excluding private registration).
 * - is a free trial plan
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @param {Object} cart - the existing shopping cart
 * @returns {Boolean} whether or not the item should replace the cart
 */
function cartItemShouldReplaceCart( cartItem, cart ) {
	if ( isRenewal( cartItem ) && ! isPrivateRegistration( cartItem ) && ! isDomainRedemption( cartItem ) ) {
		// adding a renewal replaces the cart unless it is a private registration
		return true;
	}

	if ( ! isRenewal( cartItem ) && hasRenewalItem( cart ) ) {
		// all items should replace the cart if the cart contains a renewal
		return true;
	}

	if ( productsValues.isFreeTrial( cartItem ) || hasFreeTrial( cart ) ) {
		// adding a free trial plan to your cart replaces the cart
		// adding another product to a cart containing a free trial removes the free trial
		return true;
	}

	if ( isJetpackPlan( cartItem ) ) {
		// adding a jetpack bundle should replace the cart
		return true;
	}

	return false;
}

/**
 * Removes the specified item from a shopping cart.
 *
 * @param {Object} cartItemToRemove - item as `CartItemValue` object
 * @returns {Function} the function that removes the item from a shopping cart
 */
function remove( cartItemToRemove ) {
	function rejectItem( products ) {
		return reject( products, function( existingCartItem ) {
			return (
				cartItemToRemove.product_slug === existingCartItem.product_slug &&
				cartItemToRemove.meta === existingCartItem.meta
			);
		} );
	}

	return function( cart ) {
		return update( cart, { products: { $apply: rejectItem } } );
	};
}

/**
 * Removes the specified item and its dependency items from a shopping cart.
 *
 * @param {Object} cartItemToRemove - item as `CartItemValue` object
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Function} the function that removes the items from a shopping cart
 */
function removeItemAndDependencies( cartItemToRemove, cart ) {
	var dependencies = getDependentProducts( cartItemToRemove, cart ),
		changes = dependencies.map( remove ).concat( remove( cartItemToRemove ) );

	return flow.apply( null, changes );
}

/**
 * Retrieves the dependency items from the shopping cart for the given cart item.
 *
 * @param {Object} cartItem - item as `CartItemValue` object
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of dependency items in the shopping cart
 */
function getDependentProducts( cartItem, cart ) {
	const dependentProducts = getAll( cart ).filter( function( existingCartItem ) {
		return isDependentProduct( cartItem, existingCartItem );
	} );

	return uniq( flatten( dependentProducts.concat( dependentProducts.map( dependentProduct => getDependentProducts( dependentProduct, cart ) ) ) ) );
}

/**
 * Retrieves all the items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of items in the shopping cart as `CartItemValue` objects
 */
function getAll( cart ) {
	return cart && cart.products || [];
}

/**
 * Retrieves all the items in the shopping cart sorted
 *
 * @param {Object} cart - cart as `CartValue` object
 *
 * @returns {Object[]} the sorted list of items in the shopping cart
 */
function getAllSorted( cart ) {
	return sortProducts( getAll( cart ) );
}

/**
 * Gets the renewal items from the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Array} an array of renewal items
 */
function getRenewalItems( cart ) {
	return getAll( cart ).filter( isRenewal );
}

/**
 * Determines whether there is at least one item with free trial in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one item with free trial, false otherwise
 */
function hasFreeTrial( cart ) {
	return some( getAll( cart ), 'free_trial' );
}

/**
 * Determines whether there is any kind of plan (e.g. Premium or Business) in the shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
function hasPlan( cart ) {
	return cart && some( getAll( cart ), isPlan );
}

function hasPremiumPlan( cart ) {
	return some( getAll( cart ), isPremium );
}

function hasDomainCredit( cart ) {
	return cart.has_bundle_credit || hasPlan( cart );
}

/**
 * Whether the cart has a registration with .nl TLD
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Boolean} - Whether or not the cart contains a .nl TLD
 */
function hasNlTld( cart ) {
	return some( getDomainRegistrations( cart ), function( cartItem ) {
		return getDomainRegistrationTld( cartItem ) === '.nl';
	} );
}

function getDomainRegistrationTld( cartItem ) {
	if ( ! isDomainRegistration( cartItem ) ) {
		throw new Error( 'This function only works on domain registration cart ' +
											'items.' );
	}

	return '.' + tail( cartItem.meta.split( '.' ) ).join( '.' );
}

/**
 * Determines whether all items in the specified shopping are free trial or free domains
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if all items have free trial, false otherwise
 * @todo This will fail when a domain is purchased with a plan, as the domain will be included in the free trial
 */
function hasOnlyFreeTrial( cart ) {
	return cart.products && findFreeTrial( cart ) && every( getAll( cart ), { cost: 0 } );
}

/**
 * Determines whether there is at least one item of a given product in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Object} productSlug - the unique string that identifies the product
 * @returns {boolean} true if there is at least one item of the specified product type, false otherwise
 */
function hasProduct( cart, productSlug ) {
	return getAll( cart ).some( function( cartItem ) {
		return cartItem.product_slug === productSlug;
	} );
}

/**
 * Determines whether every product in the specified shopping cart is of the same productSlug.
 * Will return false if the cart is empty.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Object} productSlug - the unique string that identifies the product
 * @returns {boolean} true if all the products in the cart are of the productSlug type
 */
function hasOnlyProductsOf( cart, productSlug ) {
	return cart.products && every( getAll( cart ), { product_slug: productSlug } );
}

/**
 * Determines whether there is at least one domain registration item in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one domain registration item, false otherwise
 */
function hasDomainRegistration( cart ) {
	return some( getAll( cart ), isDomainRegistration );
}

function hasDomainMapping( cart ) {
	return some( getAll( cart ), productsValues.isDomainMapping );
}

/**
 * Determines whether there is at least one renewal item in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one renewal item, false otherwise
 */
function hasRenewalItem( cart ) {
	return some( getAll( cart ), isRenewal );
}

/**
 * Determines whether all items are renewal items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there are only renewal items, false otherwise
 */
function hasOnlyRenewalItems( cart ) {
	return every( getAll( cart ), isRenewal );
}

/**
 * Determines whether any product in the specified shopping cart is a renewable subscription.
 * Will return false if the cart is empty.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if any product in the cart renews
 */
function hasRenewableSubscription( cart ) {
	return cart.products && some( getAll( cart ), cartItem => cartItem.bill_period > 0 );
}

/**
 * Creates a new shopping cart item for a plan.
 *
 * @param {Object} productSlug - the unique string that identifies the product
 * @param {boolean} isFreeTrial - optionally specifies if this is a free trial or not
 * @returns {Object} the new item as `CartItemValue` object
 */
function planItem( productSlug, isFreeTrial = false ) {
	return {
		product_slug: productSlug,
		free_trial: isFreeTrial
	};
}

/**
 * Creates a new shopping cart item for a Personal plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function personalPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a Premium plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function premiumPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a Business plan.
 *
 * @param {string} slug - e.g. business-bundle, jetpack_business
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function businessPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a domain.
 *
 * @param {Object} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @returns {Object} the new item as `CartItemValue` object
 */
function domainItem( productSlug, domain ) {
	return {
		product_slug: productSlug,
		meta: domain
	};
}

function themeItem( themeSlug, source ) {
	return {
		product_slug: 'premium_theme',
		meta: themeSlug,
		extra: {
			source: source
		}
	};
}

/**
 * Creates a new shopping cart item for a domain registration.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function domainRegistration( properties ) {
	return assign( domainItem( properties.productSlug, properties.domain ), { is_domain_registration: true } );
}

/**
 * Creates a new shopping cart item for a domain mapping.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function domainMapping( properties ) {
	return domainItem( 'domain_map', properties.domain );
}

/**
 * Creates a new shopping cart item for Site Redirect.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function siteRedirect( properties ) {
	return domainItem( 'offsite_redirect', properties.domain );
}

/**
 * Creates a new shopping cart item for a domain privacy protection.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function domainPrivacyProtection( properties ) {
	return domainItem( 'private_whois', properties.domain );
}

/**
 * Creates a new shopping cart item for a domain redemption late fee.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function domainRedemption( properties ) {
	return domainItem( 'domain_redemption', properties.domain );
}

function googleApps( properties ) {
	var item = domainItem( 'gapps', properties.meta ? properties.meta : properties.domain );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

function googleAppsExtraLicenses( properties ) {
	var item = domainItem( 'gapps_extra_license', properties.domain );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

function customDesignItem() {
	return {
		product_slug: 'custom-design'
	};
}

function noAdsItem() {
	return {
		product_slug: 'no-adverts/no-adverts.php'
	};
}

function videoPressItem() {
	return {
		product_slug: 'videopress'
	};
}

function unlimitedSpaceItem() {
	return {
		product_slug: 'unlimited_space'
	};
}

function unlimitedThemesItem() {
	return {
		product_slug: 'unlimited_themes'
	};
}

function spaceUpgradeItem( slug ) {
	return {
		product_slug: slug
	};
}

/**
 * Creates a new shopping cart item for the specified plan.
 *
 * @param {Object} plan - plan provided by the `PlansList` object
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
function getItemForPlan( plan, properties ) {
	properties = properties || {};

	switch ( plan.product_slug ) {
		case PLAN_PERSONAL:
			return personalPlan( plan.product_slug, properties );
		case 'value_bundle':
		case 'jetpack_premium':
		case 'jetpack_premium_monthly':
			return premiumPlan( plan.product_slug, properties );

		case 'business-bundle':
		case 'jetpack_business':
		case 'jetpack_business_monthly':
			return businessPlan( plan.product_slug, properties );

		default:
			throw new Error( 'Invalid plan product slug: ' + plan.product_slug );
	}
}

/**
 * Retrieves the first item with free trial in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object} the corresponding item in the shopping cart as `CartItemValue` object
 */
function findFreeTrial( cart ) {
	return filter( getAll( cart ), { free_trial: true } )[ 0 ];
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getDomainRegistrations( cart ) {
	return filter( getAll( cart ), { is_domain_registration: true } );
}

/**
 * Retrieves all the domain mapping items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getDomainMappings( cart ) {
	return filter( getAll( cart ), { product_slug: 'domain_map' } );
}

/**
 * Retrieves all the Google Apps items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getGoogleApps( cart ) {
	return getAll( cart ).filter( function( cartItem ) {
		return ( cartItem.product_slug === 'gapps' ) || ( cartItem.product_slug === 'gapps_extra_license' );
	} );
}

/**
 * Returns a renewal CartItem object with the given properties and product slug.
 *
 * @param {String} product - the product object
 * @param {Object} [properties] - properties to be included in the new CartItem object
 * @returns {Object} a CartItem object
 */
function getRenewalItemFromProduct( product, properties ) {
	product = formatProduct( product );

	let cartItem;

	if ( isDomainProduct( product ) ) {
		cartItem = domainItem( product.product_slug, properties.domain );
	}

	if ( isPlan( product ) ) {
		cartItem = planItem( product.product_slug, false );
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
 * @param {Object} cartItem - item as `CartItemValue` object
 * @param {Object} properties - properties to be included in the new CartItem object
 * @returns {Object} a CartItem object
 */
function getRenewalItemFromCartItem( cartItem, properties ) {
	return merge( {}, cartItem, { extra: {
		purchaseId: properties.id,
		purchaseDomain: properties.domain,
		purchaseType: 'renewal',
		includedDomain: properties.includedDomain
	} } );
}

/**
 * Retrieves all the site redirect items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getSiteRedirects( cart ) {
	return filter( getAll( cart ), { product_slug: 'offsite_redirect' } );
}

function hasDomainInCart( cart, domain ) {
	return some( getAll( cart ), { is_domain_registration: true, meta: domain } );
}

/**
 * Retrieves the domain registration items in the specified shopping cart that do not have corresponding
 * private whois items.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getDomainRegistrationsWithoutPrivacy( cart ) {
	return getDomainRegistrations( cart ).filter( function( cartItem ) {
		return ! some( cart.products, {
			meta: cartItem.meta,
			product_slug: 'private_whois'
		} );
	} );
}

/**
 * Changes presence of a private registration for the given domain cart items.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Object[]} domainItems - the list of `CartItemValue` objects for domain registrations
 * @param {Function} changeFunction - the function that adds/removes the private registration to a shopping cart
 * @returns {Function} the function that adds/removes private registrations from the shopping cart
 */
function changePrivacyForDomains( cart, domainItems, changeFunction ) {
	return flow.apply( null, domainItems.map( function( item ) {
		return changeFunction( domainPrivacyProtection( { domain: item.meta } ) );
	} ) );
}

function addPrivacyToAllDomains( cart ) {
	return changePrivacyForDomains( cart, getDomainRegistrationsWithoutPrivacy( cart ), add );
}

function removePrivacyFromAllDomains( cart ) {
	return changePrivacyForDomains( cart, getDomainRegistrations( cart ), remove );
}

/**
 * Determines whether a cart item is a renewal
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @returns {boolean} true if item is a renewal
 */
function isRenewal( cartItem ) {
	return cartItem.extra && cartItem.extra.purchaseType === 'renewal';
}

/**
 * Get the included domain for a cart item
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @returns {string} the included domain
 */
function getIncludedDomain( cartItem ) {
	return cartItem.extra && cartItem.extra.includedDomain;
}

function isNextDomainFree( cart ) {
	return !! ( cart && cart.next_domain_is_free );
}

function isDomainBeingUsedForPlan( cart, domain ) {
	if ( cart && domain && hasPlan( cart ) ) {
		const domainProducts = getDomainRegistrations( cart ).concat( getDomainMappings( cart ) ),
			domainProduct = ( domainProducts.shift() || {} );
		return domain === domainProduct.meta;
	}

	return false;
}

function shouldBundleDomainWithPlan( withPlansOnly, selectedSite, cart, suggestion ) {
	return withPlansOnly &&
		( suggestion.product_slug && suggestion.cost ) && // not free
		( ! isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) && // a plan in cart
		( ! isNextDomainFree( cart ) ) && // domain credit
		( ! hasPlan( cart ) ) && // already a plan in cart
		( ! selectedSite || ( selectedSite && selectedSite.plan.product_slug === 'free_plan' ) ); // site has a plan
}

function bundleItemWithPlan( cartItem, plan_slug = 'value_bundle' ) {
	const items = [ cartItem, planItem( plan_slug, false ) ];
	return items.map( item => {
		const extra = assign( {}, item.extra, { withPlansOnly: 'yes' } );
		return assign( {}, item, { extra } );
	} );
}

function getDomainPriceRule( withPlansOnly, selectedSite, cart, suggestion ) {
	if ( ! suggestion.product_slug || suggestion.cost === 'Free' ) {
		return 'FREE_DOMAIN';
	}

	if ( isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) {
		return 'FREE_WITH_PLAN';
	}

	if ( isNextDomainFree( cart ) ) {
		return 'FREE_WITH_PLAN';
	}

	if ( shouldBundleDomainWithPlan( withPlansOnly, selectedSite, cart, suggestion ) ) {
		return 'INCLUDED_IN_PREMIUM';
	}

	return 'PRICE';
}

module.exports = {
	add,
	addPrivacyToAllDomains,
	bundleItemWithPlan,
	businessPlan,
	customDesignItem,
	domainMapping,
	domainPrivacyProtection,
	domainRedemption,
	domainRegistration,
	findFreeTrial,
	getAll,
	getAllSorted,
	getDomainMappings,
	getDomainPriceRule,
	getDomainRegistrations,
	getDomainRegistrationsWithoutPrivacy,
	getDomainRegistrationTld,
	getGoogleApps,
	getIncludedDomain,
	getItemForPlan,
	getRenewalItemFromCartItem,
	getRenewalItemFromProduct,
	getRenewalItems,
	getSiteRedirects,
	googleApps,
	googleAppsExtraLicenses,
	isNextDomainFree,
	isDomainBeingUsedForPlan,
	hasDomainCredit,
	hasDomainInCart,
	hasDomainMapping,
	hasDomainRegistration,
	hasFreeTrial,
	hasNlTld,
	hasOnlyFreeTrial,
	hasOnlyProductsOf,
	hasOnlyRenewalItems,
	hasPlan,
	hasPremiumPlan,
	hasProduct,
	hasRenewableSubscription,
	hasRenewalItem,
	noAdsItem,
	planItem,
	premiumPlan,
	remove,
	removeItemAndDependencies,
	removePrivacyFromAllDomains,
	siteRedirect,
	shouldBundleDomainWithPlan,
	spaceUpgradeItem,
	themeItem,
	unlimitedSpaceItem,
	unlimitedThemesItem,
	videoPressItem
};
