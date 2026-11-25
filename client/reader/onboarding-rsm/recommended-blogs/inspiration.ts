import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getInspirationBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 1595574,
		site_ID: 0,
		name: 'Zen Habits',
		site_URL: 'https://zenhabits.net/',
		feed_URL: 'https://feeds.feedburner.com/zenhabits',
		icon_URL: 'https://zenhabits.net/favicon.ico',
		description: __( 'Reflections on mindfulness, simplicity, and making room for what matters.' ),
	},
	{
		feed_ID: 23418521,
		site_ID: 0,
		name: 'Gretchen Rubin',
		site_URL: 'https://gretchenrubin.com/',
		feed_URL: 'https://gretchenrubin.com/feed/',
		icon_URL: 'https://gretchenrubin.com/wp-content/uploads/2022/07/FavIcon-512x512-1-300x300.png',
		description: __(
			'Ideas and experiments for building habits and finding more happiness in everyday life.'
		),
	},
	{
		feed_ID: 160935879,
		site_ID: 13576767,
		name: 'Be More with Less',
		site_URL: 'https://bemorewithless.com/',
		feed_URL: 'https://bemorewithless.com/feed/',
		icon_URL: 'https://bemorewithless.com/apple-touch-icon-180x180.png',
		description: __(
			'Encouragement for simplifying, slowing down, and making space for a meaningful life.'
		),
	},
	{
		feed_ID: 102473857,
		site_ID: 170952705,
		name: 'Marc and Angel Hack Life',
		site_URL: 'https://www.marcandangel.com/',
		feed_URL: 'https://www.marcandangel.com/feed/',
		icon_URL: 'https://www.marcandangel.com/wp-content/themes/marc-and-angel/images/favicon.ico',
		description: __(
			'Practical reflections on resilience, personal growth, and everyday happiness.'
		),
	},
	{
		feed_ID: 15455760,
		site_ID: 40846436,
		name: 'The Minimalists',
		site_URL: 'https://www.theminimalists.com/',
		feed_URL: 'https://www.theminimalists.com/feed/',
		icon_URL:
			'https://www.theminimalists.com/wp-content/uploads/2020/01/cropped-the-minimalists-favicon-180x180.png',
		description: __(
			'Essays and conversations about living intentionally with fewer distractions.'
		),
	},
	{
		feed_ID: 101431482,
		site_ID: 0,
		name: 'Greater Good',
		site_URL: 'https://greatergood.berkeley.edu/',
		feed_URL: 'https://greatergood.berkeley.edu/site/rss',
		icon_URL: 'https://greatergood.berkeley.edu/apple-touch-icon.png?v=2',
		description: __(
			'Science-informed stories about kindness, connection, resilience, and a meaningful life.'
		),
	},
	{
		feed_ID: 26058,
		site_ID: 3521287,
		name: 'The Marginalian',
		site_URL: 'https://www.themarginalian.org/',
		feed_URL: 'https://www.themarginalian.org/feed/',
		icon_URL:
			'https://i0.wp.com/www.themarginalian.org/wp-content/uploads/2021/10/cropped-tm_site_icon-1.png?fit=180%2C180&ssl=1',
		description: __(
			'Thoughtful explorations of creativity, literature, science, and the art of living.'
		),
	},
	{
		feed_ID: 45702671,
		site_ID: 50479639,
		name: 'Austin Kleon',
		site_URL: 'https://austinkleon.com/',
		feed_URL: 'https://austinkleon.com/feed/',
		icon_URL: 'https://austinkleon.com/wp-content/uploads/2018/09/cropped-kleon-200px-180x180.jpg',
		description: __( 'Encouragement and practical ideas for sustaining a creative life.' ),
	},
	{
		feed_ID: 83448543,
		site_ID: 147199084,
		name: 'Seth Godin',
		site_URL: 'https://seths.blog/',
		feed_URL: 'https://seths.blog/feed/',
		icon_URL: 'https://seths.blog/wp-content/themes/godin/img/favicons/apple-touch-icon.png',
		description: __(
			'Short daily reflections on meaningful work, creativity, and making a difference.'
		),
	},
	{
		feed_ID: 17497209,
		site_ID: 0,
		name: 'Barking Up the Wrong Tree',
		site_URL: 'https://bakadesuyo.com/',
		feed_URL: 'https://bakadesuyo.com/feed/',
		icon_URL: 'https://bakadesuyo.com/wp-content/uploads/2012/10/cropped-bakalogo-180x180.png',
		description: __(
			'Research-informed reflections on happiness, relationships, and living well.'
		),
	},
	{
		feed_ID: 3117,
		site_ID: 0,
		name: 'Daily Good',
		site_URL: 'https://www.dailygood.org/',
		feed_URL: 'https://www.dailygood.org/feed/',
		icon_URL: 'https://www.dailygood.org/img/favicon.ico',
		description: __( 'Stories of kindness, compassion, and people making a positive difference.' ),
	},
	{
		feed_ID: 79780304,
		site_ID: 0,
		name: 'Steven Pressfield',
		site_URL: 'https://stevenpressfield.com/',
		feed_URL: 'https://stevenpressfield.com/feed/',
		icon_URL:
			'https://stevenpressfield.com/wp-content/uploads/2021/02/cropped-iconfinder_spartan_1494445-2-180x180.png',
		description: __( 'Reflections on creative courage, discipline, and doing meaningful work.' ),
	},
];
