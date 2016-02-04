/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:plans-list' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * PlansList component
 *
 * @api public
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
var pathToSlugMapping = {
	'beginner': 'free_plan',
	'premium':  'value_bundle',
	'business': 'business-bundle'
};

/**
 * Get list of plans from current object or store,
 * trigger fetch on first request to update stale data
 */
PlansList.prototype.get = function() {
	var data;
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
	wpcom.undocumented().getPlans( function( error, data ) {
		var plans;

		if ( error ) {
			debug( 'error fetching PlansList from api', error );
			return;
		}

		plans = this.parse( data );

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
 **/
PlansList.prototype.initialize = function( plans ) {
	this.data = plans;
	this.initialized = true;
};

/**
 * Parse data returned from the API
 *
 * @param {array} data
 * @return {array} plans
 **/
PlansList.prototype.parse = function( data ) {
	/**
	 * Remove the _headers
	 */
	delete data._headers;
	return data;
};

/**
 * Update plans list
 **/
PlansList.prototype.update = function( plans ) {
	this.data = plans;
};

/**
 * Map the plan path to the product_slug
 */
PlansList.prototype.getSlugFromPath = function( path ) {
	return pathToSlugMapping[ path ];
};

/**
 * Map the product_slug to the plan path
 */
PlansList.prototype.getPathFromSlug = function( slug ) {
	return Object.keys( pathToSlugMapping ).filter( function( path ) {
		if ( slug === pathToSlugMapping[ path ] ) {
			return path;
		}
	} );
};

// Save the plans to memory to save them being fetched from the store every time the user switches sites
var _plans;

/**
 * Expose `PlansList`
 */
module.exports = function() {

	if ( ! _plans ) {
		_plans = new PlansList();
	}

	return _plans;
};
