/** @format */

/**
 * Internal dependencies
 */
import { getVerticals } from '../selectors';

describe( 'state/signup/verticals/selectors', () => {
	describe( 'getVerticals()', () => {
		test( 'should default to null.', () => {
			expect( getVerticals( {}, 'aaa' ) ).toBeNull();
		} );

		const searchTerm = 'Cool';
		const state = {
			signup: {
				verticals: {
					[ searchTerm ]: [
						{ id: 0, verticalName: 'Ah!' },
						{ id: 1, verticalName: 'I am selected!' },
					],
				},
			},
		};

		test( 'should return the stored verticals data.', () => {
			expect( getVerticals( state, searchTerm ) ).toEqual( state.signup.verticals[ searchTerm ] );
		} );

		test( 'should return null if it does not exist', () => {
			expect( getVerticals( state, 'Aaa' ) ).toBeNull();
		} );
	} );
} );
