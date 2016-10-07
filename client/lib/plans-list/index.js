/**
 * External dependencies
 */
import debugFactory from 'debug';
import store from 'store';
import { find } from 'lodash';

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
	.list( { apiVersion: '1.2' }, function( error, plans ) {
		if ( error ) {
			debug( 'error fetching PlansList from api', error );
			return;
		}

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

	return find( this.data, { product_slug: slug } );
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
