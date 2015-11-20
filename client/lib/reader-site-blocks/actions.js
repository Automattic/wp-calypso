// Internal Dependencies
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	ActionTypes = require( './constants' ).action;

var SiteBlockActions = {
	block: function( siteId ) {
		if ( ! siteId ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.BLOCK_SITE,
			siteId: siteId,
			data: { siteId: siteId }
		} );

		wpcom.me().blockSite( siteId, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_BLOCK_SITE,
				siteId: siteId,
				data: data,
				error: error
			} );
		} );
	},
	unblock: function( siteId ) {
		if ( ! siteId ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.UNBLOCK_SITE,
			siteId: siteId,
			data: { siteId: siteId }
		} );

		wpcom.me().unblockSite( siteId, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_UNBLOCK_SITE,
				siteId: siteId,
				data: data,
				error: error
			} );
		} );
	},

	dismissError: function( error ) {
		if ( ! error ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: ActionTypes.DISMISS_BLOCK_ERROR,
			data: error
		} );
	}
};

module.exports = SiteBlockActions;
