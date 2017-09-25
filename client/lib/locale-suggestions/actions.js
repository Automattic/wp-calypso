/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
const LocaleSuggestionActions = {
	fetch: function() {
		wpcom.undocumented().getLocaleSuggestions( function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_LOCALE_SUGGESTIONS',
				data: data,
				error: error
			} );
		} );
	}
};

module.exports = LocaleSuggestionActions;
