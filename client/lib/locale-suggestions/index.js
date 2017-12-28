/** @format */

/**
 * External dependencies
 */

import Dispatcher from 'client/dispatcher';

/**
 * Internal dependencies
 */
import Emitter from 'client/lib/mixins/emitter';
import LocaleSuggestionActions from './actions';

var localeSuggestions = null;

var LocaleSuggestionStore = {
	get: function() {
		if ( ! localeSuggestions ) {
			LocaleSuggestionActions.fetch();
		}
		return localeSuggestions;
	},

	receiveLocaleSuggestions: function( newLocaleSuggestions ) {
		localeSuggestions = newLocaleSuggestions;
		LocaleSuggestionStore.emit( 'change' );
	},
};

Emitter( LocaleSuggestionStore );

LocaleSuggestionStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'RECEIVE_LOCALE_SUGGESTIONS':
			LocaleSuggestionStore.receiveLocaleSuggestions( action.data );
			break;
	}
} );

export default LocaleSuggestionStore;
