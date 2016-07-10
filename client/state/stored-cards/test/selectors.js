// External dependencies
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

// Internal dependencies
import { getStoredCardById, getStoredCards, hasLoadedStoredCardsFromServer } from '../selectors';
import { STORED_CARDS_FROM_API } from './fixture';

describe( 'selectors', () => {
	describe( 'getStoredCards', () => {
		it( 'should return all cards', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API
				}
			} );

			expect( getStoredCards( state ) ).to.be.eql( STORED_CARDS_FROM_API );
		} );
	} );

	describe( 'getStoredCardById', () => {
		it( 'should return a card by its ID, preserving the top-level flags', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API
				}
			} );

			expect( getStoredCardById( state, 12345 ) ).to.be.eql( STORED_CARDS_FROM_API[ 1 ] );
		} );
	} );

	describe( 'hasLoadedStoredCardsFromServer', () => {
		it( 'should return the flag that determines whether the list of cards has been loaded from the server', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API
				}
			} );

			expect( hasLoadedStoredCardsFromServer( state ) ).to.be.true;
		} );
	} );
} );
