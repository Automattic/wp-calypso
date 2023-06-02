import '@testing-library/jest-dom';

// Test config data object
window.configData = {
	admin_page_base: '/wp-admin/tools.php?page=advertising',
	api_root: 'https://example.com/wp-json/',
	blog_id: 217844962,
	enable_all_sections: false,
	env_id: 'production',
	google_analytics_key: 'TEST_KEY',
	hostname: 'example.com',
	i18n_default_locale_slug: 'en',
	mc_analytics_enabled: false,
	meta: [],
	nonce: '7289741bb7',
	site_name: 'Example',
	sections: [],
	features: {
		'promote-post/redesign-i2': true,
	},
	intial_state: {
		currentUser: {
			id: 1000,
			user: { ID: 1000, username: 'no-user', localeSlug: 'en-us' },
			capabilities: {
				217844962: {
					administrator: true,
				},
			},
		},
		sites: {
			items: {
				217844962: {
					ID: 217844962,
					URL: 'https://example.com',
					jetpack: true,
					visible: true,
					capabilities: {},
					products: [],
					plan: {},
					options: {
						wordads: false,
						admin_url: 'https://example.com/wp-admin/',
						gmt_offset: 0,
					},
				},
			},
			features: {
				217844962: {
					data: {
						active: [],
						available: {},
					},
				},
			},
		},
	},
	advertising_dashboard_path_prefix: '/advertising',
	dsp_stripe_pub_key: 'test_stripe_key',
	dsp_widget_js_src: 'https://example.com/promote-v2/widget.js',
};
