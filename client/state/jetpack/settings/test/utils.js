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

		it( 'should convert carousel_background_color to "black" if it is an empty string', () => {
			const settings = {
				carousel_background_color: ''
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				carousel_background_color: 'black'
			} );
		} );

		it( 'should default jetpack_protect_global_whitelist whitelist to an empty string when null', () => {
			expect( normalizeSettings( {
				jetpack_protect_global_whitelist: null
			} ) ).to.eql( {
				jetpack_protect_global_whitelist: '',
			} );
		} );

		it( 'should default jetpack_protect_global_whitelist whitelist to an empty string when empty', () => {
			expect( normalizeSettings( {
				jetpack_protect_global_whitelist: {
					local: []
				}
			} ) ).to.eql( {
				jetpack_protect_global_whitelist: '',
			} );
		} );

		it( 'should not add extra newlines when extracting jetpack_protect_global_whitelist', () => {
			const settings = {
				jetpack_protect_global_whitelist: {
					local: [
						'123.123.123.123',
					]
				}
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				jetpack_protect_global_whitelist: '123.123.123.123',
			} );
		} );

		it( 'should add newlines between IPs when extracting jetpack_protect_global_whitelist', () => {
			const settings = {
				jetpack_protect_global_whitelist: {
					local: [
						'123.123.123.123',
						'213.123.213.123',
					]
				}
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				jetpack_protect_global_whitelist: '123.123.123.123\n213.123.213.123',
			} );
		} );

		it( 'should skip infinite scroll settings when module activation state is missing', () => {
			const settings = {
				some_setting: 'example',
				infinite_scroll: true,
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				some_setting: 'example',
			} );
		} );

		it( 'should set infinite_scroll to default and infinite-scroll to false if the module is inactive', () => {
			const settings = {
				infinite_scroll: true,
				'infinite-scroll': false,
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				infinite_scroll: 'default',
				'infinite-scroll': false,
			} );
		} );

		it( 'should set infinite_scroll to scroll and infinite-scroll to true if the module is active and scroll is enabled', () => {
			const settings = {
				infinite_scroll: true,
				'infinite-scroll': true,
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				infinite_scroll: 'scroll',
				'infinite-scroll': true,
			} );
		} );

		it( 'should set infinite_scroll to button and infinite-scroll to true if the module is active and scroll is disabled', () => {
			const settings = {
				infinite_scroll: false,
				'infinite-scroll': true,
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				infinite_scroll: 'button',
				'infinite-scroll': true,
			} );
		} );

		it( 'should skip all Custom Content Types settings', () => {
			const settings = {
				some_other_setting: 123,
				jetpack_testimonial: true,
				jetpack_portfolio: true,
				'custom-content-types': true,
			};

			expect( normalizeSettings( settings ) ).to.eql( {
				some_other_setting: 123,
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

		it( 'should omit post_by_email_address from sanitized settings', () => {
			const settings = {
				some_other_setting: 123,
				post_by_email_address: 'some-email@example.com'
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				some_other_setting: 123,
			} );
		} );

		it( 'should skip infinite scroll settings if infinite_scroll is not defined', () => {
			const settings = {
				some_other_setting: 123,
				'infinite-scroll': true,
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				some_other_setting: 123,
			} );
		} );

		it( 'should disable infinite scroll module when set to the default setting', () => {
			const settings = {
				infinite_scroll: 'default',
				'infinite-scroll': true,
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				'infinite-scroll': false,
			} );
		} );

		it( 'should enable infinite scroll module and set scroll to true when setting is scroll', () => {
			const settings = {
				infinite_scroll: 'scroll',
				'infinite-scroll': false,
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				infinite_scroll: true,
				'infinite-scroll': true,
			} );
		} );

		it( 'should enable infinite scroll module and set scroll to false when setting is button', () => {
			const settings = {
				infinite_scroll: 'button',
				'infinite-scroll': false,
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				infinite_scroll: false,
				'infinite-scroll': true,
			} );
		} );

		it( 'should skip all Custom Content Types settings', () => {
			const settings = {
				some_other_setting: 123,
				jetpack_testimonial: true,
				jetpack_portfolio: true,
				'custom-content-types': true,
			};

			expect( sanitizeSettings( settings ) ).to.eql( {
				some_other_setting: 123,
			} );
		} );
	} );
} );
