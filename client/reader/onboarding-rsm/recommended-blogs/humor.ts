import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getHumorBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 75616040,
		site_ID: 0,
		name: 'xkcd',
		site_URL: 'https://xkcd.com/',
		feed_URL: 'https://xkcd.com/rss.xml',
		icon_URL: 'https://xkcd.com/s/919f27.ico',
		description: __(
			'Witty webcomics about science, technology, language, and everyday absurdity.'
		),
	},
	{
		feed_ID: 170951096,
		site_ID: 234789167,
		name: 'The Onion',
		site_URL: 'https://theonion.com/',
		feed_URL: 'https://theonion.com/feed/',
		icon_URL: 'https://theonion.com/wp-content/uploads/2024/07/cropped-site-icon.png?w=180',
		description: __(
			'Satirical news, absurd headlines, and sharp observations on current events.'
		),
	},
	{
		feed_ID: 11769,
		site_ID: 0,
		name: 'McSweeney’s Internet Tendency',
		site_URL: 'https://www.mcsweeneys.net/',
		feed_URL: 'https://feeds.feedburner.com/mcsweeneys',
		icon_URL:
			'https://www.mcsweeneys.net/assets/chair-white-b56c46cc6ff30c7d87e754d65dd4f170f7681164c08c91142962b746e0261e19.png',
		description: __(
			'Literary humor, comic essays, and playful takes on culture and everyday life.'
		),
	},
	{
		feed_ID: 67897646,
		site_ID: 58006636,
		name: 'The Bloggess',
		site_URL: 'https://thebloggess.com/',
		feed_URL: 'https://thebloggess.com/feed/',
		icon_URL:
			'https://i0.wp.com/thebloggess.com/wp-content/uploads/2018/08/cropped-cropped-cheesecake.jpg?fit=180%2C180&ssl=1',
		description: __( 'Jenny Lawson’s darkly funny stories about everyday life and mental health.' ),
	},
	{
		feed_ID: 63210482,
		site_ID: 125538242,
		name: 'Points in Case',
		site_URL: 'https://www.pointsincase.com/',
		feed_URL: 'https://www.pointsincase.com/feed',
		icon_URL: 'https://www.pointsincase.com/images/apple-touch-icon-192x192.png',
		description: __(
			'Comic essays, satire, jokes, and stories from a community of humor writers.'
		),
	},
	{
		feed_ID: 158497258,
		site_ID: 213904033,
		name: 'The Poke',
		site_URL: 'https://www.thepoke.com/',
		feed_URL: 'https://www.thepoke.com/feed/',
		icon_URL: 'https://www.thepoke.com/wp-content/themes/WP_Theme_ThePoke/img/favicon-152x152.png',
		description: __( 'Funny internet discoveries, topical jokes, and comic observations.' ),
	},
	{
		feed_ID: 112956371,
		site_ID: 0,
		name: 'Reductress',
		site_URL: 'https://reductress.com/',
		feed_URL: 'https://reductress.com/feed/',
		icon_URL:
			'https://reductress.com/wp-content/themes/reductress-theme/img/favicons/apple-touch-icon.png',
		description: __( 'Feminist satire skewering media, culture, and everyday expectations.' ),
	},
	{
		feed_ID: 50562987,
		site_ID: 71075236,
		name: 'The Daily Mash',
		site_URL: 'https://www.thedailymash.co.uk/',
		feed_URL: 'https://www.thedailymash.co.uk/feed',
		icon_URL: 'https://www.thedailymash.co.uk/assets/icon-apple.png',
		description: __( 'British satirical news and comic takes on politics and everyday life.' ),
	},
	{
		feed_ID: 8903078,
		site_ID: 0,
		name: 'Savage Chickens',
		site_URL: 'https://www.savagechickens.com/',
		feed_URL: 'https://www.savagechickens.com/feed',
		icon_URL: 'https://www.savagechickens.com/wp-content/uploads/dougsavage300-150x150.gif',
		description: __( 'Doug Savage’s chicken comics about work, life, and everyday frustrations.' ),
	},
	{
		feed_ID: 21763468,
		site_ID: 0,
		name: 'Dinosaur Comics',
		site_URL: 'https://qwantz.com/',
		feed_URL: 'https://qwantz.com/rssfeed.php',
		icon_URL: 'https://qwantz.com/favicon.ico',
		description: __(
			'Recurring dinosaurs trade jokes about language, philosophy, and everyday absurdity.'
		),
	},
	{
		feed_ID: 23488144,
		site_ID: 63887478,
		name: 'The Shovel',
		site_URL: 'https://www.theshovel.com.au/',
		feed_URL: 'https://www.theshovel.com.au/feed/',
		icon_URL: 'https://theshovel.com.au/wp-content/uploads/2023/03/the-shovel-icon-225x225.png',
		description: __( 'Australian satire on politics, media, and everyday absurdity.' ),
	},
	{
		feed_ID: 25910015,
		site_ID: 0,
		name: 'Existential Comics',
		site_URL: 'https://existentialcomics.com/',
		feed_URL: 'https://existentialcomics.com/rss.xml',
		icon_URL: 'https://static.existentialcomics.com/favicon.ico',
		description: __( 'Philosophy-themed webcomics turning big ideas into comic situations.' ),
	},
];
