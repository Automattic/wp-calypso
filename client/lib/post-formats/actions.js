/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:post-formats' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

/**
 * Module variables
 */
var PostFormatsActions = {};

PostFormatsActions.fetch = function( siteId ) {
	Dispatcher.handleViewAction( {
		type: 'FETCH_POST_FORMATS',
		siteId: siteId
	} );

	debug( 'Fetching post formats for %d', siteId );
	wpcom.undocumented().site( siteId ).postFormatsList( function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_POST_FORMATS',
			error: error,
			siteId: siteId,
			data: data ? data.formats : null
		} );
	} );
};

module.exports = PostFormatsActions;
