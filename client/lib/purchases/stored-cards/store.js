/**
 * External Dependencies
 */
import assign from 'lodash/object/assign';
import find from 'lodash/collection/find';

/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getInitialState, reducer } from './reducer';

const StoredCardsStore = createReducerStore( reducer, getInitialState() );

assign( StoredCardsStore, {
	getByCardId( cardId ) {
		return assign( {}, this.get(), { data: find( this.get().list, { id: cardId } ) } );
	}
} );

export default StoredCardsStore;
