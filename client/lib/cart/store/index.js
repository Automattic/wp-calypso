/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	partialRight = require( 'lodash/partialRight' ),
	flowRight = require( 'lodash/flowRight' ),
	flow = require( 'lodash/flow' );

/**
 * Internal dependencies
 */
var UpgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	emitter = require( 'lib/mixins/emitter' ),
	sites = require( 'lib/sites-list' )(),
	cartSynchronizer = require( './cart-synchronizer' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	PollerPool = require( 'lib/data-poller' ),
	cartAnalytics = require( './cart-analytics' ),
	productsList = require( 'lib/products-list' )(),
	Dispatcher = require( 'dispatcher' ),
	cartValues = require( 'lib/cart-values' ),
	applyCoupon = cartValues.applyCoupon,
	cartItems = cartValues.cartItems;

var _selectedSiteID = null,
	_synchronizer = null,
	_poller = null;

var CartStore = {
	get: function() {
		var value = hasLoadedFromServer() ? _synchronizer.getLatestValue() : {};

		return assign( {}, value, {
			hasLoadedFromServer: hasLoadedFromServer(),
			hasPendingServerUpdates: hasPendingServerUpdates()
		} );
	}
};

emitter( CartStore );

function hasLoadedFromServer() {
	return ( _synchronizer && _synchronizer.hasLoadedFromServer() );
}

function hasPendingServerUpdates() {
	return ( _synchronizer && _synchronizer.hasPendingServerUpdates() );
}

function setSelectedSite() {
	var selectedSite = sites.getSelectedSite();

	if ( ! selectedSite ) {
		_selectedSiteID = null;
		return;
	}

	if ( _selectedSiteID === selectedSite.ID ) {
		return;
	}

	if ( _synchronizer && _poller ) {
		PollerPool.remove( _poller );
		_synchronizer.off( 'change', emitChange );
	}

	_selectedSiteID = selectedSite.ID;

	_synchronizer = cartSynchronizer( selectedSite.ID, wpcom );
	_synchronizer.on( 'change', emitChange );

	_poller = PollerPool.add( CartStore, _synchronizer._poll.bind( _synchronizer ) );
}

function emitChange() {
	CartStore.emit( 'change' );
}

function update( changeFunction ) {
	var wrappedFunction,
		previousCart,
		nextCart;

	wrappedFunction = flowRight(
		partialRight( cartValues.fillInAllCartItemAttributes, productsList.get() ),
		changeFunction
	);

	previousCart = CartStore.get();
	nextCart = wrappedFunction( previousCart );

	_synchronizer.update( wrappedFunction );
	cartAnalytics.recordEvents( previousCart, nextCart );
}

CartStore.dispatchToken = Dispatcher.register( ( payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case UpgradesActionTypes.CART_PRIVACY_PROTECTION_ADD:
			update( cartItems.addPrivacyToAllDomains( CartStore.get() ) );
			break;

		case UpgradesActionTypes.CART_PRIVACY_PROTECTION_REMOVE:
			update( cartItems.removePrivacyFromAllDomains( CartStore.get() ) );
			break;

		case UpgradesActionTypes.CART_ITEMS_ADD:
			update( flow( ...action.cartItems.map( cartItem => cartItems.add( cartItem ) ) ) );
			break;

		case UpgradesActionTypes.CART_COUPON_APPLY:
			update( applyCoupon( action.coupon ) );
			break;

		case UpgradesActionTypes.CART_ITEM_REMOVE:
			update( cartItems.removeItemAndDependencies( action.cartItem, CartStore.get(), action.domainsWithPlansOnly ) );
			break;
	}
} );

sites.on( 'change', setSelectedSite );
setSelectedSite();

module.exports = CartStore;
