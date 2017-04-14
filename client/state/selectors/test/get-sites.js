/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSites } from '../';

describe( 'getSites()', () => {
	it( 'should return an empty array if no sites in state', () => {
		const state = {
			sites: {
				items: {}
			}
		};
		const sites = getSites( state );
		expect( sites ).to.eql( [] );
	} );

	it( 'should return all the sites in state', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						visible: true,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.wordpress.com',
						options: {
							unmapped_url: 'https://example.wordpress.com'
						}
					},
					2916285: {
						ID: 2916285,
						visible: false,
						name: 'WordPress.com Way Better Example Blog',
						URL: 'https://example2.wordpress.com',
						options: {
							unmapped_url: 'https://example2.wordpress.com'
						}
					}
				}
			}
		};
		const sites = getSites( state );
		expect( sites ).to.have.length( 2 );
		expect( sites[ 0 ] ).to.have.property( 'name', 'WordPress.com Example Blog' );
		expect( sites[ 1 ] ).to.have.property( 'name', 'WordPress.com Way Better Example Blog' );
	} );
} );
