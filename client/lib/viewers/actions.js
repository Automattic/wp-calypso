/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:viewers:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

var ViewersActions = {
	fetch: function( siteId, page = 1 ) {
		var number = 100;
		debug( 'Fetch site viewers', siteId );

		Dispatcher.handleViewAction( {
			type: 'FETCHING_VIEWERS',
			siteId: siteId
		} );

		wpcom.undocumented().site( siteId ).getViewers( { page: page, number: number }, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_VIEWERS',
				action: 'RECEIVE_VIEWERS',
				siteId: siteId,
				page: page,
				data: data,
				error: error
			} );
		} );
	},

	remove: function( siteId, viewer ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_VIEWER',
			siteId: siteId,
			viewer: viewer
		} );

		wpcom.undocumented().site( siteId ).removeViewer( viewer.ID, function( error, data ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_VIEWER_ERROR',
					siteId: siteId,
					viewer: viewer,
					error: error
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_VIEWER_SUCCESS',
					siteId: siteId,
					viewer: viewer,
					data: data
				} );
			}
		} );
	}
};

export default ViewersActions;
