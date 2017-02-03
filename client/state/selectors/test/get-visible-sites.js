/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getVisibleSites } from '../';

describe( 'getVisibleSites()', () => {
	it( 'should return an empty array if no sites in state', () => {
		const state = {
			sites: {
				items: {}
			}
		};
		const sites = getVisibleSites( state );
		expect( sites ).to.eql( [] );
	} );

	it( 'should return the visibles sites in state', () => {
		const state = {
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						visible: true,
						name: 'WordPress.com Example Blog',
						URL: 'https://example.com',
						options: {
							unmapped_url: 'https://example.wordpress.com'
						}
					},
					2916285: {
						ID: 2916285,
						visible: false,
						name: 'WordPress.com Non visible Blog',
						URL: 'https://example2.com',
						options: {
							unmapped_url: 'https://example2.wordpress.com'
						}
					}
				}
			}
		};
		const sites = getVisibleSites( state );
		expect( sites ).to.eql( [
			{
				ID: 2916284,
				visible: true,
				name: 'WordPress.com Example Blog',
				URL: 'https://example.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.com',
				slug: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: true,
				options: {
					default_post_format: 'standard',
					unmapped_url: 'https://example.wordpress.com'
				}
			}
		] );
	} );
} );
