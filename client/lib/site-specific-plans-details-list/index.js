/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:site-specific-plans-details-list' ),
	find = require( 'lodash/collection/find' ),
	store = require( 'store' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * SiteSpecificPlansDetailsList component
 *
 * @api public
 */
function SiteSpecificPlansDetailsList() {
	if ( ! ( this instanceof SiteSpecificPlansDetailsList ) ) {
		return new SiteSpecificPlansDetailsList();
	}

	this.initialized = false;
	this.isFetching = false;
}

/**
 * Mixins
 */
Emitter( SiteSpecificPlansDetailsList.prototype );

/**
 * Get site specific plan data from current object or store,
 * trigger fetch on first request to update stale data
 */
SiteSpecificPlansDetailsList.prototype.get = function( siteDomain, planId ) {
	var localData;
	if ( ! this.data ) {
		debug( 'First time loading SiteSpecificPlansDetailsList, check store' );
		localData = store.get( 'SiteSpecificPlansDetailsList' );
		this.initialize( localData );

		// Always fetch the data in case it has changed
		if ( ! this.isFetching ) {
			this.fetch( siteDomain );
		}
	}

	if( this.data[ siteDomain ] && this.data[ siteDomain ][ planId ] ) {
		return this.data[ siteDomain ][ planId ];
	}

	return {};
};

SiteSpecificPlansDetailsList.prototype.hasJpphpBundle = function( siteDomain ) {
	return this.get( siteDomain, 'host-bundle' ).current_plan;
};

SiteSpecificPlansDetailsList.prototype.getCurrentPlan = function( siteDomain ) {
	return find( this.data[ siteDomain ], { current_plan: true } );
};

/**
 * Fetch the site specific plan data from WordPress.com via the REST API.
 *
 * @api public
 */
SiteSpecificPlansDetailsList.prototype.fetch = function( siteDomain ) {
	debug( 'getting SiteSpecificPlansDetailsList from api' );

	if ( ! siteDomain && ! this.isFetching ) {
		return false;
	}

	this.isFetching = true;

	wpcom.undocumented().getSitePlans( siteDomain, function( error, data ) {
		var planData;

		if ( error ) {
			debug( 'error fetching SiteSpecificPlansDetailsList from api', error );
			return;
		}

		planData = this.parse( data );

		debug( 'SiteSpecificPlansDetailsList fetched from api:', planData );
		this.update( planData, siteDomain );

		this.emit( 'change' );
		store.set( 'SiteSpecificPlansDetailsList', this.data );

		this.isFetching = false;
	}.bind( this ) );
};

/**
 * Initialize data with SitePlan data
 **/
SiteSpecificPlansDetailsList.prototype.initialize = function( data ) {
	if ( data ) {
		this.data = data;
	} else {
		this.data = {};
	}
	this.initialized = true;
};

/**
 * Parse data returned from the API
 *
 * @param {array} data
 * @return {array} plans
 **/
SiteSpecificPlansDetailsList.prototype.parse = function( data ) {
	/**
	 * Remove the _headers
	 */
	delete data._headers;
	return data;
};

/**
 * Update plans list
 **/
SiteSpecificPlansDetailsList.prototype.update = function( planData, siteDomain ) {
	this.data[ siteDomain ] = planData;
};


/**
 * Returns a Boolean indicating whether the data has initially loaded from the
 * server.
 */
SiteSpecificPlansDetailsList.prototype.hasLoadedFromServer = function( siteDomain ) {
	return this.initialized && this.data[ siteDomain ];
};

/**
 * Expose `SiteSpecificPlansDetailsList`
 */
var _SiteSpecificPlansDetailsList;
module.exports = function() {

	if ( ! _SiteSpecificPlansDetailsList ) {
		_SiteSpecificPlansDetailsList = new SiteSpecificPlansDetailsList();
	}

	return _SiteSpecificPlansDetailsList;
};
