/** @format */
/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:help-search:actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	ActionTypes = require( './constants' ).action,
	wpcom = require( 'lib/wp' );

var HelpSearchActions = {
	fetch: function( searchQuery ) {
		debug( 'fetching help links' );

		wpcom.undocumented().getHelpLinks( searchQuery, function( error, helpLinks ) {
			if ( error ) {
				debug( error );
				return;
			}

			debug( 'received help links from API' );

			Dispatcher.handleServerAction( {
				type: ActionTypes.SET_HELP_LINKS,
				helpLinks: helpLinks,
			} );
		} );
	},
};

module.exports = HelpSearchActions;
