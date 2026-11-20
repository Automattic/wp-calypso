import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getDesignBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 11213754,
		site_ID: 0,
		name: 'Dezeen',
		site_URL: 'https://www.dezeen.com/',
		feed_URL: 'https://www.dezeen.com/feed/',
		icon_URL:
			'https://www.dezeen.com/app/mu-plugins/dezeen-2026/assets/favicons/apple-touch-icon.png',
		description: __(
			'Architecture, interiors, and design projects from studios around the world.'
		),
	},
	{
		feed_ID: 47166615,
		site_ID: 0,
		name: 'Design Milk',
		site_URL: 'https://design-milk.com/',
		feed_URL: 'https://design-milk.com/feed/',
		icon_URL: 'https://design-milk.com/img/favicon/dm-favicon-180-180.png',
		description: __(
			'Contemporary design, interiors, architecture, and objects for everyday living.'
		),
	},
	{
		feed_ID: 9782277,
		site_ID: 0,
		name: 'Core77',
		site_URL: 'https://www.core77.com/',
		feed_URL: 'https://feeds.feedburner.com/core77/blog',
		icon_URL: 'https://static.core77.com/images/touch_icons/core77_icon_60px.png',
		description: __(
			'Industrial design, product ideas, and the creative process behind useful objects.'
		),
	},
	{
		feed_ID: 37348272,
		site_ID: 0,
		name: 'Creative Boom',
		site_URL: 'https://www.creativeboom.com/',
		feed_URL: 'https://www.creativeboom.com/feed/',
		icon_URL: 'https://www.creativeboom.com/img/apple-touch-icon.png',
		description: __( 'Creative careers, design inspiration, and the people making visual work.' ),
	},
	{
		feed_ID: 4410914,
		site_ID: 0,
		name: 'It’s Nice That',
		site_URL: 'https://www.itsnicethat.com/',
		feed_URL: 'https://feeds2.feedburner.com/itsnicethat/SlXC',
		icon_URL: 'https://www.itsnicethat.com/apple-touch-icon.png',
		description: __( 'Fresh projects in graphic design, illustration, art, and visual culture.' ),
	},
	{
		feed_ID: 16422301,
		site_ID: 11291049,
		name: 'Swissmiss',
		site_URL: 'https://www.swiss-miss.com/',
		feed_URL: 'https://www.swiss-miss.com/feed',
		icon_URL: 'https://www.swiss-miss.com/wp-content/themes/swissmiss/images/apple-touch-icon.png',
		description: __(
			'Design discoveries, inspiring objects, and observations from a creative community.'
		),
	},
	{
		feed_ID: 38383210,
		site_ID: 0,
		name: 'Creative Review',
		site_URL: 'https://www.creativereview.co.uk/',
		feed_URL: 'https://www.creativereview.co.uk/feed/',
		icon_URL:
			'https://creativereview.imgix.net/uploads/2016/05/cropped-crlogo-master-icon.png?auto=compress,format&crop=faces,entropy,edges&fit=crop&q=60&w=180&h=180',
		description: __(
			'Creative-industry analysis, advertising, branding, and visual communication.'
		),
	},
	{
		feed_ID: 182226338,
		site_ID: 218830623,
		name: 'Dieline',
		site_URL: 'https://thedieline.com/',
		feed_URL: 'https://thedieline.com/feed/',
		icon_URL:
			'https://i0.wp.com/thedieline.com/wp-content/uploads/2024/04/dieline-favicon.png?fit=180%2C180&quality=65&ssl=1',
		description: __( 'Packaging design, branding, and the ideas behind memorable products.' ),
	},
	{
		feed_ID: 7035081,
		site_ID: 0,
		name: 'Colossal',
		site_URL: 'https://www.thisiscolossal.com/',
		feed_URL: 'https://www.thisiscolossal.com/feed/',
		icon_URL: 'https://www.thisiscolossal.com/wp-content/uploads/2024/08/icon-crow.png',
		description: __(
			'Creative projects and visual discoveries across art, craft, photography, and design.'
		),
	},
	{
		feed_ID: 183302429,
		site_ID: 0,
		name: 'Wallpaper',
		site_URL: 'https://www.wallpaper.com/',
		feed_URL: 'https://www.wallpaper.com/feeds/all',
		icon_URL: 'https://cdn.mos.cms.futurecdn.net/flexiimages/fpqjm7sfgp1656622778.png',
		description: __(
			'Architecture, interiors, product design, and contemporary creative culture.'
		),
	},
	{
		feed_ID: 75886964,
		site_ID: 0,
		name: 'Smashing Magazine',
		site_URL: 'https://www.smashingmagazine.com/',
		feed_URL: 'https://www.smashingmagazine.com/feed/',
		icon_URL: 'https://www.smashingmagazine.com/images/favicon/apple-touch-icon.png',
		description: __(
			'Practical design and front-end development guides covering UX, CSS, and accessibility.'
		),
	},
	{
		feed_ID: 34641858,
		site_ID: 0,
		name: 'Design You Trust',
		site_URL: 'https://designyoutrust.com/',
		feed_URL: 'https://designyoutrust.com/feed/',
		icon_URL: 'https://designyoutrust.com/wp-content/uploads/2024/04/cropped-favicon-180x180.png',
		description: __(
			'Visual discoveries spanning graphic design, illustration, photography, and unusual creative work.'
		),
	},
];
