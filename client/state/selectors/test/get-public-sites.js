/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPublicSites from 'calypso/state/selectors/get-public-sites';
import { userState } from './fixtures/user-state';

describe( 'getPublicSites()', () => {
	test( 'should return an empty array if no sites in state', () => {
		const state = {
			...userState,
			sites: {
				items: {},
			},
		};
		const sites = getPublicSites( state );
		expect( sites ).to.eql( [] );
	} );

	test( 'should return the public sites in state', () => {
		const state = {
			...userState,
			sites: {
				items: {
					2916284: {
						ID: 2916284,
						is_private: false,
						name: 'WordPress.com Example Blog',
						URL: 'http://example.com',
						options: {
							unmapped_url: 'http://example.com',
						},
					},
					2916285: {
						ID: 2916285,
						is_private: true,
						name: 'WordPress.com Non visible Blog',
						URL: 'http://example2.com',
						options: {
							unmapped_url: 'http://example2.com',
						},
					},
				},
			},
			siteSettings: {
				items: {},
			},
		};
		const sites = getPublicSites( state );
		expect( sites ).to.eql( [
			{
				ID: 2916284,
				is_private: false,
				name: 'WordPress.com Example Blog',
				URL: 'http://example.com',
				title: 'WordPress.com Example Blog',
				domain: 'example.com',
				slug: 'example.com',
				hasConflict: false,
				is_customizable: false,
				is_previewable: false,
				options: {
					unmapped_url: 'http://example.com',
				},
			},
		] );
	} );
} );
