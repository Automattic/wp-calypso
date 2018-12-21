/** @format */

/**
 * Internal dependencies
 */
import { getSiteInformation } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty object as a default state', () => {
		expect( getSiteInformation( { siteInformation: undefined } ) ).toEqual( {} );
	} );

	test( 'should return site information from the state', () => {
		expect(
			getSiteInformation( {
				signup: {
					steps: {
						siteInformation: {
							address: '23 Slappy Junior St',
							phone: '+49 76543210',
						},
					},
				},
			} )
		).toEqual( {
			address: '23 Slappy Junior St',
			phone: '+49 76543210',
		} );
	} );
} );
