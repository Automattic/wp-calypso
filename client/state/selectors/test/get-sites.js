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
						URL: 'http://example.com',
						options: {
							unmapped_url: 'http://example.com'
						}
					},
					2916285: {
						ID: 2916285,
						visible: false,
						name: 'WordPress.com Way Better Example Blog',
						URL: 'https://example2.com',
						options: {
							unmapped_url: 'https://example2.com'
						}
					}
				}
			}
		};
		const sites = getSites( state );
		expect( sites ).to.eql( [
			{
				ID: 2916284,
				visible: true,
				name: 'WordPress.com Example Blog',
				URL: 'http://example.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.com',
				slug: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: false,
				options: {
					default_post_format: 'standard',
					unmapped_url: 'http://example.com'
				}
			},
			{
				ID: 2916285,
				visible: false,
				name: 'WordPress.com Way Better Example Blog',
				URL: 'https://example2.com',
				title: 'WordPress.com Way Better Example Blog',
				domain: 'example2.com',
				slug: 'example2.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: false,
				options: {
					default_post_format: 'standard',
					unmapped_url: 'https://example2.com'
				}
			}
		] );
	} );
} );
