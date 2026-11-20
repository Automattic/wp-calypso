import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getSpaceBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 45847571,
		site_ID: 0,
		name: 'Universe Today',
		site_URL: 'https://www.universetoday.com/',
		feed_URL: 'https://www.universetoday.com/feed',
		icon_URL: 'https://www.universetoday.com/apple-touch-icon.png',
		description: __(
			'Astronomy and spaceflight news explaining discoveries, missions, and the wider universe.'
		),
	},
	{
		feed_ID: 88386315,
		site_ID: 122153163,
		name: 'SpaceQ',
		site_URL: 'https://spaceq.ca/',
		feed_URL: 'https://spaceq.ca/feed',
		icon_URL:
			'https://i0.wp.com/spaceq.ca/wp-content/uploads/2017/11/cropped-SpaceQ_image_400x400.png?fit=180%2C180&ssl=1',
		description: __(
			'Canadian and international space-industry reporting, market intelligence, and interviews.'
		),
	},
	{
		feed_ID: 109455857,
		site_ID: 0,
		name: 'The Planetary Society Articles',
		site_URL: 'https://www.planetary.org/',
		feed_URL: 'https://www.planetary.org/rss/articles',
		icon_URL: 'https://www.planetary.org/img/site/apple-touch-icon-180x180.png',
		description: __(
			'Space exploration stories, mission updates, and explanations from a nonprofit space community.'
		),
	},
	{
		feed_ID: 46452720,
		site_ID: 80681979,
		name: 'SpaceNews',
		site_URL: 'https://spacenews.com/',
		feed_URL: 'https://spacenews.com/feed/',
		icon_URL:
			'https://i0.wp.com/spacenews.com/wp-content/uploads/2024/05/cropped-SN_forza_star.png?fit=180%2C180&ssl=1',
		description: __(
			'Reporting on the business, policy, and technology of the global space industry.'
		),
	},
	{
		feed_ID: 55764368,
		site_ID: 0,
		name: 'Spaceflight Now',
		site_URL: 'https://spaceflightnow.com/',
		feed_URL: 'https://spaceflightnow.com/feed/',
		icon_URL: 'https://spaceflightnow.com/new/assets/images/icons/live/icon-180.png?v=1793717812',
		description: __(
			'Launch coverage, mission reports, and updates about human and robotic spaceflight.'
		),
	},
	{
		feed_ID: 157803248,
		site_ID: 0,
		name: 'NASA',
		site_URL: 'https://www.nasa.gov/',
		feed_URL: 'https://www.nasa.gov/feed/',
		icon_URL:
			'https://www.nasa.gov/wp-content/plugins/nasa-hds-core-setup/assets/favicons/apple-touch-icon-180x180.png',
		description: __(
			'Mission news, scientific discoveries, and updates directly from the United States space agency.'
		),
	},
	{
		feed_ID: 142417426,
		site_ID: 0,
		name: 'Astronomy Magazine',
		site_URL: 'https://www.astronomy.com/',
		feed_URL: 'https://www.astronomy.com/feed/',
		icon_URL:
			'https://www.astronomy.com/wp-content/uploads/2026/11/astronomy-site-icon-2026.png?w=180',
		description: __(
			'Astronomy discoveries, observing advice, and explanations of the night sky.'
		),
	},
	{
		feed_ID: 122498645,
		site_ID: 0,
		name: 'Space.com',
		site_URL: 'https://www.space.com/',
		feed_URL: 'https://www.space.com/feeds/all',
		icon_URL: 'https://vanilla.futurecdn.net/space/1823334/apple-touch-icon.png',
		description: __(
			'Space discoveries, astronomy news, and reporting on missions and exploration.'
		),
	},
	{
		feed_ID: 9157530,
		site_ID: 0,
		name: 'EarthSky',
		site_URL: 'https://earthsky.org/',
		feed_URL: 'https://earthsky.org/feed/',
		icon_URL:
			'https://earthsky.org/wp-content/themes/earthsky-testing-6c8e0a978c578089f4b8b6-2/images/webclip.png?v=1620812547627',
		description: __(
			'Accessible astronomy stories, skywatching guides, and discoveries about Earth and space.'
		),
	},
	{
		feed_ID: 87181568,
		site_ID: 0,
		name: 'NASASpaceflight',
		site_URL: 'https://www.nasaspaceflight.com/',
		feed_URL: 'https://www.nasaspaceflight.com/feed/',
		icon_URL: 'https://www.nasaspaceflight.com/apple-touch-icon.png',
		description: __(
			'Detailed spaceflight reporting about launch vehicles, spacecraft, and mission development.'
		),
	},
	{
		feed_ID: 108900431,
		site_ID: 0,
		name: 'SpaceWatch.Global',
		site_URL: 'https://spacewatch.global/',
		feed_URL: 'https://spacewatch.global/feed/',
		icon_URL: 'https://spacewatch.global/wp-content/uploads/fbrfg/apple-touch-icon.png',
		description: __(
			'Space industry reporting and analysis of exploration, policy, security, and international programs.'
		),
	},
	{
		feed_ID: 137971902,
		site_ID: 6330659,
		name: 'New Space Economy',
		site_URL: 'https://newspaceeconomy.ca/',
		feed_URL: 'https://newspaceeconomy.ca/feed/',
		icon_URL:
			'https://i0.wp.com/newspaceeconomy.ca/wp-content/uploads/2022/02/image-2.jpg?fit=180%2C180&ssl=1',
		description: __(
			'Reporting and explanations about space businesses, technology, policy, and industry trends.'
		),
	},
];
