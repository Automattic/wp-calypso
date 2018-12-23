/** @format */

/**
 * Internal dependencies
 */
import { getSiteVertical } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty object as a default state', () => {
		expect( getSiteVertical( { name: undefined } ) ).toEqual( {} );
	} );

	test( 'should return site vertical from the state', () => {
		expect(
			getSiteVertical( {
				signup: {
					steps: {
						siteVertical: {
							name: 'felice',
							slug: 'happy',
						},
					},
				},
			} )
		).toEqual( {
			name: 'felice',
			slug: 'happy',
		} );
	} );
} );
