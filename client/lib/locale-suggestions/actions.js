/** @format */
/**
 * External dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

/**
 * Internal dependencies
 */
var LocaleSuggestionActions = {
	fetch: function() {
		wpcom.undocumented().getLocaleSuggestions( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_LOCALE_SUGGESTIONS',
				data: data,
				error: error,
			} );
		} );
	},
};

module.exports = LocaleSuggestionActions;
