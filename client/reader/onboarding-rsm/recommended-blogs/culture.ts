import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getCultureBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 26058,
		site_ID: 3521287,
		name: 'The Marginalian',
		site_URL: 'https://www.themarginalian.org/',
		feed_URL: 'https://www.themarginalian.org/feed/',
		icon_URL:
			'https://i0.wp.com/www.themarginalian.org/wp-content/uploads/2021/10/cropped-tm_site_icon-1.png?fit=180%2C180&ssl=1',
		description: __(
			'Essays connecting literature, art, science, philosophy, and the search for a meaningful life.'
		),
	},
	{
		feed_ID: 6438763,
		site_ID: 0,
		name: 'Kottke.org',
		site_URL: 'https://kottke.org/',
		feed_URL: 'https://feeds.kottke.org/main',
		icon_URL: 'https://kottke.org/images/2024/icons/180x180.png',
		description: __(
			'Curious discoveries across art, media, design, science, and internet culture.'
		),
	},
	{
		feed_ID: 138734090,
		site_ID: 211646052,
		name: 'Longreads',
		site_URL: 'https://longreads.com/',
		feed_URL: 'https://longreads.com/feed/',
		icon_URL:
			'https://i0.wp.com/longreads.com/wp-content/uploads/2017/01/longreads-logo-sm-rgb.png?fit=180%2C180&ssl=1',
		description: __(
			'Long-form stories, personal essays, and thoughtfully selected writing from across the web.'
		),
	},
	{
		feed_ID: 52021503,
		site_ID: 0,
		name: 'Aeon',
		site_URL: 'https://aeon.co/',
		feed_URL: 'https://aeon.co/feed.rss',
		icon_URL: 'https://aeon.co/favicon.ico?favicon.1hwawo4wxq5ma.ico',
		description: __(
			'Essays and films exploring philosophy, psychology, society, and the human experience.'
		),
	},
	{
		feed_ID: 52143309,
		site_ID: 0,
		name: 'JSTOR Daily',
		site_URL: 'https://daily.jstor.org/',
		feed_URL: 'https://daily.jstor.org/feed/',
		icon_URL:
			'https://daily.jstor.org/wp-content/uploads/2016/05/JSTOR_Daily_logo_square-copy-300x300.jpg',
		description: __(
			'Stories connecting scholarly research with history, culture, and current questions.'
		),
	},
	{
		feed_ID: 43737205,
		site_ID: 80495929,
		name: 'Literary Hub',
		site_URL: 'https://lithub.com/',
		feed_URL: 'https://lithub.com/feed/',
		icon_URL: 'https://s26162.pcdn.co/wp-content/uploads/2015/04/favicon.ico',
		description: __( 'Books, writers, criticism, and conversations from the literary world.' ),
	},
	{
		feed_ID: 16751056,
		site_ID: 0,
		name: 'Open Culture',
		site_URL: 'https://www.openculture.com/',
		feed_URL: 'https://www.openculture.com/feed',
		icon_URL:
			'https://www.openculture.com/wp-content/themes/openculture_v4a/images/apple_icon_new.png',
		description: __(
			'Cultural discoveries, educational resources, and stories about ideas and the arts.'
		),
	},
	{
		feed_ID: 103309695,
		site_ID: 0,
		name: 'Public Domain Review',
		site_URL: 'https://publicdomainreview.org/',
		feed_URL: 'https://publicdomainreview.org/rss.xml',
		icon_URL: 'https://publicdomainreview.org/apple-icon-180x180.png',
		description: __(
			'Explorations of historical art, literature, and curious works from the public domain.'
		),
	},
	{
		feed_ID: 33925087,
		site_ID: 0,
		name: 'Smithsonian Magazine',
		site_URL: 'https://www.smithsonianmag.com/',
		feed_URL: 'https://www.smithsonianmag.com/rss/latest_articles/',
		icon_URL:
			'https://www.smithsonianmag.com/static/smithsonianmag/img/smithmag-favicon-logo.cb31c6e193dd.png',
		description: __( 'Stories about history, art, science, and the cultures shaping our world.' ),
	},
	{
		feed_ID: 50426619,
		site_ID: 0,
		name: 'Atlas Obscura',
		site_URL: 'https://www.atlasobscura.com/',
		feed_URL: 'https://www.atlasobscura.com/feeds/latest',
		icon_URL:
			'https://img.atlasobscura.com/j-xg8FDByF8DTcfMgVpd9SN8tqSa3aZa3T6gk1vSwgo/sm:1/scp:1/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2F0bGFzLWRldi9t/aXNjL2ljb25zL2Fw/cGxlLXRvdWNoLWlj/b24ucG5n',
		description: __(
			'Unusual places, cultural traditions, and surprising stories from around the world.'
		),
	},
	{
		feed_ID: 55747131,
		site_ID: 0,
		name: 'Hyperallergic',
		site_URL: 'https://hyperallergic.com/',
		feed_URL: 'https://hyperallergic.com/feed/',
		icon_URL:
			'https://storage.ghost.io/c/51/f8/51f871d8-b6be-4a73-b958-0ca4fff0110a/content/images/size/w256h256/2025/11/Hyperallergic---favicon---360x360.png',
		description: __(
			'Art reporting and criticism connecting visual culture with politics and society.'
		),
	},
	{
		feed_ID: 7035360,
		site_ID: 0,
		name: 'The Paris Review',
		site_URL: 'https://www.theparisreview.org/blog/',
		feed_URL: 'https://www.theparisreview.org/blog/feed/',
		icon_URL:
			'https://www.theparisreview.org/blog/wp-content/uploads/2017/07/cropped-hadada-1-180x180.png',
		description: __(
			'Literary essays, interviews, and conversations about books, writing, and the arts.'
		),
	},
];
