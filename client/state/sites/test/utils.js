/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteComputedAttributes } from '../utils';
import { userState } from 'state/selectors/test/fixtures/user-state';
describe( 'utils', () => {
	describe( 'getSiteComputedAttributes()', () => {
		it( 'should return null if site is not found', () => {
			const state = {
				...userState,
				sites: {
					items: {}
				}
			};
			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).to.be.null;
		} );

		it( 'should return the "mandatory" attributes', () => {
			const state = {
				...userState,
				sites: {
					items: {
						2916288: {
							ID: 2916288,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.wordpress.com',
							jetpack: false
						}
					}
				}
			};

			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).to.eql( {
				title: 'WordPress.com Example Blog',
				is_previewable: false,
				is_customizable: false,
				hasConflict: false,
				domain: 'example.wordpress.com',
				slug: 'example.wordpress.com',
				options: {
					default_post_format: 'standard'
				}
			} );
		} );

		it( 'should return the "mandatory" and optional attributes if conditions for those are met', () => {
			const options = {
				default_post_format: 'test',
				is_mapped_domain: true,
				unmapped_url: 'https://unmapped-url.wordpress.com',
				is_redirect: true
			};
			const state = {
				...userState,
				sites: {
					items: {
						2916288: {
							ID: 2916288,
							name: 'WordPress.com Example Blog',
							URL: 'https://example.wordpress.com',
							jetpack: false,
							options
						}
					}
				}
			};

			const computedAttributes = getSiteComputedAttributes( state, 2916288 );
			expect( computedAttributes ).to.eql( {
				title: 'WordPress.com Example Blog',
				is_previewable: false,
				is_customizable: false,
				hasConflict: false,
				domain: 'unmapped-url.wordpress.com',
				slug: 'unmapped-url.wordpress.com',
				options,
				wpcom_url: 'unmapped-url.wordpress.com',
				URL: 'https://unmapped-url.wordpress.com',
			} );
		} );
	} );
} );
