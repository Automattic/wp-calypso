/** @format */

/**
 * External dependencies
 */

import Dispatcher from 'client/dispatcher';
import wpcom from 'client/lib/wp';

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

export default LocaleSuggestionActions;
