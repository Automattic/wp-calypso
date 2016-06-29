// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getCards, getByCardId } from '../selectors';
import { STORED_CARDS } from './fixture';

describe( 'selectors', () => {
	describe( 'getCards', () => {
		it( 'should return a purchase by its ID, preserving the top-level flags', () => {
			const state = {
				storedCards: {
					error: null,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS
				}
			};

			expect( getCards( state ) ).to.be.eql( STORED_CARDS );
		} );
	} );

	describe( 'getByCardId', () => {
		it( 'should return a purchase by its ID, preserving the top-level flags', () => {
			const state = {
				storedCards: {
					error: null,
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS
				}
			};

			expect( getByCardId( state, 12345 ) ).to.be.eql( STORED_CARDS[1] );
		} );
	} );
} );
