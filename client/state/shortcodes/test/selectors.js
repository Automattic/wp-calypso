/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getShortcode } from '../selectors';

describe( 'selectors', () => {
	describe( '#getShortcode()', () => {
		const state = {
			shortcodes: {
				12345678: {
					'[gallery ids="1,2,3"]': {
						status: true,
						body: '<html></html>',
						scripts: {},
						styles: {}
					},
				}
			}
		};

		it( 'should return the shortcode object for the site ID', () => {
			const shortcode = getShortcode( state, 12345678, '[gallery ids="1,2,3"]' );

			expect( shortcode ).to.eql( {
				status: true,
				body: '<html></html>',
				scripts: {},
				styles: {}
			} );
		} );

		it( 'should return undefined if there is no such site', () => {
			const shortcode = getShortcode( state, 87654321, '[gallery ids="1,2,3"]' );

			expect( shortcode ).to.be.undefined;
		} );

		it( 'should return undefined if there is no such shortcode for a site', () => {
			const shortcode = getShortcode( state, 12345678, '[gallery]' );

			expect( shortcode ).to.be.undefined;
		} );
	} );
} );
