/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:services-list' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' );

/**
 * ServicesList component
 *
 * @api public
 */
function ServicesList() {
	if ( ! ( this instanceof ServicesList ) ) {
		return new ServicesList();
	}

	this.initialized = false;
}

/**
 * Mixins
 */
Emitter( ServicesList.prototype );

/**
 * Get list of services from current object or trigger fetch on first request
 */
ServicesList.prototype.get = function() {
	if ( ! this.data ) {
		this.data = [];
		this.fetch();
	}

	return this.data;
};

/**
 * Fetch available services from WordPress.com via the REST API.
 *
 * @api public
 */
ServicesList.prototype.fetch = function() {
	if ( ! this.fetching ) {
		debug( 'getting ServicesList from api' );
		this.fetching = true;

		wpcom.undocumented().metaKeyring( function( error, data ) {
			if ( error ) {
				debug( 'error fetching ServicesList from api', error );
				return;
			}

			this.initialized = true;
			this.fetching = false;
			this.data = this.parse( data );
			this.emit( 'change' );
		}.bind( this ) );
	}
};

/**
 * Parse data return from the API
 *
 * @param {object} data
 * @return {array} services
 **/
ServicesList.prototype.parse = function( data ) {
	// Move service name from object key to `name` property of array object
	return Object.keys( data.services ).map( function( serviceName ) {
		var service = data.services[ serviceName ];
		service.name = serviceName;
		return service;
	} );
};

/**
 * Expose `ServicesList`
 */
module.exports = ServicesList;
