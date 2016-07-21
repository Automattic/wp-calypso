/**
 * External dependencies
 */
import debugFactory from 'debug';
import store from 'store';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Emitter from 'lib/mixins/emitter';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:features-list' );

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
	let data;
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
	wpcom.plans().features( ( error, features ) => {
		if ( error ) {
			debug( 'error fetching FeaturesList from api', error );
			return;
		}

		debug( 'FeaturesList fetched from api:', features );

		if ( ! this.initialized ) {
			this.initialize( features );
		} else {
			this.update( features );
		}

		this.emit( 'change' );
		store.set( 'FeaturesList', features );
	} );
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
 * @return {Boolean} true, if data was initialized
 */
FeaturesList.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

/**
 * Expose `FeaturesList`
 */
module.exports = FeaturesList;
