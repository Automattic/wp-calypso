/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:features-list' ),
	reject = require( 'lodash/reject' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * PlansList component
 *
 * @return {FeaturesList} FeaturesList instance
 * @api public
 */
function FeaturesList() {
	if ( ! ( this instanceof FeaturesList ) ) {
		return new FeaturesList();
	}

	this.initialized = false;
}

/**
 * Mixins
 */
Emitter( FeaturesList.prototype );

/**
 * Get list of features from current object or store,
 * trigger fetch on first request to update stale data.
 *
 * @return {Array} array of list of features
 */
FeaturesList.prototype.get = function() {
	var data;
	if ( ! this.data ) {
		debug( 'First time loading FeaturesList, check store' );
		data = store.get( 'FeaturesList' );
		if ( data ) {
			this.initialize( data );
		} else {
			this.data = [];
		}
		this.fetch();
	}
	return this.data;
};

/**
 * Fetch the list of features for WordPress.com plans via the REST API.
 *
 * @api public
 */
FeaturesList.prototype.fetch = function() {
	debug( 'getting FeaturesList from api' );
	wpcom.undocumented().getPlansFeatures( function( error, data ) {
		var features;

		if ( error ) {
			debug( 'error fetching FeaturesList from api', error );
			return;
		}

		features = this.parse( data );

		debug( 'FeaturesList fetched from api:', features );

		if ( ! this.initialized ) {
			this.initialize( features );
		} else {
			this.update( features );
		}

		this.emit( 'change' );
		store.set( 'FeaturesList', features );
	}.bind( this ) );
};

/**
 * Initialize data with Feature objects
 *
 * @param {Array} features - features array
 */
FeaturesList.prototype.initialize = function( features ) {
	this.data = features;
	this.initialized = true;
};

/**
 * Parses data retrieved from the API and extracts the list of features.
 *
 * @param {array} data - raw data
 * @return {array} a list of features
 */
FeaturesList.prototype.parse = function( data ) {
	return reject( data, '_headers' );
};

/**
 * Update features list
 *
 * @param {Array} features - features array
 */
FeaturesList.prototype.update = function( features ) {
	this.data = features;
};

/**
 * Check whether we have data yet
 *
 * @return {Boolean} data is already?
 */
FeaturesList.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

/**
 * Expose `FeaturesList`
 */
module.exports = FeaturesList;
