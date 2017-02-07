/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { normalizeSettings, sanitizeSettings, filterSettingsByActiveModules } from '../utils';

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

	describe( 'filterSettingsByActiveModules()', () => {
		it( 'should remove module activation state and retain all module settings for enabled modules', () => {
			const settings = {
				example_setting: true,
				'infinite-scroll': true,
				infinite_scroll: false,
				infinite_scroll_google_analytics: true,
				minileven: true,
				wp_mobile_excerpt: true,
				wp_mobile_featured_images: true,
				wp_mobile_app_promos: false,
				subscriptions: true,
				stb_enabled: true,
				stc_enabled: false,
				likes: true,
				social_notifications_like: false,
				social_notifications_reblog: true,
				social_notifications_subscribe: false,
				markdown: true,
				wpcom_publish_comments_with_markdown: true,
				'custom-content-types': true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				comments: true,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
			};

			expect( filterSettingsByActiveModules( settings ) ).to.eql( {
				example_setting: true,
				infinite_scroll: false,
				infinite_scroll_google_analytics: true,
				wp_mobile_excerpt: true,
				wp_mobile_featured_images: true,
				wp_mobile_app_promos: false,
				stb_enabled: true,
				stc_enabled: false,
				social_notifications_like: false,
				social_notifications_reblog: true,
				social_notifications_subscribe: false,
				wpcom_publish_comments_with_markdown: true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
			} );
		} );

		it( 'should omit all module settings for disabled modules', () => {
			const settings = {
				example_setting: true,
				'infinite-scroll': false,
				infinite_scroll: false,
				infinite_scroll_google_analytics: true,
				minileven: false,
				wp_mobile_excerpt: true,
				wp_mobile_featured_images: true,
				wp_mobile_app_promos: false,
				subscriptions: false,
				stb_enabled: true,
				stc_enabled: false,
				likes: false,
				social_notifications_like: false,
				social_notifications_reblog: true,
				social_notifications_subscribe: false,
				markdown: false,
				wpcom_publish_comments_with_markdown: true,
				'custom-content-types': false,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				comments: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
			};

			expect( filterSettingsByActiveModules( settings ) ).to.eql( {
				example_setting: true,
			} );
		} );

		it( 'should omit all module settings for modules with unknown activation state', () => {
			const settings = {
				example_setting: true,
				infinite_scroll: false,
				infinite_scroll_google_analytics: true,
				wp_mobile_excerpt: true,
				wp_mobile_featured_images: true,
				wp_mobile_app_promos: false,
				stb_enabled: true,
				stc_enabled: false,
				social_notifications_like: false,
				social_notifications_reblog: true,
				social_notifications_subscribe: false,
				wpcom_publish_comments_with_markdown: true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
			};

			expect( filterSettingsByActiveModules( settings ) ).to.eql( {
				example_setting: true,
			} );
		} );
	} );
} );
