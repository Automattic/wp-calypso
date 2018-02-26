/** @format */

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
	uniq,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	formatProduct,
	isCustomDesign,
	isDependentProduct,
	isDomainMapping,
	isDomainProduct,
	isDomainRedemption,
	isDomainRegistration,
	isDomainTransfer,
	isBundled,
	isFreeTrial,
	isFreeWordPressComDomain,
	isGoogleApps,
	isJetpackPlan,
	isNoAds,
	isPlan,
	isPremium,
	isPrivacyProtection,
	isSiteRedirect,
	isSpaceUpgrade,
	isUnlimitedSpace,
	isUnlimitedThemes,
	isVideoPress,
} from 'lib/products-values';
import sortProducts from 'lib/products-values/sort';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { getTld } from 'lib/domains';
import { domainProductSlugs } from 'lib/domains/constants';

import {
	PLAN_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';

/**
 * Adds the specified item to a shopping cart.
 *
 * @param {Object} newCartItem - new item as `CartItemValue` object
 * @returns {Function} the function that adds the item to a shopping cart
 */
export function add( newCartItem ) {
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

/**
 * Determines if the given cart item should replace the cart.
 * This can happen if the given item:
 * - will result in mixed renewals/non-renewals or multiple renewals (excluding privacy protection).
 * - is a free trial plan
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @param {Object} cart - the existing shopping cart
 * @returns {Boolean} whether or not the item should replace the cart
 */
export function cartItemShouldReplaceCart( cartItem, cart ) {
	if (
		isRenewal( cartItem ) &&
		! isPrivacyProtection( cartItem ) &&
		! isDomainRedemption( cartItem )
	) {
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

	return false;
}

/**
 * Removes the specified item from a shopping cart.
 *
 * @param {Object} cartItemToRemove - item as `CartItemValue` object
 * @returns {Function} the function that removes the item from a shopping cart
 */
export function remove( cartItemToRemove ) {
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
 * @param {bool} domainsWithPlansOnly - Whether we should consider domains as dependents of products
 * @returns {Function} the function that removes the items from a shopping cart
 */
export function removeItemAndDependencies( cartItemToRemove, cart, domainsWithPlansOnly ) {
	const dependencies = getDependentProducts( cartItemToRemove, cart, domainsWithPlansOnly );
	const changes = dependencies.map( remove ).concat( remove( cartItemToRemove ) );

	return flow.apply( null, changes );
}

/**
 * Retrieves the dependency items from the shopping cart for the given cart item.
 *
 * @param {Object} cartItem - item as `CartItemValue` object
 * @param {Object} cart - cart as `CartValue` object
 * @param {bool} domainsWithPlansOnly - Whether we should consider domains as dependents of products
 * @returns {Object[]} the list of dependency items in the shopping cart
 */
export function getDependentProducts( cartItem, cart, domainsWithPlansOnly ) {
	const dependentProducts = getAll( cart ).filter( function( existingCartItem ) {
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
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of items in the shopping cart as `CartItemValue` objects
 */
export function getAll( cart ) {
	return ( cart && cart.products ) || [];
}

/**
 * Retrieves all the items in the shopping cart sorted
 *
 * @param {Object} cart - cart as `CartValue` object
 *
 * @returns {Object[]} the sorted list of items in the shopping cart
 */
export function getAllSorted( cart ) {
	return sortProducts( getAll( cart ) );
}

/**
 * Gets the renewal items from the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Array} an array of renewal items
 */
export function getRenewalItems( cart ) {
	return getAll( cart ).filter( isRenewal );
}

/**
 * Determines whether there is at least one item with free trial in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one item with free trial, false otherwise
 */
export function hasFreeTrial( cart ) {
	return some( getAll( cart ), 'free_trial' );
}

/**
 * Determines whether there is any kind of plan (e.g. Premium or Business) in the shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one plan, false otherwise
 */
export function hasPlan( cart ) {
	return cart && some( getAll( cart ), isPlan );
}

/**
 * Does the cart contain only bundled domains and transfers
 *
 * @param {Object} cart - cart as `CartValue` object
 * @return {Boolean} true if there are only bundled domains and transfers
 */
export function hasOnlyBundledDomainProducts( cart ) {
	return (
		cart && every( [ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ], isBundled )
	);
}

export function hasPremiumPlan( cart ) {
	return some( getAll( cart ), isPremium );
}

export function hasDomainCredit( cart ) {
	return cart.has_bundle_credit || hasPlan( cart );
}

/**
 * Whether the cart has a registration with a specific TLD
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {string} tld - TLD to look for, no leading dot
 *
 * @returns {Boolean} - Whether or not the cart contains a domain with that TLD
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
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if all items have free trial, false otherwise
 * @todo This will fail when a domain is purchased with a plan, as the domain will be included in the free trial
 */
export function hasOnlyFreeTrial( cart ) {
	return cart.products && findFreeTrial( cart ) && every( getAll( cart ), { cost: 0 } );
}

/**
 * Determines whether there is at least one item of a given product in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Object} productSlug - the unique string that identifies the product
 * @returns {boolean} true if there is at least one item of the specified product type, false otherwise
 */
export function hasProduct( cart, productSlug ) {
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
export function hasOnlyProductsOf( cart, productSlug ) {
	return cart.products && every( getAll( cart ), { product_slug: productSlug } );
}

/**
 * Determines whether there is at least one domain registration item in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one domain registration item, false otherwise
 */
export function hasDomainRegistration( cart ) {
	return some( getAll( cart ), isDomainRegistration );
}

export function hasOnlyDomainProductsWithPrivacySupport( cart ) {
	return every(
		concat( getDomainTransfers( cart ), getDomainRegistrations( cart ) ),
		privacyAvailable
	);
}

export function hasDomainMapping( cart ) {
	return some( getAll( cart ), isDomainMapping );
}

/**
 * Determines whether there is at least one renewal item in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one renewal item, false otherwise
 */
export function hasRenewalItem( cart ) {
	return some( getAll( cart ), isRenewal );
}

/**
 * Determines whether there is at least one domain transfer item in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one domain transfer item, false otherwise
 */
export function hasTransferProduct( cart ) {
	return some( getAll( cart ), isDomainTransfer );
}

/**
 * Retrieves all the domain transfer items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainTransfers( cart ) {
	return filter( getAll( cart ), { product_slug: domainProductSlugs.TRANSFER_IN } );
}

/**
 * Determines whether all items are renewal items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there are only renewal items, false otherwise
 */
export function hasOnlyRenewalItems( cart ) {
	return every( getAll( cart ), isRenewal );
}

/**
 * Determines whether any product in the specified shopping cart is a renewable subscription.
 * Will return false if the cart is empty.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if any product in the cart renews
 */
export function hasRenewableSubscription( cart ) {
	return cart.products && some( getAll( cart ), cartItem => cartItem.bill_period > 0 );
}

/**
 * Creates a new shopping cart item for a plan.
 *
 * @param {Object} productSlug - the unique string that identifies the product
 * @param {boolean} isFreeTrialItem - optionally specifies if this is a free trial or not
 * @returns {Object} the new item as `CartItemValue` object
 */
export function planItem( productSlug, isFreeTrialItem = false ) {
	// Free plan doesn't have shopping cart.
	if ( productSlug === PLAN_FREE ) {
		return null;
	}

	return {
		product_slug: productSlug,
		free_trial: isFreeTrialItem,
	};
}

/**
 * Creates a new shopping cart item for a Personal plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function personalPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a Premium plan.
 *
 * @param {string} slug - e.g. value_bundle, jetpack_premium
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function premiumPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a Business plan.
 *
 * @param {string} slug - e.g. business-bundle, jetpack_business
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function businessPlan( slug, properties ) {
	return planItem( slug, properties.isFreeTrial );
}

/**
 * Creates a new shopping cart item for a domain.
 *
 * @param {Object} productSlug - the unique string that identifies the product
 * @param {string} domain - domain name
 * @param {string} source - optional source for the domain item, e.g. `getdotblog`.
 * @returns {Object} the new item as `CartItemValue` object
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
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
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
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function domainMapping( properties ) {
	return domainItem( 'domain_map', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for Site Redirect.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function siteRedirect( properties ) {
	return domainItem( 'offsite_redirect', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for a domain privacy protection.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function domainPrivacyProtection( properties ) {
	return domainItem( 'private_whois', properties.domain, properties.source );
}

/**
 * Creates a new shopping cart item for an incoming domain transfer.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
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
 * Creates a new shopping cart item for an incoming domain transfer privacy.
 *
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function domainTransferPrivacy( properties ) {
	return domainItem( domainProductSlugs.TRANSFER_IN_PRIVACY, properties.domain, properties.source );
}

/**
 * Retrieves all the G Suite items in the specified shopping cart.
 * Out-dated name Google Apps is still used here for consistency in naming.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
function getGoogleApps( cart ) {
	return filter( getAll( cart ), isGoogleApps );
}

function googleApps( properties ) {
	const productSlug = properties.product_slug || 'gapps',
		item = domainItem( productSlug, properties.meta ? properties.meta : properties.domain );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

export function googleAppsExtraLicenses( properties ) {
	const item = domainItem( 'gapps_extra_license', properties.domain, properties.source );

	return assign( item, { extra: { google_apps_users: properties.users } } );
}

export function fillGoogleAppsRegistrationData( cart, registrationData ) {
	const googleAppsItems = filter( getAll( cart ), isGoogleApps );
	return flow.apply(
		null,
		googleAppsItems.map( function( item ) {
			item.extra = assign( item.extra, { google_apps_registration_data: registrationData } );
			return add( item );
		} )
	);
}

export function hasGoogleApps( cart ) {
	return some( getAll( cart ), isGoogleApps );
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

/**
 * Creates a new shopping cart item for the specified plan.
 *
 * @param {Object} plan - plan provided by the `PlansList` object
 * @param {Object} properties - list of properties
 * @returns {Object} the new item as `CartItemValue` object
 */
export function getItemForPlan( plan, properties ) {
	properties = properties || {};

	switch ( plan.product_slug ) {
		case PLAN_PERSONAL:
			return personalPlan( plan.product_slug, properties );
		case 'value_bundle':
		case PLAN_JETPACK_PREMIUM:
		case PLAN_JETPACK_PREMIUM_MONTHLY:
			return premiumPlan( plan.product_slug, properties );

		case PLAN_JETPACK_PERSONAL:
		case PLAN_JETPACK_PERSONAL_MONTHLY:
			return premiumPlan( plan.product_slug, properties );

		case 'business-bundle':
		case PLAN_JETPACK_BUSINESS:
		case PLAN_JETPACK_BUSINESS_MONTHLY:
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
export function findFreeTrial( cart ) {
	return find( getAll( cart ), { free_trial: true } );
}

/**
 * Retrieves all the domain registration items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainRegistrations( cart ) {
	return filter( getAll( cart ), { is_domain_registration: true } );
}

/**
 * Retrieves all the domain mapping items in the specified shopping cart.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainMappings( cart ) {
	return filter( getAll( cart ), { product_slug: 'domain_map' } );
}

/**
 * Returns a renewal CartItem object with the given properties and product slug.
 *
 * @param {String} product - the product object
 * @param {Object} [properties] - properties to be included in the new CartItem object
 * @returns {Object} a CartItem object
 */
export function getRenewalItemFromProduct( product, properties ) {
	product = formatProduct( product );

	let cartItem;

	if ( isDomainProduct( product ) ) {
		cartItem = domainItem( product.product_slug, properties.domain, properties.source );
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
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getSiteRedirects( cart ) {
	return filter( getAll( cart ), { product_slug: 'offsite_redirect' } );
}

export function hasDomainInCart( cart, domain ) {
	return some( getAll( cart ), { is_domain_registration: true, meta: domain } );
}

/**
 * Retrieves the domain registration items in the specified shopping cart that do not have corresponding
 * private whois items.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainRegistrationsWithoutPrivacy( cart ) {
	return getDomainRegistrations( cart ).filter( function( cartItem ) {
		return ! some( cart.products, {
			meta: cartItem.meta,
			product_slug: 'private_whois',
		} );
	} );
}

/**
 * Retrieves the domain incoming transfer items in the specified shopping cart that do not have corresponding
 * private incoming transfer item.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {Object[]} the list of the corresponding items in the shopping cart as `CartItemValue` objects
 */
export function getDomainTransfersWithoutPrivacy( cart ) {
	return getDomainTransfers( cart ).filter( function( cartItem ) {
		return ! some( cart.products, {
			meta: cartItem.meta,
			product_slug: domainProductSlugs.TRANSFER_IN_PRIVACY,
		} );
	} );
}

/**
 * Changes presence of a privacy protection for the given domain cart items.
 *
 * @param {Object} cart - cart as `CartValue` object
 * @param {Object[]} domainItems - the list of `CartItemValue` objects for domain registrations
 * @param {Function} changeFunction - the function that adds/removes the privacy protection to a shopping cart
 * @returns {Function} the function that adds/removes privacy protections from the shopping cart
 */
export function changePrivacyForDomains( cart, domainItems, changeFunction ) {
	return flow.apply(
		null,
		domainItems.map( function( item ) {
			if ( isDomainTransfer( item ) ) {
				return changeFunction( domainTransferPrivacy( { domain: item.meta } ) );
			}
			return changeFunction( domainPrivacyProtection( { domain: item.meta } ) );
		} )
	);
}

export function addPrivacyToAllDomains( cart ) {
	return changePrivacyForDomains(
		cart,
		[
			...getDomainRegistrationsWithoutPrivacy( cart ),
			...getDomainTransfersWithoutPrivacy( cart ),
		],
		add
	);
}

export function removePrivacyFromAllDomains( cart ) {
	return changePrivacyForDomains(
		cart,
		[ ...getDomainRegistrations( cart ), ...getDomainTransfers( cart ) ],
		remove
	);
}

/**
 * Determines whether a cart item is a renewal
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @returns {boolean} true if item is a renewal
 */
export function isRenewal( cartItem ) {
	return cartItem.extra && cartItem.extra.purchaseType === 'renewal';
}

/**
 * Determines whether a cart item supports privacy
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @returns {boolean} true if item supports privacy
 */
export function privacyAvailable( cartItem ) {
	return get( cartItem, 'extra.privacy_available', true );
}

/**
 * Get the included domain for a cart item
 *
 * @param {Object} cartItem - `CartItemValue` object
 * @returns {string} the included domain
 */
export function getIncludedDomain( cartItem ) {
	return cartItem.extra && cartItem.extra.includedDomain;
}

export function isNextDomainFree( cart ) {
	return !! ( cart && cart.next_domain_is_free );
}

export function isDomainBeingUsedForPlan( cart, domain ) {
	if ( cart && domain && hasPlan( cart ) ) {
		const domainProducts = getDomainRegistrations( cart ).concat( getDomainMappings( cart ) ),
			domainProduct = domainProducts.shift() || {};
		return domain === domainProduct.meta;
	}

	return false;
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

export function getDomainPriceRule( withPlansOnly, selectedSite, cart, suggestion ) {
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

/**
 * Determines whether any items in the cart were added more than X time ago (10 minutes)
 *
 * @param {Object} cart - cart as `CartValue` object
 * @returns {boolean} true if there is at least one cart item added more than X time ago, false otherwise
 */
export function hasStaleItem( cart ) {
	return some( getAll( cart ), function( cartItem ) {
		// time_added_to_cart is in seconds, Date.now() returns milliseconds
		return (
			cartItem.time_added_to_cart &&
			cartItem.time_added_to_cart * 1000 < Date.now() - 10 * 60 * 1000
		);
	} );
}

export default {
	add,
	addPrivacyToAllDomains,
	businessPlan,
	customDesignItem,
	domainMapping,
	domainPrivacyProtection,
	domainRegistration,
	domainTransfer,
	domainTransferPrivacy,
	fillGoogleAppsRegistrationData,
	findFreeTrial,
	getAll,
	getAllSorted,
	getDomainMappings,
	getDomainPriceRule,
	getDomainRegistrations,
	getDomainRegistrationsWithoutPrivacy,
	getDomainTransfers,
	getDomainTransfersWithoutPrivacy,
	getGoogleApps,
	getIncludedDomain,
	getItemForPlan,
	getRenewalItemFromCartItem,
	getRenewalItemFromProduct,
	getRenewalItems,
	getSiteRedirects,
	getTlds,
	googleApps,
	googleAppsExtraLicenses,
	guidedTransferItem,
	isDomainBeingUsedForPlan,
	isNextDomainFree,
	hasDomainCredit,
	hasDomainInCart,
	hasDomainMapping,
	hasDomainRegistration,
	hasOnlyDomainProductsWithPrivacySupport,
	hasFreeTrial,
	hasGoogleApps,
	hasOnlyFreeTrial,
	hasOnlyProductsOf,
	hasOnlyRenewalItems,
	hasPlan,
	hasOnlyBundledDomainProducts,
	hasPremiumPlan,
	hasProduct,
	hasRenewableSubscription,
	hasRenewalItem,
	hasTld,
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
	videoPressItem,
	hasStaleItem,
	hasTransferProduct,
};
