/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:roles:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

var RolesActions = {
	fetch: function( siteId ) {
		debug( 'Fetch site roles', siteId );

		Dispatcher.handleViewAction( {
			type: 'FETCHING_ROLES',
			siteId: siteId
		} );

		wpcom.undocumented().site( siteId ).getRoles( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_ROLES',
				action: 'RECEIVE_ROLES',
				siteId: siteId,
				data: data,
				error: error
			} );
		} );
	}
};

module.exports = RolesActions;
