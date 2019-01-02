/** @format */

/**
 * Internal dependencies
 */
import { getSiteStyle } from '../selectors';

describe( 'getSiteStyle()', () => {
	test( 'should return the site style value', () => {
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
