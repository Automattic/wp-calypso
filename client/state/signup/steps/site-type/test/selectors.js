/**
 * Internal dependencies
 */
import { getSiteType } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSiteType( { siteType: undefined } ) ).toEqual( '' );
	} );

	test( 'should return site type from the state', () => {
		expect(
			getSiteType( {
				signup: {
					steps: {
						siteType: 'halloumi-salad',
					},
				},
			} )
		).toEqual( 'halloumi-salad' );
	} );
} );
