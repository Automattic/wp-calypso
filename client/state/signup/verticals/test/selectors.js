/**
 * Internal dependencies
 */
import { getVerticals } from '../selectors';

describe( 'state/signup/verticals/selectors', () => {
	describe( 'getVerticals()', () => {
		test( 'should default to null.', () => {
			expect( getVerticals( {}, 'aaa' ) ).toBeNull();
		} );

		const searchTerm = 'cool';
		const state = {
			signup: {
				verticals: {
					business: {
						[ searchTerm ]: [
							{ id: 0, verticalName: 'Ah!' },
							{ id: 1, verticalName: 'I am selected!' },
						],
					},
				},
			},
		};

		test( 'should return the stored verticals data.', () => {
			expect( getVerticals( state, searchTerm, 'business' ) ).toEqual(
				state.signup.verticals.business[ searchTerm ]
			);
		} );

		test( 'should return null if it does not exist', () => {
			expect( getVerticals( state, 'Aaa', 'business' ) ).toBeNull();
			expect( getVerticals( state, searchTerm, '' ) ).toBeNull();
			expect( getVerticals( state, searchTerm ) ).toBeNull();
		} );

		test( 'should return correct results from mixed case and untrimmed value', () => {
			expect( getVerticals( state, ' COOL ', 'business' ) ).toEqual(
				state.signup.verticals.business[ searchTerm ]
			);
		} );
	} );
} );
