import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getMusicBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 124013467,
		site_ID: 0,
		name: 'Pitchfork',
		site_URL: 'https://pitchfork.com/',
		feed_URL: 'https://pitchfork.com/feed/feed-news/rss',
		icon_URL: 'https://pitchfork.com/verso/static/pitchfork-us/assets/favicon.ico',
		description: __(
			'Music news, artist interviews, and reporting on the records shaping contemporary music.'
		),
	},
	{
		feed_ID: 183302432,
		site_ID: 0,
		name: 'Rolling Stone',
		site_URL: 'https://www.rollingstone.com/',
		feed_URL: 'https://www.rollingstone.com/music/feed/',
		icon_URL:
			'https://www.rollingstone.com/wp-content/uploads/2024/12/R-Avatar_512x512_flat.png?w=180',
		description: __( 'Music news, artist stories, interviews, and coverage across genres.' ),
	},
	{
		feed_ID: 27504,
		site_ID: 0,
		name: 'Stereogum',
		site_URL: 'https://www.stereogum.com/',
		feed_URL: 'https://www.stereogum.com/feed/',
		icon_URL:
			'https://lede-admin.stereogum.com/wp-content/uploads/sites/64/2022/02/stereogum-site-icon-192x192-1644917357.png',
		description: __(
			'Independent music news, new-song discoveries, and conversations about records and artists.'
		),
	},
	{
		feed_ID: 94283873,
		site_ID: 158375765,
		name: 'Consequence',
		site_URL: 'https://consequence.net/',
		feed_URL: 'https://consequence.net/feed/',
		icon_URL: 'https://consequence.net/wp-content/themes/cosv2/images/apple-touch-icon.png',
		description: __(
			'Music reporting, album news, live performances, and stories from across popular culture.'
		),
	},
	{
		feed_ID: 56100950,
		site_ID: 0,
		name: 'NME',
		site_URL: 'https://www.nme.com/',
		feed_URL: 'https://www.nme.com/feed',
		icon_URL: 'https://www.nme.com/apple-touch-icon.png',
		description: __(
			'Music news, new releases, artist interviews, and coverage of the wider music scene.'
		),
	},
	{
		feed_ID: 6256460,
		site_ID: 0,
		name: 'The Quietus',
		site_URL: 'https://thequietus.com/',
		feed_URL: 'https://thequietus.com/feed/',
		icon_URL: 'https://thequietus.com/app/themes/thequietus-v1/assets/images/apple-touch-icon.png',
		description: __(
			'Independent music criticism, artist interviews, and discoveries beyond the mainstream.'
		),
	},
	{
		feed_ID: 172685222,
		site_ID: 0,
		name: 'Aquarium Drunkard',
		site_URL: 'https://aquariumdrunkard.com/',
		feed_URL: 'https://aquariumdrunkard.com/feed/',
		icon_URL:
			'https://aquariumdrunkard.com/_newness/wp-content/themes/aquarium-drunkard/inc/favicons//apple-icon-180x180.png',
		description: __(
			'Deep music discoveries connecting psych, jazz, folk, dub, and sounds from around the world.'
		),
	},
	{
		feed_ID: 183030734,
		site_ID: 0,
		name: 'Saving Country Music',
		site_URL: 'https://savingcountrymusic.com/',
		feed_URL: 'https://savingcountrymusic.com/feed/',
		icon_URL: 'https://savingcountrymusic.com/wp-content/uploads/2016/09/cropped-logo-180x180.png',
		description: __(
			'Country-music reporting, album reviews, and commentary on artists and the industry.'
		),
	},
	{
		feed_ID: 47689933,
		site_ID: 0,
		name: 'Treble',
		site_URL: 'https://www.treblezine.com/',
		feed_URL: 'https://www.treblezine.com/feed/',
		icon_URL:
			'https://www.treblezine.com/wp-content/uploads/2020/09/cropped-treble_open2-180x180.png',
		description: __(
			'Independent album reviews, artist interviews, and discoveries spanning underground music.'
		),
	},
	{
		feed_ID: 183303376,
		site_ID: 0,
		name: 'PopMatters',
		site_URL: 'https://www.popmatters.com/',
		feed_URL: 'https://www.popmatters.com/feed',
		icon_URL:
			'https://www.popmatters.com/wp-content/uploads/2022/02/cropped-1418A899-16C5-4A17-9A59-9EDBD6F05C61-180x180.jpeg',
		description: __(
			'Independent music reviews, interviews, and essays connecting popular culture with bigger ideas.'
		),
	},
	{
		feed_ID: 183303446,
		site_ID: 0,
		name: 'MusicTech',
		site_URL: 'https://musictech.com/',
		feed_URL: 'https://musictech.com/feed/',
		icon_URL: 'https://musictech.com/apple-touch-icon.png',
		description: __(
			'Music production news, recording techniques, gear reviews, and conversations with artists and producers.'
		),
	},
	{
		feed_ID: 180535161,
		site_ID: 0,
		name: 'Dork',
		site_URL: 'https://readdork.com/',
		feed_URL: 'https://readdork.com/feed/',
		icon_URL: 'https://readdork.com/apple-touch-icon.png',
		description: __(
			'Music news, artist interviews, album reviews, and discoveries from emerging scenes.'
		),
	},
];
