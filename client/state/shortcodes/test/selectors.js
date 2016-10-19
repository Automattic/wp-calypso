/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getShortcode, isRequestingShortcode } from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingShortcode()', () => {
		it( 'should return false if shortcodes have never been fetched for that site', () => {
			const isRequesting = isRequestingShortcode( {
				shortcodes: {
					requesting: {
						87654321: {
							test_shortcode: true
						}
					}
				}
			}, 12345678, 'test_shortcode' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the shortcode is not being fetched for that site', () => {
			const isRequesting = isRequestingShortcode( {
				shortcodes: {
					requesting: {
						12345678: {
							test_shortcode: false
						}
					}
				}
			}, 12345678, 'test_shortcode' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the shortcode is being fetched only for another site', () => {
			const isRequesting = isRequestingShortcode( {
				shortcodes: {
					requesting: {
						87654321: {
							test_shortcode: false
						}
					}
				}
			}, 12345678, 'test_shortcode' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the shortcode is being fetched for that site', () => {
			const isRequesting = isRequestingShortcode( {
				shortcodes: {
					requesting: {
						12345678: {
							test_shortcode: true
						}
					}
				}
			}, 12345678, 'test_shortcode' );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getShortcode()', () => {
		const state = {
			shortcodes: {
				items: {
					12345678: {
						'[gallery ids="1,2,3"]': {
							body: '<html></html>',
							scripts: {},
							styles: {}
						},
					}
				}
			}
		};

		it( 'should return the shortcode object for the site ID', () => {
			const shortcode = getShortcode( state, 12345678, '[gallery ids="1,2,3"]' );

			expect( shortcode ).to.eql( {
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
