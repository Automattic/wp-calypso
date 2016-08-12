/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:StatesList' ),
	inherits = require( 'inherits' ),
	isEmpty = require( 'lodash/isEmpty' ),
	reject = require( 'lodash/reject' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	wpcom = require( 'lib/wp' ).undocumented();

/**
 * Initializes a new list of states.
 *
 * @constructor
 * @param {string} key - key used to identify this list in the store or the debug messages
 */
function StatesList( key ) {
	if ( ! ( this instanceof StatesList ) ) {
		return new StatesList( key );
	}

	this.key = key + 'StatesList';
	this.initialized = false;
}

/**
 * Adds event capabilities to this list of states.
 */
Emitter( StatesList.prototype );

/**
 * Fetches the list of states for the specified country from the server.
 *
 * @param {string} countryCode - country code
 */
StatesList.prototype.fetchForCountry = function( countryCode ) {
	if ( ! this.isFetching && ! isEmpty( countryCode ) ) {
		debug( 'Fetching ' + this.key + ' for ' + countryCode + ' from api' );

		this.isFetching = true;

		// Sends a request to the API endpoint defined in the subclass
		this.requestFromEndpoint( countryCode, function( error, data ) {
			var statesList;

			if ( error ) {
				debug( 'Unable to fetch ' + this.key + ' for ' + countryCode + ' from api', error );

				return;
			}

			statesList = data;

			debug( this.key + ' for ' + countryCode + ' fetched from api successfully:', statesList );

			if ( ! this.initialized ) {
				var statesLists = {};
				statesLists[ countryCode ] = statesList;

				this.initialize( statesLists );
			} else {
				this.data[ countryCode ] = statesList;
			}

			this.isFetching = false;

			this.emit( 'change' );

			store.set( this.key, this.data );
		}.bind( this ) );
	}
};

/**
 * Retrieves the list of states as a set of key and value pairs. This list will be loaded from the store and then
 * fetched once from the server to update any stale data.
 *
 * @param {string} countryCode - country code
 * @returns {object} the list of states
 */
StatesList.prototype.getByCountry = function( countryCode ) {
	var data;

	if ( ! this.data ) {
		data = store.get( this.key );

		if ( data ) {
			debug( 'Loaded ' + this.key + ' from store', data );

			this.initialize( data );
		} else {
			this.data = {};
		}

		this.fetchForCountry( countryCode );
	} else if ( ! (countryCode in this.data) ) {
		this.fetchForCountry( countryCode );
	}

	if ( countryCode in this.data ) {
		return this.data[ countryCode ];
	} else {
		return null;
	}
};

/**
 * Determines whether this list of states has already been loaded from the server or not.
 *
 * @return {boolean} true if this list of states has been loaded, false otherwise
 */
StatesList.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

/**
 * Initializes this list of states with the specified data.
 *
 * @param {object} data - data
 */
StatesList.prototype.initialize = function( data ) {
	this.data = data;

	this.initialized = true;
};

/**
 * Initializes a new list of states for domain registrations.
 *
 * @constructor
 */
function DomainRegistrationStatesList() {
	StatesList.call( this, 'DomainRegistration' );
}

inherits( DomainRegistrationStatesList, StatesList );

DomainRegistrationStatesList.prototype.requestFromEndpoint = function( countryCode, fn ) {
	return wpcom.getDomainRegistrationSupportedStates( countryCode, fn );
};

var domainRegistrationStatesList = new DomainRegistrationStatesList();

module.exports = {
	forDomainRegistrations: function() {
		return domainRegistrationStatesList;
	}
};
