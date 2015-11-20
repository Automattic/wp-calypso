// Internal Dependencies
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	ActionTypes = require( './constants' ).action;

var fetching = false;

var TeamActions = {

	fetch: function() {

		if ( fetching ) {
			return;
		}

		fetching = true;

		wpcom.readTeams( function( error, data ) {
			fetching = false;
			TeamActions.receive( error, data );
		} );
	},

	receive: function( error, data ) {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_TEAMS,
			data: data,
			error: error
		} );
	},

};

module.exports = TeamActions;
