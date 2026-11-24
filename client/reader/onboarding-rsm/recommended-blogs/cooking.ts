import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getCookingBlogs = (): RecommendedBlog[] => [
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
		feed_ID: 84891345,
		site_ID: 0,
		name: 'The Kitchn',
		site_URL: 'https://www.thekitchn.com/',
		feed_URL: 'https://www.thekitchn.com/main.rss',
		icon_URL: 'https://www.thekitchn.com/static/icons/apple-touch-icon.png',
		description: __( 'Recipes, kitchen advice, and ideas for everyday home cooking.' ),
	},
	{
		feed_ID: 156736368,
		site_ID: 0,
		name: 'King Arthur Baking',
		site_URL: 'https://www.kingarthurbaking.com/blog',
		feed_URL: 'https://www.kingarthurbaking.com/blog/feed',
		icon_URL: 'https://www.kingarthurbaking.com/themes/custom/kaf_nextgenweb/favicon.ico',
		description: __( 'Baking techniques, tested recipes, and expert advice for home bakers.' ),
	},
	{
		feed_ID: 9334640,
		site_ID: 0,
		name: 'Once Upon a Chef',
		site_URL: 'https://www.onceuponachef.com/',
		feed_URL: 'https://www.onceuponachef.com/feed',
		icon_URL: 'https://www.onceuponachef.com/images/fbrfg/apple-touch-icon.png?v=PYeJqGG0px',
		description: __(
			'Tested recipes and practical cooking advice from a professionally trained chef.'
		),
	},
	{
		feed_ID: 57384960,
		site_ID: 0,
		name: 'The Stay At Home Chef',
		site_URL: 'https://thestayathomechef.com/',
		feed_URL: 'https://thestayathomechef.com/feed/',
		icon_URL: 'https://thestayathomechef.com/apple-touch-icon.png',
		description: __( 'Step-by-step home cooking, tested recipes, and kitchen tips.' ),
	},
	{
		feed_ID: 134017586,
		site_ID: 67059900,
		name: 'The Mediterranean Dish',
		site_URL: 'https://www.themediterraneandish.com/',
		feed_URL: 'https://www.themediterraneandish.com/feed/',
		icon_URL:
			'https://www.themediterraneandish.com/wp-content/uploads/2026/10/sitelogo-favicon-250x250.png',
		description: __( 'Mediterranean recipes, cooking tips, and everyday kitchen ideas.' ),
	},
	{
		feed_ID: 2117156,
		site_ID: 26976519,
		name: 'Inspired Taste',
		site_URL: 'https://www.inspiredtaste.net/',
		feed_URL: 'https://www.inspiredtaste.net/feed/',
		icon_URL:
			'https://www.inspiredtaste.net/wp-content/uploads/2023/01/cropped-Inspired-Taste-Favicon-180x180.png',
		description: __( 'Reliable recipes and approachable cooking techniques for home kitchens.' ),
	},
];
