import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getEnvironmentBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 68582058,
		site_ID: 0,
		name: 'Mongabay',
		site_URL: 'https://news.mongabay.com/',
		feed_URL: 'https://news.mongabay.com/feed/',
		icon_URL: 'https://news.mongabay.com/wp-content/themes/mongabay_v2/img/icons/ico-s2.jpg',
		description: __(
			'Conservation reporting about wildlife, forests, oceans, and communities around the world.'
		),
	},
	{
		feed_ID: 95561016,
		site_ID: 0,
		name: 'Yale Environment 360',
		site_URL: 'https://e360.yale.edu/',
		feed_URL: 'https://e360.yale.edu/feed.xml',
		icon_URL: 'https://e360.yale.edu/assets/img/favicons/apple-touch-icon-180x180.png',
		description: __(
			'Environmental reporting, analysis, and ideas from journalists and researchers.'
		),
	},
	{
		feed_ID: 107813600,
		site_ID: 0,
		name: 'Yale Climate Connections',
		site_URL: 'https://yaleclimateconnections.org/',
		feed_URL: 'https://yaleclimateconnections.org/feed/',
		icon_URL:
			'https://i0.wp.com/yaleclimateconnections.org/wp-content/uploads/2020/10/ycc-favicon.png?fit=100%2C100&ssl=1',
		description: __(
			'Climate reporting explaining impacts, solutions, and the connections with daily life.'
		),
	},
	{
		feed_ID: 154160739,
		site_ID: 228474941,
		name: 'Inside Climate News',
		site_URL: 'https://insideclimatenews.org/',
		feed_URL: 'https://insideclimatenews.org/feed/',
		icon_URL:
			'https://insideclimatenews.org/wp-content/uploads/2020/09/cropped-favicon-180x180.png',
		description: __(
			'Independent environmental reporting on climate, energy, ecosystems, and affected communities.'
		),
	},
	{
		feed_ID: 183302402,
		site_ID: 0,
		name: 'The Revelator',
		site_URL: 'https://therevelator.org/',
		feed_URL: 'https://therevelator.org/feed/',
		icon_URL: 'https://therevelator.org/wp-content/uploads/2017/03/cropped-r-ico-180x180.png',
		description: __(
			'Conservation journalism about endangered species, wild places, and environmental solutions.'
		),
	},
	{
		feed_ID: 183302403,
		site_ID: 0,
		name: 'BirdLife International',
		site_URL: 'https://www.birdlife.org/',
		feed_URL: 'https://www.birdlife.org/feed/',
		icon_URL:
			'https://www.birdlife.org/wp-content/themes/birdlife/dist/apple-touch-icon.png?v=E6wgnJvg3e',
		description: __(
			'Bird conservation stories and research from a worldwide network of conservation groups.'
		),
	},
	{
		feed_ID: 108001257,
		site_ID: 158772030,
		name: 'Grist',
		site_URL: 'https://grist.org/',
		feed_URL: 'https://grist.org/feed/',
		icon_URL: 'https://grist.org/wp-content/themes/grist/static/img/favicon/apple-icon-180x180.png',
		description: __(
			'Reporting on climate change, environmental justice, and practical solutions.'
		),
	},
	{
		feed_ID: 40967167,
		site_ID: 0,
		name: 'Carbon Brief',
		site_URL: 'https://www.carbonbrief.org/',
		feed_URL: 'https://www.carbonbrief.org/feed/',
		icon_URL:
			'https://www.carbonbrief.org/wp-content/uploads/2026/03/cropped-Carbon-Brief-Favicon-512px-180x180.png',
		description: __( 'Data-driven explanations of climate science, energy, and policy.' ),
	},
	{
		feed_ID: 106736518,
		site_ID: 0,
		name: 'Earth.Org',
		site_URL: 'https://earth.org/',
		feed_URL: 'https://earth.org/feed/',
		icon_URL: 'https://earth.org/wp-content/themes/hivelife-wp/favicon.ico',
		description: __( 'Environmental journalism on biodiversity, climate, and sustainable living.' ),
	},
	{
		feed_ID: 53150581,
		site_ID: 0,
		name: 'Climate Home News',
		site_URL: 'https://www.climatechangenews.com/',
		feed_URL: 'https://www.climatechangenews.com/feed/',
		icon_URL:
			'https://www.climatechangenews.com/wp-content/files/2025/02/cropped-site-icon-480x480.png',
		description: __(
			'Reporting on climate policy, international negotiations, and energy transitions.'
		),
	},
	{
		feed_ID: 138035029,
		site_ID: 0,
		name: 'DeSmog',
		site_URL: 'https://www.desmog.com/',
		feed_URL: 'https://www.desmog.com/feed/',
		icon_URL:
			'https://www.desmog.com/wp-content/uploads/2026/07/cropped-desmog-favicon-180x180.png',
		description: __(
			'Climate watchdog reporting on misinformation, fossil fuels, and environmental lobbying.'
		),
	},
	{
		feed_ID: 76889700,
		site_ID: 0,
		name: 'Unearthed',
		site_URL: 'https://unearthed.greenpeace.org/',
		feed_URL: 'https://unearthed.greenpeace.org/feed/',
		icon_URL:
			'https://unearthed.greenpeace.org/wp-content/uploads/2017/07/cropped-site-icon-300x300.png',
		description: __( 'Environmental investigations from Greenpeace UK’s journalism project.' ),
	},
];
