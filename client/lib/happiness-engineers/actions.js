/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:happiness-engineers:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	ActionTypes = require( './constants' ).action,
	wpcom = require( 'lib/wp' );

var HappineersEngineersActions = {
	fetch: function() {
		debug( 'fetching happiness egnineers list' );

		wpcom.undocumented().getHappinessEngineers( function( error, happinessEngineers ) {
			if ( error ) {
				debug( error );
				return;
			}

			Dispatcher.handleServerAction( {
				type: ActionTypes.SET_HAPPPINESS_ENGINEERS,
				action: ActionTypes.SET_HAPPPINESS_ENGINEERS,
				happinessEngineers: happinessEngineers
			} );
		} );
	}
};

module.exports = HappineersEngineersActions;
