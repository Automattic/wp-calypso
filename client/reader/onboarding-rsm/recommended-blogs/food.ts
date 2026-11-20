import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getFoodBlogs = (): RecommendedBlog[] => [
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
		feed_ID: 71719178,
		site_ID: 0,
		name: 'Budget Bytes',
		site_URL: 'https://www.budgetbytes.com/',
		feed_URL: 'https://www.budgetbytes.com/feed/',
		icon_URL:
			'https://www.budgetbytes.com/wp-content/uploads/2022/05/cropped-cropped-favicon-180x180.png',
		description: __( 'Practical recipes and meal ideas for making good food on a budget.' ),
	},
	{
		feed_ID: 12224862,
		site_ID: 0,
		name: 'The Woks of Life',
		site_URL: 'https://thewoksoflife.com/',
		feed_URL: 'https://thewoksoflife.com/feed/',
		icon_URL:
			'https://thewoksoflife.com/wp-content/uploads/2022/06/cropped-TWOL-favicon-4-180x180.png',
		description: __(
			'A family shares Chinese home cooking, kitchen techniques, and food traditions.'
		),
	},
	{
		feed_ID: 4837153,
		site_ID: 0,
		name: 'Love and Lemons',
		site_URL: 'https://www.loveandlemons.com/',
		feed_URL: 'https://www.loveandlemons.com/feed/',
		icon_URL: 'https://www.loveandlemons.com/apple-icon-180x180.png',
		description: __(
			'Fresh vegetarian recipes that put seasonal produce at the center of the plate.'
		),
	},
	{
		feed_ID: 66626173,
		site_ID: 0,
		name: 'Minimalist Baker',
		site_URL: 'https://minimalistbaker.com/',
		feed_URL: 'https://minimalistbaker.com/feed/',
		icon_URL: 'https://minimalistbaker.com/wp-content/uploads/2022/11/cropped-favicon-180x180.png',
		description: __(
			'Simple recipes with short ingredient lists and approachable cooking methods.'
		),
	},
	{
		feed_ID: 83079217,
		site_ID: 0,
		name: '101 Cookbooks',
		site_URL: 'https://www.101cookbooks.com/',
		feed_URL: 'https://www.101cookbooks.com/feed/',
		icon_URL:
			'https://www.101cookbooks.com/wp-content/uploads/2018/05/cropped-101fav-1-180x180.png',
		description: __(
			'Vegetarian recipes, whole-food ingredients, and inspiration from a well-used cookbook collection.'
		),
	},
	{
		feed_ID: 23251974,
		site_ID: 32586990,
		name: 'David Lebovitz',
		site_URL: 'https://www.davidlebovitz.com/',
		feed_URL: 'https://www.davidlebovitz.com/feed/',
		icon_URL: 'https://www.davidlebovitz.com/wp-content/uploads/fbrfg/apple-touch-icon.png?v=2022',
		description: __( 'Recipes, baking, and stories about eating and drinking in Paris.' ),
	},
	{
		feed_ID: 91129892,
		site_ID: 0,
		name: 'Just One Cookbook',
		site_URL: 'https://www.justonecookbook.com/',
		feed_URL: 'https://www.justonecookbook.com/feed/',
		icon_URL:
			'https://cdn.justonecookbook.com/spai/q_glossy+ret_img+to_auto/www.justonecookbook.com/apple-touch-icon.png?v=2025b',
		description: __(
			'Japanese home cooking explained with clear recipes and step-by-step guidance.'
		),
	},
	{
		feed_ID: 46279251,
		site_ID: 0,
		name: 'RecipeTin Eats',
		site_URL: 'https://www.recipetineats.com/',
		feed_URL: 'https://www.recipetineats.com/feed/',
		icon_URL:
			'https://www.recipetineats.com/tachyon/2018/12/cropped-favicon%402x.png?fit=180%2C180',
		description: __( 'Flavorful recipes and detailed tips for everyday home cooking.' ),
	},
	{
		feed_ID: 9951864,
		site_ID: 0,
		name: 'Pinch of Yum',
		site_URL: 'https://pinchofyum.com/',
		feed_URL: 'https://pinchofyum.com/feed',
		icon_URL: 'https://pinchofyum.com/tachyon/cropped-Pinch-of-Yum-Favicon-512.png?fit=180%2C180',
		description: __( 'Everyday recipes, colorful meals, and ideas for making dinner feel doable.' ),
	},
	{
		feed_ID: 46020446,
		site_ID: 0,
		name: 'Sally’s Baking Addiction',
		site_URL: 'https://sallysbakingaddiction.com/',
		feed_URL: 'https://sallysbakingaddiction.com/feed/',
		icon_URL:
			'https://sallysbakingaddiction.com/wp-content/uploads/2026/01/cropped-favicon-2-180x180.png',
		description: __(
			'Tested baking recipes, clear tutorials, and techniques for confident home baking.'
		),
	},
	{
		feed_ID: 2479627,
		site_ID: 0,
		name: 'Joy the Baker',
		site_URL: 'https://joythebaker.com/',
		feed_URL: 'https://joythebaker.com/feed/',
		icon_URL: 'https://joythebaker.com/wp-content/uploads/2023/04/cropped-Favicon-2022-180x180.png',
		description: __( 'Baking recipes, sweet treats, and personal stories from the kitchen.' ),
	},
];
