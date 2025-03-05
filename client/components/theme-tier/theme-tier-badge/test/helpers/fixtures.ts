import {
	FEATURE_FREE_THEMES,
	FEATURE_UPLOAD_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
} from '@automattic/calypso-products';

const themeTiers = {
	free: {
		slug: 'free',
		feature: FEATURE_FREE_THEMES,
	},
	personal: {
		slug: 'personal',
		feature: WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	},
	community: {
		slug: 'community',
	},
	wooCommerce: {
		slug: 'woocommerce',
		platform: 'simple',
		feature: null,
		featureList: [ FEATURE_UPLOAD_THEMES ],
	},
	partner: {
		slug: 'partner',
		feature: 'upload-themes',
		platform: 'atomic',
	},
};

export const themes = {
	twentytwentyfive: {
		name: 'Twenty Twenty-Five',
		id: 'twentytwentyfive',
		version: '1.1',
		preview_url: 'https://wp-themes.com/twentytwentyfive/',
		author: {
			user_nicename: 'wordpressdotorg',
			profile: 'https://profiles.wordpress.org/wordpressdotorg/',
			avatar:
				'https://secure.gravatar.com/avatar/178f40079143ff7464125e4fbc88e62024a16442920a6a3d6dfa3d7e626be20d?s=96&d=monsterid&r=g',
			display_name: 'WordPress.org',
			author: 'the WordPress team',
			author_url: 'https://wordpress.org',
		},
		screenshot_url: '//ts.w.org/wp-content/themes/twentytwentyfive/screenshot.png?ver=1.1',
		rating: 80,
		num_ratings: 5,
		theme_tier: themeTiers.community,
	},
	twentysixteen: {
		id: 'twentysixteen',
		name: 'Twenty Sixteen',
		author: 'the WordPress team',
		screenshot:
			'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
		stylesheet: 'pub/twentysixteen',
		demo_uri: 'https://twentysixteendemo.wordpress.com/',
		author_uri: 'https://wordpress.org/',
		theme_tier: themeTiers.free,
	},
	bute: {
		menu_order: -124,
		date_added: '2023-07-03 17:32:00',
		id: 'bute',
		description: 'Bute is a blog theme that has a full-screen front page',
		stylesheet: 'pub/bute',
		name: 'Bute',
		author: 'Automattic',
		author_uri: 'https://automattic.com/',
		demo_uri: 'https://butedemo.wordpress.com/',
		version: '1.0.5',
		screenshot: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/bute/screenshot.png?ssl=1',
		theme_type: 'hosted-internal',
		download_uri: 'https://public-api.wordpress.com/rest/v1/themes/download/bute.zip',
		theme_tier: themeTiers.personal,
	},
	kiosko: {
		id: 'kiosko',
		stylesheet: 'pub/kiosko',
		name: 'Kiosko',
		author: 'Automattic',
		theme_type: 'hosted-internal',
		theme_tier: themeTiers.wooCommerce,
		taxonomies: {
			theme_software_set: [
				{
					name: 'woo-on-plans',
					slug: 'woo-on-plans',
					term_id: '755216234',
				},
			],
		},
		block_theme: true,
		style_variations: [],
		soft_launched: false,
	},
	drinkify: {
		id: 'drinkify',
		description:
			'Drinkify is a Premium eCommerce WordPress Block Theme for Crafting the Perfect Liquor Store Website.',
		stylesheet: 'drinkify',
		name: 'Drinkify',
		author: 'CatchThemes',
		author_uri: 'https://catchthemes.com/',
		demo_uri: 'https://fse.catchthemes.com/drinkify/',
		version: '1.0',
		screenshot:
			'https://i0.wp.com/theme.wordpress.com/wp-content/uploads/2024/11/cleanshot-2024-11-14-at-16.58.17402x.png?ssl=1',
		theme_type: 'managed-external',
		theme_tier: themeTiers.partner,
	},
	nion: {
		id: 'nion',
		description:
			'Nion is a theme inspired by the radiant glow of neon signage, infusing your site with the brilliance of electrified gases. Featuring bold typography and vibrant colors, it offers five stunning style variations, each capturing a unique luminous atmosphere.',
		stylesheet: 'pub/nion',
		name: 'Nion',
		author: 'Automattic',
		author_uri: 'https://automattic.com/',
		demo_uri: 'https://niondemo.wordpress.com/',
		version: '1.0.0',
		screenshot: 'https://i0.wp.com/s2.wp.com/wp-content/themes/pub/nion/screenshot.png?ssl=1',
		theme_type: 'hosted-internal',
		theme_tier: themeTiers.personal,
		soft_launched: false,
	},
};

export const PERSONAL_PLAN = {
	product_id: 1009,
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	product_type: 'bundle',
	meta: null,
	bd_slug: 'wp-bundles',
	bd_variation_slug: 'wp-personal-bundle',
	available: 'yes',
	sale_coupon: null,
	multi: 0,
	blog_id: 0,
	bundle_product_ids: [
		21, 12, 50, 5, 6, 46, 54, 56, 57, 58, 59, 60, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 76, 75,
		16,
	],
	description: '',
	bill_period: 365,
	outer_slug: null,
	extra: null,
	capability: 'manage_options',
	product_name_short: 'Personal',
	previous_product_name: 'WordPress.com Starter',
	icon: 'https://s0.wordpress.com/i/store/plan-personal.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-personal-active.png',
	path_slug: 'personal',
	bill_period_label: 'per year',
	orig_cost_integer: 14400,
	orig_cost: null,
	price: 'R$144',
	formatted_price: 'R$144',
	cost: 144,
	raw_price_integer: 14400,
	raw_price: 144,
	product_display_price: '<abbr title="Brazilian real">R$</abbr>144',
	tagline: 'Use your own domain and establish your online presence without ads.',
	currency_code: 'BRL',
	features_highlight: [
		{
			items: [ 'no-adverts/no-adverts.php', 'custom-domain', 'support' ],
		},
		{
			title: 'Included with all plans:',
			items: [ 'free-blog' ],
		},
	],
};
