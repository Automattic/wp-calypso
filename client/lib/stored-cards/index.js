/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:stored-cards' ),
	reject = require( 'lodash/reject' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * StoredCards component
 *
 * @api public
 */
function StoredCards() {
	if ( ! ( this instanceof StoredCards ) ) {
		return new StoredCards();
	}

	this.initialized = false;
}

/**
 * Mixins
 */
Emitter( StoredCards.prototype );

/**
 * Get list of stored cards from current object or store,
 * trigger fetch on first request to update stale data
 */
StoredCards.prototype.get = function() {
	var storedCards;
	if ( ! this.storedCards ) {
		debug( 'First time loading stored cards, check store' );
		storedCards = store.get( 'StoredCards' );
		if ( storedCards ) {
			this.initialize( storedCards );
		} else {
			this.storedCards = [];
		}
		this.fetch();
	}
	return this.storedCards;
};

/**
 * Fetch the user's stored cards from WordPress.com via the REST API.
 *
 * @api public
 */
StoredCards.prototype.fetch = function() {
	debug( 'getting stored cards from api' );
	wpcom.undocumented().getStoredCards( function( error, data ) {
		var storedCards;

		if ( error ) {
			debug( 'error fetching stored cards from api', error );
			return;
		}

		storedCards = this.parse( data );

		debug( 'Stored cards fetched from api:', storedCards );

		if ( ! this.initialized ) {
			this.initialize( storedCards );
		} else {
			this.update( storedCards );
		}

		this.emit( 'change' );
		store.set( 'StoredCards', storedCards );

	}.bind( this ) );
};

/**
 * Initialize data with StoredCard objects
 **/
StoredCards.prototype.initialize = function( storedCards ) {
	this.storedCards = storedCards;
	this.initialized = true;
};

/**
 * Parses data retrieved from the API and extracts the list of stored cards.
 *
 * @param {array} data - raw data
 * @return {array} a list of stored cards
 **/
StoredCards.prototype.parse = function( data ) {
	return reject( data, '_headers' );
};

/**
 * Update stored cards list
 **/
StoredCards.prototype.update = function( storedCards ) {
	this.storedCards = storedCards;
};

/**
 * Expose `StoredCards`
 */
module.exports = StoredCards;
