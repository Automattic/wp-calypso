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
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS
} from 'lib/plans/constants';
import { insertPersonalPlan } from 'lib/plans/personal-plan';

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
 * Set up a mapping from product_slug to a pretty path
 */
const pathToSlugMapping = {
	beginner: PLAN_FREE,
	personal: PLAN_PERSONAL,
	premium: PLAN_PREMIUM,
	business: PLAN_BUSINESS
};

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

		const plans = insertPersonalPlan( this.parse( data ) );

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
 * Map the plan path to the product_slug
 *
 * @param {String} path - plan path
 * @return {String} plan
 */
PlansList.prototype.getSlugFromPath = function( path ) {
	return pathToSlugMapping[ path ];
};

/**
 * Map the product_slug to the plan path
 *
 * @param {String} slug - product path
 * @return {String} plan
 */
PlansList.prototype.getPathFromSlug = function( slug ) {
	return Object.keys( pathToSlugMapping ).filter( function( path ) {
		if ( slug === pathToSlugMapping[ path ] ) {
			return path;
		}
	} );
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
