/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:ProductsList' ),
	omit = require( 'lodash/omit' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

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
	var data;

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
		var productsList;

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

var productsList = new ProductsList();

module.exports = function() {
	if ( ! productsList.hasLoadedFromServer() && ! productsList.isFetching ) {
		productsList.get();
	}

	return productsList;
};
