import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getMostSubscribedBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 107535240,
		site_ID: 179338616,
		name: 'Variety',
		site_URL: 'https://variety.com/',
		feed_URL: 'https://variety.com/feed/',
		icon_URL:
			'https://variety.com/wp-content/themes/pmc-variety-2020/assets/app/icons/apple-touch-icon.png',
		description: __( 'Entertainment reporting, film reviews, and stories from behind the scenes.' ),
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
		feed_ID: 116988393,
		site_ID: 186757698,
		name: 'The Atavist Magazine',
		site_URL: 'https://magazine.atavist.com/',
		feed_URL: 'https://magazine.atavist.com/feed/',
		icon_URL:
			'https://magazine.atavist.com/wp-content/uploads/2021/03/cropped-atavist_Logo_A-2-180x180.png',
		description: __( 'A deeply reported true story each month, told with a literary eye.' ),
	},
	{
		feed_ID: 138734090,
		site_ID: 211646052,
		name: 'Longreads',
		site_URL: 'https://longreads.com/',
		feed_URL: 'https://longreads.com/feed/',
		icon_URL:
			'https://i0.wp.com/longreads.com/wp-content/uploads/2017/01/longreads-logo-sm-rgb.png?fit=180%2C180&ssl=1',
		description: __( 'Long essays, reported stories, and reading lists from around the web.' ),
	},
	{
		feed_ID: 101852522,
		site_ID: 0,
		name: 'TIME',
		site_URL: 'https://time.com/',
		feed_URL: 'https://time.com/feed/',
		icon_URL: 'https://time.com/favicon/apple-touch-icon.png',
		description: __( 'Reporting on the people, ideas, and events shaping the world.' ),
	},
	{
		feed_ID: 6438763,
		site_ID: 0,
		name: 'Kottke.org',
		site_URL: 'https://kottke.org/',
		feed_URL: 'https://feeds.kottke.org/main',
		icon_URL: 'https://kottke.org/images/2024/icons/180x180.png',
		description: __( 'Interesting ideas, art, science, and discoveries from across the web.' ),
	},
	{
		feed_ID: 20787116,
		site_ID: 0,
		name: 'Daring Fireball',
		site_URL: 'https://daringfireball.net/',
		feed_URL: 'https://daringfireball.net/feeds/main',
		icon_URL: 'https://daringfireball.net/graphics/apple-touch-icon.png',
		description: __( 'Independent commentary on Apple, software, and the technology industry.' ),
	},
	{
		feed_ID: 103058920,
		site_ID: 172052577,
		name: 'Smitten Kitchen',
		site_URL: 'https://smittenkitchen.com/',
		feed_URL: 'https://smittenkitchen.com/feed/',
		icon_URL:
			'https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2017/09/cropped-smitten-kitchen-logo_no_text.jpg?fit=180%2C180&quality=89&ssl=1',
		description: __(
			'Approachable home cooking, reliable recipes, and notes from a small kitchen.'
		),
	},
	{
		feed_ID: 7396759,
		site_ID: 0,
		name: 'Ars Technica',
		site_URL: 'https://arstechnica.com/',
		feed_URL: 'https://feeds.arstechnica.com/arstechnica/index',
		icon_URL:
			'https://cdn.arstechnica.net/wp-content/uploads/2016/10/cropped-ars-logo-512_480-300x300.png',
		description: __( 'Technology, science, and computing explained with depth and curiosity.' ),
	},
	{
		feed_ID: 7035081,
		site_ID: 0,
		name: 'Colossal',
		site_URL: 'https://www.thisiscolossal.com/',
		feed_URL: 'https://www.thisiscolossal.com/feed/',
		icon_URL: 'https://www.thisiscolossal.com/wp-content/uploads/2024/08/icon-crow.png',
		description: __( 'Contemporary art, inventive craft, photography, and visual discoveries.' ),
	},
	{
		feed_ID: 47166615,
		site_ID: 0,
		name: 'Design Milk',
		site_URL: 'https://design-milk.com/',
		feed_URL: 'https://design-milk.com/feed/',
		icon_URL: 'https://design-milk.com/img/favicon/dm-favicon-180-180.png',
		description: __( 'Modern interiors, architecture, objects, and the people designing them.' ),
	},
	{
		feed_ID: 9166444,
		site_ID: 87954168,
		name: 'Boing Boing',
		site_URL: 'https://boingboing.net/',
		feed_URL: 'https://boingboing.net/feed',
		icon_URL: 'https://boingboing.net/wp-content/uploads/fbrfg/apple-touch-icon.png',
		description: __( 'Offbeat discoveries, technology, culture, and curious corners of the web.' ),
	},
];
