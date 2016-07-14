/**
 * External dependencies
 */
import debugFactory from 'debug';
import reject from 'lodash/reject';
import store from 'store';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Emitter from 'lib/mixins/emitter';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:plans-list' );

/**
 * PlansList component
 *
 * @return { PlansList } PlansList instance
 */
function PlansList() {
	if ( ! ( this instanceof PlansList ) ) {
		return new PlansList();
	}

	this.initialized = false;
}

/**
 * Mixins
 */
Emitter( PlansList.prototype );

/**
 * Get list of plans from current object or store,
 * trigger fetch on first request to update stale data
 *
 * @return {Object} list of plans object
 */
PlansList.prototype.get = function() {
	let data;
	if ( ! this.data ) {
		debug( 'First time loading PlansList, check store' );
		data = store.get( 'PlansList' );
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
 * Fetch the user's plans from WordPress.com via the REST API.
 *
 * @api public
 */
PlansList.prototype.fetch = function() {
	debug( 'getting PlansList from api' );
	wpcom
	.plans()
	.list( { apiVersion: '1.2' }, function( error, data ) {
		if ( error ) {
			debug( 'error fetching PlansList from api', error );
			return;
		}

		const plans = this.parse( data );

		debug( 'PlansList fetched from api:', plans );

		if ( ! this.initialized ) {
			this.initialize( plans );
		} else {
			this.update( plans );
		}

		this.emit( 'change' );
		store.set( 'PlansList', plans );
	}.bind( this ) );
};

/**
 * Initialize data with Plan objects
 *
 * @param {Object} plans - plans data object
 **/
PlansList.prototype.initialize = function( plans ) {
	this.data = plans;
	this.initialized = true;
};

/**
 * Parses data retrieved from the API and extracts the list of plans.
 *
 * @param {array} data - raw data
 * @return {array} a list of plans
 **/
PlansList.prototype.parse = function( data ) {
	return reject( data, '_headers' );
};

/**
 * Update plans list
 *
 * @param {Object} plans - plans data object
 */
PlansList.prototype.update = function( plans ) {
	this.data = plans;
};

/**
 * Search in the plans list for a plan with a certain slug
 *
 * @param {string} slug - Slug to search
 * @return {array} a list of plans that match the search term
 */
PlansList.prototype.getPlanBySlug = function( slug ) {
	if ( ! this.data ) {
		return null;
	}
	const filteredPlans = this.data.filter( ( plan ) => {
		if ( plan && plan.product_slug === slug ) {
			return plan;
		}
	} );

	return filteredPlans[ 0 ];
};

// Save the plans to memory to save them being fetched
// from the store every time the user switches sites
let _plans;

/**
 * Expose `PlansList`
 *
 * @return {PlansList} plans list instance
 */
module.exports = function() {
	if ( ! _plans ) {
		_plans = new PlansList();
	}

	return _plans;
};
