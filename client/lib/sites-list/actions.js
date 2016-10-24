/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:sites-list:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ).undocumented();

var SitesListActions = {

	removeSitesNotices: function( logs ) {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_SITES_NOTICES',
			logs: logs
		} );
	},

	disconnect: function( site ) {
		debug( 'disconnect site', site );

		if ( site.capabilities && site.capabilities.manage_options ) {
			Dispatcher.handleViewAction( {
				type: 'DISCONNECT_SITE',
				action: 'DISCONNECT_SITE',
				site: site
			} );

			wpcom.disconnectJetpack( site.ID, function( error, data ) {
				Dispatcher.handleViewAction( {
					type: 'RECEIVE_DISCONNECTED_SITE',
					action: 'DISCONNECT_SITE',
					site: site,
					error: error,
					data: data
				} );
			} );
		} else {
			Dispatcher.handleViewAction( {
				type: 'DISCONNECTING_SITE_ERROR',
				action: 'DISCONNECT_SITE',
				site: site,
				error: { error: 'unauthorized_access' }
			} );
		}
	},

	deleteSite: function( site, onComplete ) {
		Dispatcher.handleViewAction( {
			type: 'DELETE_SITE',
			site: site
		} );

		debug( 'Deleting site', site );

		wpcom.deleteSite( site.ID, function( error ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETED_SITE_ERROR',
					error: error
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETED_SITE',
					site: site
				} );
			}

			onComplete( error );
		} );
	},

	receiveDeletedSite: function( error, data ) {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_DELETED_SITE',
			site: data
		} );
	},

	clearDeleteSiteStore: function() {
		Dispatcher.handleViewAction( { type: 'CLEAR_DELETED_SITE' } );
	}
};

module.exports = SitesListActions;
