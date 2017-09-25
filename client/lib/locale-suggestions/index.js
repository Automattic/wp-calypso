/**
 * Internal dependencies
 */
import LocaleSuggestionActions from './actions';
import Dispatcher from 'dispatcher';
import Emitter from 'lib/mixins/emitter';

let localeSuggestions = null;

const LocaleSuggestionStore = {
	get: function() {
		if ( ! localeSuggestions ) {
			LocaleSuggestionActions.fetch();
		}
		return localeSuggestions;
	},

	receiveLocaleSuggestions: function( newLocaleSuggestions ) {
		localeSuggestions = newLocaleSuggestions;
		LocaleSuggestionStore.emit( 'change' );
	}
};

Emitter( LocaleSuggestionStore );

LocaleSuggestionStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	switch ( action.type ) {
		case 'RECEIVE_LOCALE_SUGGESTIONS':
			LocaleSuggestionStore.receiveLocaleSuggestions( action.data );
			break;
	}
} );

export default LocaleSuggestionStore;
