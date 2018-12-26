/** @format */

/**
 * Internal dependencies
 */
import { getSiteStyle } from '../selectors';

describe( 'getSignupStepsSiteTopic()', () => {
	test( 'should return the site topic field', () => {
		const siteStyle = 'elegant';
		expect(
			getSiteStyle( {
				signup: {
					steps: {
						siteStyle,
					},
				},
			} )
		).toEqual( siteStyle );
	} );

	test( 'should default to an empty string', () => {
		expect( getSiteStyle( {} ) ).toEqual( '' );
	} );
} );
