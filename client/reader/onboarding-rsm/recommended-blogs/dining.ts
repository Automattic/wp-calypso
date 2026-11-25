import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getDiningBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 25121564,
		site_ID: 0,
		name: 'Eater',
		site_URL: 'https://www.eater.com/',
		feed_URL: 'https://www.eater.com/rss/index.xml',
		icon_URL: 'https://www.eater.com/static-assets/icons/apple-touch-icon.png',
		description: __( 'Restaurant news, dining guides, and stories about how and where we eat.' ),
	},
	{
		feed_ID: 36480337,
		site_ID: 96103510,
		name: 'Eatbook',
		site_URL: 'https://eatbook.sg/',
		feed_URL: 'https://eatbook.sg/feed/',
		icon_URL: 'https://eatbook.sg/wp-content/uploads/2016/08/eatbook-small.jpg',
		description: __(
			'Singapore food guides, undercover restaurant reviews, and new places to eat.'
		),
	},
	{
		feed_ID: 8944254,
		site_ID: 0,
		name: 'Vancouver Foodster',
		site_URL: 'https://vancouverfoodster.com/',
		feed_URL: 'https://vancouverfoodster.com/feed/',
		icon_URL: 'https://vancouverfoodster.com/wp-content/uploads/2022/03/Favicon-Design-01.png',
		description: __( 'Restaurant discoveries, tastings, and stories from Vancouver’s food scene.' ),
	},
	{
		feed_ID: 183302231,
		site_ID: 0,
		name: 'Boston Magazine Restaurants',
		site_URL: 'https://www.bostonmagazine.com/restaurants/',
		feed_URL: 'https://www.bostonmagazine.com/restaurants/feed/',
		icon_URL:
			'https://bomag.o0bc.com/wp-content/uploads/sites/2/2017/10/cropped-boston-magazine-favicon-180x180.png',
		description: __(
			'Boston dining news, restaurant reviews, and guides to the local food scene.'
		),
	},
	{
		feed_ID: 183302233,
		site_ID: 0,
		name: 'The Guardian Restaurant Reviews',
		site_URL: 'https://www.theguardian.com/food/restaurants',
		feed_URL: 'https://www.theguardian.com/food/restaurants/rss',
		icon_URL: 'https://assets.guim.co.uk/static/frontend/icons/homescreen/apple-touch-icon.svg',
		description: __( 'Restaurant criticism and thoughtful stories about eating out in Britain.' ),
	},
	{
		feed_ID: 183302235,
		site_ID: 0,
		name: 'London On The Inside',
		site_URL: 'https://londontheinside.com/',
		feed_URL: 'https://londontheinside.com/feed/',
		icon_URL:
			'https://loti.b-cdn.net/wp-content/uploads/2025/09/cropped-favicon-180x180.png?x36642',
		description: __(
			'London restaurant discoveries alongside the city’s culture, openings, and local life.'
		),
	},
	{
		feed_ID: 36755701,
		site_ID: 95936878,
		name: 'SilverSpoon London',
		site_URL: 'https://www.silverspoonlondon.co.uk/',
		feed_URL: 'https://www.silverspoonlondon.co.uk/feed/',
		icon_URL:
			'https://silverspoonlondon.co.uk/wp-content/uploads/2025/02/cropped-SS-brand-mark-all-01-180x180.png',
		description: __(
			'Restaurant visits, luxury travel, and personal stories from London and beyond.'
		),
	},
	{
		feed_ID: 182892374,
		site_ID: 0,
		name: 'Vittles',
		site_URL: 'https://www.vittlesmagazine.com/',
		feed_URL: 'https://www.vittlesmagazine.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!qcuM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9193155f-d838-4c63-9631-921249b84a09%2Fapple-touch-icon-180x180.png',
		description: __(
			'Restaurant recommendations, food criticism, and essays about the culture and politics of eating.'
		),
	},
	{
		feed_ID: 27326637,
		site_ID: 0,
		name: 'Eater New York',
		site_URL: 'https://ny.eater.com/',
		feed_URL: 'https://ny.eater.com/rss/index.xml',
		icon_URL: 'https://ny.eater.com/static-assets/icons/apple-touch-icon.png',
		description: __(
			'Restaurant openings, dining guides, and food-culture reporting from New York.'
		),
	},
	{
		feed_ID: 32778776,
		site_ID: 0,
		name: 'Eater Los Angeles',
		site_URL: 'https://la.eater.com/',
		feed_URL: 'https://la.eater.com/rss/index.xml',
		icon_URL: 'https://la.eater.com/static-assets/icons/apple-touch-icon.png',
		description: __(
			'Restaurant openings, dining guides, and food-culture reporting from Los Angeles.'
		),
	},
	{
		feed_ID: 484145,
		site_ID: 4251792,
		name: 'Restaurant-ing Through History',
		site_URL: 'https://restaurant-ingthroughhistory.com/',
		feed_URL: 'https://restaurant-ingthroughhistory.com/feed/',
		icon_URL: 'https://restaurant-ingthroughhistory.com/wp-content/uploads/2022/01/image.jpg?w=180',
		description: __(
			'Stories about restaurant history, dining customs, menus, and the people behind them.'
		),
	},
	{
		feed_ID: 183303519,
		site_ID: 0,
		name: 'Food & Wine',
		site_URL: 'https://www.foodandwine.com/',
		feed_URL:
			'https://feeds-api.dotdashmeredith.com/v1/rss/google/fdd0cc60-6e85-462a-a071-58da5a17711f',
		icon_URL: 'https://www.foodandwine.com/apple-touch-icon-180x180.png',
		description: __(
			'Restaurant reporting, food culture, wine, and stories about where and how people eat.'
		),
	},
];
