import getWordadsSettings from 'calypso/state/selectors/get-wordads-settings';

describe( 'getWordadsSettings()', () => {
	const settings = {
		paypal: 'support@wordpress.com',
	};
	const siteId = 12345678;
	const sitesState = {
		sites: {
			items: {
				[ siteId ]: {
					jetpack: false,
				},
			},
		},
	};
	const jetpackSettingsState = {
		jetpack: {
			settings: {
				[ siteId ]: null,
			},
		},
	};

	test( 'should return null for an unknown site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						87654321: settings,
					},
				},
			},
			sites: {
				items: {
					87654321: {
						jetpack: false,
					},
				},
			},
			jetpack: {
				settings: {
					87654321: null,
				},
			},
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toBeNull();
	} );

	test( 'should return all stored Wordads settings for a known site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: settings,
					},
				},
			},
			...sitesState,
			...jetpackSettingsState,
		};
		const output = getWordadsSettings( state, siteId );
		expect( output ).toMatchObject( settings );
	} );

	test( 'should get settings from Jetpack settings state for a Jetpack site', () => {
		const state = {
			wordads: {
				settings: {
					items: {
						[ siteId ]: settings,
					},
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						jetpack: true,
					},
				},
			},
			jetpack: {
				settings: {
					[ siteId ]: {
						wordads: 'wordads-test',
						wordads_display_front_page: 'wordads_display_front_page-test',
						wordads_display_post: 'wordads_display_post-test',
						wordads_display_page: 'wordads_display_page-test',
						wordads_display_archive: 'wordads_display_archive-test',
						enable_header_ad: 'enable_header_ad-test',
						wordads_second_belowpost: 'wordads_second_belowpost-test',
						wordads_inline_enabled: 'wordads_inline_enabled-test',
						wordads_ccpa_enabled: 'wordads_ccpa_enabled-test',
						wordads_ccpa_privacy_policy_url: 'wordads_ccpa_privacy_policy_url-test',
						wordads_custom_adstxt_enabled: 'wordads_custom_adstxt_enabled-test',
						wordads_custom_adstxt: 'wordads_custom_adstxt-test',
						wordads_cmp_enabled: 'wordads_cmp_enabled-test',
					},
				},
			},
		};

		const output = getWordadsSettings( state, siteId );
		expect( output ).toHaveProperty( 'jetpack_module_enabled', 'wordads-test' );
		expect( output ).toHaveProperty(
			'display_options.display_front_page',
			'wordads_display_front_page-test'
		);
		expect( output ).toHaveProperty( 'display_options.display_post', 'wordads_display_post-test' );
		expect( output ).toHaveProperty( 'display_options.display_page', 'wordads_display_page-test' );
		expect( output ).toHaveProperty(
			'display_options.display_archive',
			'wordads_display_archive-test'
		);
		expect( output ).toHaveProperty( 'display_options.enable_header_ad', 'enable_header_ad-test' );
		expect( output ).toHaveProperty(
			'display_options.second_belowpost',
			'wordads_second_belowpost-test'
		);
		expect( output ).toHaveProperty(
			'display_options.inline_enabled',
			'wordads_inline_enabled-test'
		);
		expect( output ).toHaveProperty( 'ccpa_enabled', 'wordads_ccpa_enabled-test' );
		expect( output ).toHaveProperty(
			'ccpa_privacy_policy_url',
			'wordads_ccpa_privacy_policy_url-test'
		);
		expect( output ).toHaveProperty(
			'custom_adstxt_enabled',
			'wordads_custom_adstxt_enabled-test'
		);
		expect( output ).toHaveProperty( 'custom_adstxt', 'wordads_custom_adstxt-test' );
		expect( output ).toHaveProperty( 'cmp_enabled', 'wordads_cmp_enabled-test' );
	} );
} );
