import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getDrinksBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 96948876,
		site_ID: 0,
		name: 'PUNCH',
		site_URL: 'https://punchdrink.com/',
		feed_URL: 'https://punchdrink.com/feed/',
		icon_URL:
			'https://punchdrink.com/wp-content/uploads/2021/06/cropped-Punch_Facebook_Icon_02_512.png?w=180',
		description: __( 'Cocktail recipes, bar culture, and stories about the people behind drinks.' ),
	},
	{
		feed_ID: 34242726,
		site_ID: 0,
		name: 'Imbibe',
		site_URL: 'https://imbibemagazine.com/',
		feed_URL: 'https://imbibemagazine.com/feed/',
		icon_URL:
			'https://cdn.shortpixel.ai/spai/q_lossless+ret_img+to_webp/imbibemagazine.com/wp-content/uploads/2020/08/cropped-cropped-New-icon-76@2x-180x180.png',
		description: __( 'Recipes and stories spanning cocktails, wine, beer, coffee, and tea.' ),
	},
	{
		feed_ID: 34088886,
		site_ID: 0,
		name: 'VinePair',
		site_URL: 'https://vinepair.com/',
		feed_URL: 'https://vinepair.com/feed/',
		icon_URL: 'https://vinepair.com/apple-touch-icon.png?v=e1l2m9y2r05',
		description: __(
			'Accessible reporting on drinks culture, wine, beer, spirits, and cocktails.'
		),
	},
	{
		feed_ID: 58010194,
		site_ID: 115581535,
		name: 'Drinkhacker',
		site_URL: 'https://www.drinkhacker.com/',
		feed_URL: 'https://www.drinkhacker.com/feed/',
		icon_URL:
			'https://www.drinkhacker.com/wp-content/uploads/2019/01/cropped-glass-only-square-180x180.png',
		description: __(
			'Independent spirits, wine, and beer reviews alongside classic and new cocktails.'
		),
	},
	{
		feed_ID: 45787628,
		site_ID: 0,
		name: 'Daily Coffee News',
		site_URL: 'https://dailycoffeenews.com/',
		feed_URL: 'https://dailycoffeenews.com/feed/',
		icon_URL:
			'https://dailycoffeenews.com/wp-content/themes/dailycoffeenews/ico/apple-touch-icon-180x180.png',
		description: __(
			'Specialty coffee news covering producers, roasting, cafes, and the wider industry.'
		),
	},
	{
		feed_ID: 183302219,
		site_ID: 0,
		name: 'Beervana',
		site_URL: 'https://www.beervanablog.com/',
		feed_URL: 'https://www.beervanablog.com/beervana?format=rss',
		icon_URL:
			'https://images.squarespace-cdn.com/content/v1/5876279bbebafb82a7c81c00/abb98de1-416c-424b-9d7e-7d344a4c9db3/favicon.ico?format=100w',
		description: __(
			'Beer culture, brewing history, and thoughtful reporting from the Pacific Northwest.'
		),
	},
	{
		feed_ID: 41957890,
		site_ID: 0,
		name: 'Decanter',
		site_URL: 'https://www.decanter.com/',
		feed_URL: 'https://www.decanter.com/feed/',
		icon_URL: 'https://cdn.mos.cms.futurecdn.net/flexiimages/i1ez9papai1791455959.png',
		description: __(
			'Wine reporting, regional guides, tasting advice, and stories from vineyards worldwide.'
		),
	},
	{
		feed_ID: 183302222,
		site_ID: 0,
		name: 'Tales of the Cocktail',
		site_URL: 'https://talesofthecocktail.org/',
		feed_URL: 'https://talesofthecocktail.org/feed/',
		icon_URL: 'https://talesofthecocktail.org/wp-content/themes/toc/apple-touch-icon.png',
		description: __(
			'Cocktail-community stories, bartender education, industry news, and drinks culture.'
		),
	},
	{
		feed_ID: 121076214,
		site_ID: 157368526,
		name: 'Tea for Me Please',
		site_URL: 'https://www.teaformeplease.com/',
		feed_URL: 'https://www.teaformeplease.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.teaformeplease.com/wp-content/uploads/2023/07/cropped-Favicon-1-1.jpg?fit=180%2C180&ssl=1',
		description: __(
			'Tea reviews, brewing guidance, and approachable lessons about tea traditions.'
		),
	},
	{
		feed_ID: 1282970,
		site_ID: 3580386,
		name: 'The Full Pint',
		site_URL: 'https://thefullpint.com/',
		feed_URL: 'https://thefullpint.com/feed/',
		icon_URL: 'https://thefullpint.com/wp-content/uploads/favicon.jpg',
		description: __(
			'Craft beer news, brewery stories, beer releases, and conversations with brewers.'
		),
	},
	{
		feed_ID: 183303464,
		site_ID: 0,
		name: 'CoffeeGeek',
		site_URL: 'https://coffeegeek.com/',
		feed_URL: 'https://coffeegeek.com/feed/',
		icon_URL:
			'https://coffeegeek.com/wp-content/uploads/2023/05/cropped-faveicons2021white-300x300.png',
		description: __( 'Coffee and espresso news, brewing guides, and detailed equipment reviews.' ),
	},
	{
		feed_ID: 55833897,
		site_ID: 0,
		name: 'Whiskynotes',
		site_URL: 'https://www.whiskynotes.be/',
		feed_URL: 'https://www.whiskynotes.be/feed/',
		icon_URL: 'https://www.whiskynotes.be/wp-content/uploads/2023/06/ruben-whiskynotes.jpg',
		description: __(
			'Independent whisky reviews and tasting notes covering new releases and classic bottles.'
		),
	},
];
