import deepFreeze from 'deep-freeze';
import {
	getStoredCardById,
	getStoredCards,
	getAllStoredCards,
	hasLoadedStoredCardsFromServer,
	getStoredPaymentAgreements,
	getUniquePaymentAgreements,
} from '../selectors';
import {
	STORED_CARDS_FROM_API,
	SELECTED_STORED_CARDS,
	SELECTED_PAYMENT_AGREEMENTS,
	SELECTED_UNIQUE_PAYMENT_AGREEMENTS,
} from './fixture';

describe( 'selectors', () => {
	describe( 'getStoredCards', () => {
		test( 'should return all non-expired cards', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( getStoredCards( state ) ).toEqual(
				SELECTED_STORED_CARDS.filter( ( card ) => ! card.is_expired )
			);
		} );
	} );

	describe( 'getAllStoredCards', () => {
		test( 'should return all cards including expired ones', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( getAllStoredCards( state ) ).toEqual( SELECTED_STORED_CARDS );
		} );
	} );

	describe( 'getStoredPaymentAgreements', () => {
		test( 'should return all payment agreements', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( getStoredPaymentAgreements( state ) ).toEqual( SELECTED_PAYMENT_AGREEMENTS );
		} );
	} );

	describe( 'getUniquePaymentAgreements', () => {
		test( 'should return all unique payment agreements grouped by email', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( getUniquePaymentAgreements( state ) ).toEqual( SELECTED_UNIQUE_PAYMENT_AGREEMENTS );
		} );
	} );

	describe( 'getStoredCardById', () => {
		test( 'should return a card by its ID, preserving the top-level flags', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( getStoredCardById( state, '12345' ) ).toEqual( SELECTED_STORED_CARDS[ 1 ] );
		} );
	} );

	describe( 'hasLoadedStoredCardsFromServer', () => {
		test( 'should return the flag that determines whether the list of cards has been loaded from the server', () => {
			const state = deepFreeze( {
				storedCards: {
					hasLoadedFromServer: true,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API,
				},
			} );

			expect( hasLoadedStoredCardsFromServer( state ) ).toBe( true );
		} );
	} );
} );
