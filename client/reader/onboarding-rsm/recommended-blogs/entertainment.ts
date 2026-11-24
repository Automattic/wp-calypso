import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getEntertainmentBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 49527558,
		site_ID: 112084106,
		name: 'IndieWire',
		site_URL: 'https://www.indiewire.com/',
		feed_URL: 'https://www.indiewire.com/feed/',
		icon_URL: 'https://www.indiewire.com/wp-content/uploads/2018/04/cropped-iw_favicon.png?w=180',
		description: __(
			'Film-industry reporting, festival coverage, interviews, and stories about independent cinema.'
		),
	},
	{
		feed_ID: 9058638,
		site_ID: 6090856,
		name: 'The Film Stage',
		site_URL: 'https://thefilmstage.com/',
		feed_URL: 'https://thefilmstage.com/feed/',
		icon_URL:
			'https://jaredmobarak.com/wp-content/uploads/2024/10/tfs-icon-1080px-white-840x840-1.png?w=840',
		description: __(
			'Film news, director interviews, festival discoveries, and thoughtful cinema coverage.'
		),
	},
	{
		feed_ID: 183302448,
		site_ID: 0,
		name: 'Variety Film',
		site_URL: 'https://variety.com/v/film/',
		feed_URL: 'https://variety.com/v/film/feed/',
		icon_URL:
			'https://variety.com/wp-content/themes/pmc-variety-2020/assets/app/icons/apple-touch-icon.png',
		description: __(
			'Film-industry reporting, festival news, interviews, and developments in the movie business.'
		),
	},
	{
		feed_ID: 183302449,
		site_ID: 0,
		name: 'The Hollywood Reporter Movies',
		site_URL: 'https://www.hollywoodreporter.com/c/movies/',
		feed_URL: 'https://www.hollywoodreporter.com/c/movies/feed/',
		icon_URL:
			'https://www.hollywoodreporter.com/wp-content/uploads/2026/05/thr-site-icon.png?w=180',
		description: __(
			'Movie-industry news, filmmaker interviews, reviews, and awards-season coverage.'
		),
	},
	{
		feed_ID: 9080002,
		site_ID: 0,
		name: 'Collider',
		site_URL: 'https://collider.com/',
		feed_URL: 'https://collider.com/feed/',
		icon_URL: 'https://collider.com/public/build/images/favicon-240x240.png',
		description: __(
			'Movie and television news, interviews, reviews, and entertainment discoveries.'
		),
	},
	{
		feed_ID: 108809481,
		site_ID: 179290149,
		name: 'Deadline',
		site_URL: 'https://deadline.com/',
		feed_URL: 'https://deadline.com/feed/',
		icon_URL:
			'https://deadline.com/wp-content/themes/pmc-deadline-2019/assets/app/icons/apple-touch-icon.png',
		description: __(
			'Film and entertainment-industry reporting covering studios, talent, festivals, and major releases.'
		),
	},
	{
		feed_ID: 84452094,
		site_ID: 148354167,
		name: 'Rolling Stone',
		site_URL: 'https://www.rollingstone.com/',
		feed_URL: 'https://www.rollingstone.com/feed/',
		icon_URL:
			'https://www.rollingstone.com/wp-content/uploads/2024/12/R-Avatar_512x512_flat.png?w=180',
		description: __( 'Music news, artist interviews, reviews, and reporting on culture.' ),
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
		feed_ID: 109102884,
		site_ID: 179288735,
		name: 'TVLine',
		site_URL: 'https://tvline.com/',
		feed_URL: 'https://tvline.com/feed/',
		icon_URL: 'https://www.tvline.com/img/tvline-favicon-448x448.png',
		description: __( 'Television news, interviews, recaps, and reviews.' ),
	},
	{
		feed_ID: 9001653,
		site_ID: 0,
		name: 'Vulture',
		site_URL: 'https://www.vulture.com/',
		feed_URL: 'https://feeds.feedburner.com/nymag/vulture',
		icon_URL: 'https://assets.vulture.com/media/sites/vulture/icon.180x180.png',
		description: __(
			'Entertainment reporting, criticism, and conversations about popular culture.'
		),
	},
	{
		feed_ID: 178862680,
		site_ID: 0,
		name: 'Polygon',
		site_URL: 'https://www.polygon.com/',
		feed_URL: 'https://www.polygon.com/feed/',
		icon_URL: 'https://www.polygon.com/public/build/images/favicon-240x240.png',
		description: __( 'Games, entertainment, and stories from fan culture.' ),
	},
];
