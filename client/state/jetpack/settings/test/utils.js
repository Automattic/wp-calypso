/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { normalizeSettings, sanitizeSettings } from '../utils';

describe( 'utils', () => {
	describe( 'normalizeSettings()', () => {
		it( 'should not modify random settings', () => {
			const settings = {
				some_random_setting: 'example'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				some_random_setting: 'example'
			} );
		} );

		it( 'should convert wp_mobile_excerpt to true if it is "enabled"', () => {
			const settings = {
				wp_mobile_excerpt: 'enabled'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				wp_mobile_excerpt: true
			} );
		} );

		it( 'should convert wp_mobile_excerpt to false if it is "disabled"', () => {
			const settings = {
				wp_mobile_excerpt: 'disabled'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				wp_mobile_excerpt: false
			} );
		} );

		it( 'should convert wp_mobile_featured_images to true if it is "enabled"', () => {
			const settings = {
				wp_mobile_featured_images: 'enabled'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				wp_mobile_featured_images: true
			} );
		} );

		it( 'should convert wp_mobile_featured_images to false if it is "disabled"', () => {
			const settings = {
				wp_mobile_featured_images: 'disabled'
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				wp_mobile_featured_images: false
			} );
		} );
	} );

	describe( 'sanitizeSettings()', () => {
		it( 'should not modify random settings', () => {
			const settings = {
				some_random_setting: 'example'
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				some_random_setting: 'example'
			} );
		} );

		it( 'should convert wp_mobile_excerpt to "enabled" if it is true', () => {
			const settings = {
				wp_mobile_excerpt: true
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				wp_mobile_excerpt: 'enabled'
			} );
		} );

		it( 'should convert wp_mobile_excerpt to "disabled" if it is false', () => {
			const settings = {
				wp_mobile_excerpt: false
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				wp_mobile_excerpt: 'disabled'
			} );
		} );

		it( 'should convert wp_mobile_featured_images to "enabled" if it is true', () => {
			const settings = {
				wp_mobile_featured_images: true
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				wp_mobile_featured_images: 'enabled'
			} );
		} );

		it( 'should convert wp_mobile_featured_images to "disabled" if it is false', () => {
			const settings = {
				wp_mobile_featured_images: false
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				wp_mobile_featured_images: 'disabled'
			} );
		} );

		it( 'should omit post_by_email_address from sanitized settings', () => {
			const settings = {
				some_other_setting: 123,
				post_by_email_address: 'some-email@example.com'
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				some_other_setting: 123,
			} );
		} );
	} );
} );
