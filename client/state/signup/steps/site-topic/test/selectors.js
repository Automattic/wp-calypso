/** @format */

/**
 * Internal dependencies
 */
import { getSignupStepsSiteTopic } from '../selectors';

describe( 'getSignupStepsSiteTopic()', () => {
	test( 'should return the site topic field', () => {
		const siteTopic = 'Profit!';
		expect(
			getSignupStepsSiteTopic( {
				signup: {
					steps: {
						siteTopic,
					},
				},
			} )
		).toEqual( siteTopic );
	} );

	test( 'should default to null', () => {
		expect( getSignupStepsSiteTopic( {} ) ).toBeNull();
	} );
} );
