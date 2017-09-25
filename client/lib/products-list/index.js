/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:ProductsList' );
import store from 'store';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import Emitter from 'lib/mixins/emitter';

/**
 * Initialize a new list of products.
 *
 * @api public
 */
function ProductsList() {
	if ( ! ( this instanceof ProductsList ) ) {
		return new ProductsList();
	}

	this.initialized = false;
}

/**
 * Mixins
 */
Emitter( ProductsList.prototype );

/**
 * Gets the list of products from current object or store, triggers fetch on first request to update stale data.
 *
 * @return {array}
 * @api public
 */
ProductsList.prototype.get = function() {
	let data;

	if ( ! this.data ) {
		debug( 'First time loading ProductsList, check store' );

		data = store.get( 'ProductsList' );

		if ( data ) {
			this.initialize( data );
		} else {
			this.data = {};
		}

		this.fetch();
	}

	return this.data;
};

/**
 * Fetchs the list of products from the API.
 *
 * @api public
 */
ProductsList.prototype.fetch = function() {
	debug( 'getting ProductsList from api' );

	this.isFetching = true;

	wpcom.undocumented().getProducts( function( error, data ) {
		let productsList;

		if ( error ) {
			debug( 'error fetching ProductsList from api', error );

			return;
		}

		productsList = data;

		debug( 'ProductsList fetched from api:', productsList );

		if ( ! this.initialized ) {
			this.initialize( productsList );
		} else {
			this.data = productsList;
		}

		this.isFetching = false;

		this.emit( 'change' );

		store.set( 'ProductsList', productsList );
	}.bind( this ) );
};

/**
 * Initializes data with a list of products.
 **/
ProductsList.prototype.initialize = function( productsList ) {
	this.data = productsList;
	this.initialized = true;
};

/**
 * Determines whether the data has initially loaded from the server.
 *
 * @return {boolean}
 */
ProductsList.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

const productsList = new ProductsList();

module.exports = function() {
	if ( ! productsList.hasLoadedFromServer() && ! productsList.isFetching ) {
		productsList.get();
	}

	return productsList;
};
