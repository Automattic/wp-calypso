/**
 * Internal dependencies
 */
import { getSegments } from '../selectors';

describe( 'state/signup/segments/selectors', () => {
	describe( 'getSegments()', () => {
		test( 'should default to null.', () => {
			expect( getSegments( {}, 'aaa' ) ).toBeNull();
		} );

		test( 'should return the stored segments data.', () => {
			const state = {
				signup: {
					segments: [
						{
							a: 1,
						},
						{
							b: 2,
						},
					],
				},
			};
			expect( getSegments( state ) ).toEqual( state.signup.segments );
		} );
	} );
} );
