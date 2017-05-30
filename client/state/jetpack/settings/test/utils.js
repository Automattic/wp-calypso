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

		it( 'should omit akismet from sanitized settings', () => {
			const settings = {
				some_other_setting: 123,
				akismet: true
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

	describe( 'filterSettingsByActiveModules()', () => {
		it( 'should remove module activation state and retain all module settings for enabled modules', () => {
			const settings = {
				example_setting: true,
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
