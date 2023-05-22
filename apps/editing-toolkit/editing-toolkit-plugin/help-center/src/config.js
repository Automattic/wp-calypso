const isDevelopment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

window.configData = {
	env_id: isDevelopment ? 'development' : 'production',
	i18n_default_locale_slug: 'en',
	google_analytics_key: 'UA-10673494-15',
	zendesk_support_chat_key: isDevelopment
		? '715f17a8-4a28-4a7f-8447-0ef8f06c70d7'
		: 'cec07bc9-4da6-4dd2-afa7-c7e01ae73584',
	client_slug: 'browser',
	twemoji_cdn_url: 'https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/',
	site_filter: [],
	sections: {},
	enable_all_sections: false,
	livechat_support_locales: [ 'en', 'en-gb' ],
	upwork_support_locales: [
		'de',
		'de-at',
		'de-li',
		'de-lu',
		'de-ch',
		'es',
		'es-cl',
		'es-mx',
		'fr',
		'fr-ca',
		'fr-be',
		'fr-ch',
		'it',
		'it-ch',
		'ja',
		'nl',
		'nl-be',
		'nl-nl',
		'pt',
		'pt-pt',
		'pt-br',
		'sv',
		'sv-fi',
		'sv-se',
	],
	jetpack_support_blog: 'jetpackme.wordpress.com',
	wpcom_support_blog: 'en.support.wordpress.com',
	is_running_in_jetpack_site: false,
	gutenboarding_url: '/new',
	features: {
		happychat: false,
		'help/gpt-response': true,
	},
	signup_url: '/',
	discover_blog_id: 53424024,
	discover_feed_id: 41325786,
};
window.process = {
	env: {
		NODE_DEBUG: 'dev',
	},
};
