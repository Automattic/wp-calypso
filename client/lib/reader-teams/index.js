// Reader Teams Store

//var debug = require( 'debug' )( 'calypso:reader:team-store' );

// External Dependencies
var Dispatcher = require( 'dispatcher' ),
	some = require( 'lodash/some' ),
	assign = require( 'lodash/assign' ),
	config = require( 'config' );

// Internal Dependencies
var emitter = require( 'lib/mixins/emitter' ),
	ActionTypes = require( './constants' ).action,
	ErrorTypes = require( './constants' ).error;

var teams = null,
	errors = [];

var TeamStore = {

	get: function() {
		return teams;
	},

	// Have we received an error in the last couple of minutes?
	hasRecentError: function() {
		var recentTimeIntervalSeconds = 120,
			dateNow = Date.now();

		return some( errors, function( error ) {
			return ( dateNow - error.timestamp ) < ( recentTimeIntervalSeconds * 1000 );
		} );
	}
};

function receiveTeamsResponse( action ) {
	if ( action.error ) {
		errors.push( {
			error: action.error,
			errorType: ErrorTypes.UNABLE_TO_RECEIVE_TEAMS,
			timestamp: Date.now()
		} );
		return;
	}

	if ( ! action.data || ! action.data.teams ) {
		errors.push( {
			error: 'invalid format',
			errorType: ErrorTypes.UNABLE_TO_RECEIVE_TEAMS,
			timestamp: Date.now()
		} );
		return;
	}

	teams = action.data.teams;
	TeamStore.emit( 'change' );
}

if ( config( 'env' ) === 'development' ) {
	assign( TeamStore, {
		// These bedlumps are for testing.
		_reset: function() {
			teams = null;
			errors = [];
		}
	} );
}

emitter( TeamStore );

TeamStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	if ( ! action ) {
		return;
	}

	switch ( action.type ) {
		case ActionTypes.RECEIVE_TEAMS:
			receiveTeamsResponse( action );
			break;
	}
} );

module.exports = TeamStore;
