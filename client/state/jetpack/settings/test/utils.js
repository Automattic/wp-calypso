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
				protect: true,
				jetpack_protect_global_whitelist: 'test',
				sso: true,
				jetpack_sso_match_by_email: true,
				jetpack_sso_require_two_step: true,
				'after-the-deadline': true,
				onpublish: true,
				onupdate: true,
				guess_lang: true,
				'Bias Language': true,
				Cliches: true,
				'Complex Expression': true,
				'Diacritical Marks': true,
				'Double Negative': true,
				'Hidden Verbs': true,
				'Jargon Language': true,
				'Passive voice': true,
				'Phrases to Avoid': true,
				'Redundant Expression': true,
				ignored_phrases: true,
				'custom-content-types': true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				comments: true,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
				carousel: true,
				carousel_background_color: 'black',
				carousel_display_exif: true,
				stats: true,
				admin_bar: true,
				hide_smile: true,
				count_roles: true,
				roles: true,
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
				jetpack_protect_global_whitelist: 'test',
				jetpack_sso_match_by_email: true,
				jetpack_sso_require_two_step: true,
				onpublish: true,
				onupdate: true,
				guess_lang: true,
				'Bias Language': true,
				Cliches: true,
				'Complex Expression': true,
				'Diacritical Marks': true,
				'Double Negative': true,
				'Hidden Verbs': true,
				'Jargon Language': true,
				'Passive voice': true,
				'Phrases to Avoid': true,
				'Redundant Expression': true,
				ignored_phrases: true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
				carousel_background_color: 'black',
				carousel_display_exif: true,
				admin_bar: true,
				hide_smile: true,
				count_roles: true,
				roles: true,
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
				protect: false,
				jetpack_protect_global_whitelist: 'test',
				sso: false,
				jetpack_sso_match_by_email: true,
				jetpack_sso_require_two_step: true,
				'after-the-deadline': false,
				onpublish: true,
				onupdate: true,
				guess_lang: true,
				'Bias Language': true,
				Cliches: true,
				'Complex Expression': true,
				'Diacritical Marks': true,
				'Double Negative': true,
				'Hidden Verbs': true,
				'Jargon Language': true,
				'Passive voice': true,
				'Phrases to Avoid': true,
				'Redundant Expression': true,
				ignored_phrases: true,
				'custom-content-types': false,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				comments: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
				carousel: false,
				carousel_background_color: 'black',
				carousel_display_exif: true,
				stats: false,
				admin_bar: true,
				hide_smile: true,
				count_roles: true,
				roles: true,
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
				jetpack_protect_global_whitelist: 'test',
				jetpack_sso_match_by_email: true,
				jetpack_sso_require_two_step: true,
				onpublish: true,
				onupdate: true,
				guess_lang: true,
				'Bias Language': true,
				Cliches: true,
				'Complex Expression': true,
				'Diacritical Marks': true,
				'Double Negative': true,
				'Hidden Verbs': true,
				'Jargon Language': true,
				'Passive voice': true,
				'Phrases to Avoid': true,
				'Redundant Expression': true,
				ignored_phrases: true,
				jetpack_testimonial: true,
				jetpack_portfolio: false,
				highlander_comment_form_prompt: 'Leave a Reply',
				jetpack_comment_form_color_scheme: 'light',
				carousel_background_color: 'black',
				carousel_display_exif: true,
				admin_bar: true,
				hide_smile: true,
				count_roles: true,
				roles: true,
			};

			expect( filterSettingsByActiveModules( settings ) ).to.eql( {
				example_setting: true,
			} );
		} );
	} );
} );
