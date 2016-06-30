// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getCards, getByCardId } from '../selectors';
import { STORED_CARDS_FROM_API } from './fixture';

describe( 'selectors', () => {
	describe( 'getCards', () => {
		it( 'should return a purchase by its ID, preserving the top-level flags', () => {
			const state = {
				storedCards: {
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API
				}
			};

			expect( getCards( state ) ).to.be.eql( STORED_CARDS_FROM_API );
		} );
	} );

	describe( 'getByCardId', () => {
		it( 'should return a purchase by its ID, preserving the top-level flags', () => {
			const state = {
				storedCards: {
					isFetching: false,
					isDeleting: false,
					items: STORED_CARDS_FROM_API
				}
			};

			expect( getByCardId( state, 12345 ) ).to.be.eql( STORED_CARDS_FROM_API[ 1 ] );
		} );
	} );
} );
