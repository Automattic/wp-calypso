/**
 * External dependencies
 */
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import { recordAddToCart } from 'lib/analytics/ad-tracking';
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import { cartItems } from 'lib/cart-values';
import { isDomainMapping, isDomainRegistration, isPlan } from 'lib/products-values';
import { abtest } from 'lib/abtest';
import SitesList from 'lib/sites-list';
import CartStore from 'lib/cart/store';
const sitesList = SitesList();

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import 'lib/cart/store';

function openCartPopup( options ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_POPUP_OPEN,
		options: options || {}
	} );
}

function closeCartPopup() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_POPUP_CLOSE
	} );
}

function addPrivacyToAllDomains() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_PRIVACY_PROTECTION_ADD
	} );
}

function removePrivacyFromAllDomains() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_PRIVACY_PROTECTION_REMOVE
	} );
}

function addItem( item ) {
	addItems( [ item ] );
}

function addItems( items ) {
	const domainsWithPlansOnlyTestEnabled = abtest( 'domainsWithPlansOnly' ) === 'plansOnly',
		freeTrialsEnabled = abtest( 'freeTrialsInSignup' ) === 'enabled',
		selectedSite = sitesList.getSelectedSite();
	let shouldBundleWithPremium = items.some( item => isDomainRegistration( item ) || isDomainMapping( item ) ) && ! freeTrialsEnabled && domainsWithPlansOnlyTestEnabled;

	if ( selectedSite ) {
		const cart = CartStore.get();
		shouldBundleWithPremium = shouldBundleWithPremium && ! isPlan( selectedSite.plan ) && ! cartItems.hasPlan( cart );
	}

	//add premium plan for users not on the personalPlan group.
	if ( shouldBundleWithPremium && abtest( 'personalPlan' ) === 'hide' ) {
		items = [ cartItems.premiumPlan( 'value_bundle', { isFreeTrial: false } ) ].concat( items );
	}

	const extendedItems = items.map( ( item ) => {
		const extra = assign( {}, item.extra, {
			context: 'calypstore',
			withPlansOnly: domainsWithPlansOnlyTestEnabled && ! freeTrialsEnabled ? 'yes' : ''
		} );

		return assign( {}, item, { extra } );
	} );

	extendedItems.forEach( item => recordAddToCart( item ) );

	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEMS_ADD,
		cartItems: extendedItems
	} );
}

function removeItem( item ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEM_REMOVE,
		cartItem: item
	} );
}

function addDomainToCart( domainSuggestion ) {
	addItem( cartItems.domainRegistration( {
		domain: domainSuggestion.domain_name,
		productSlug: domainSuggestion.product_slug
	} ) );
}

function removeDomainFromCart( domainSuggestion ) {
	removeItem( cartItems.domainRegistration( {
		domain: domainSuggestion.domain_name,
		productSlug: domainSuggestion.product_slug
	} ) );
}

function applyCoupon( coupon ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_COUPON_APPLY,
		coupon
	} );
}

export {
	addDomainToCart,
	addItem,
	addItems,
	addPrivacyToAllDomains,
	applyCoupon,
	closeCartPopup,
	openCartPopup,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains
};
