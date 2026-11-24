import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getWorkBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 1360544,
		site_ID: 224017065,
		name: 'Ask a Manager',
		site_URL: 'https://www.askamanager.org/',
		feed_URL: 'https://www.askamanager.org/feed',
		icon_URL:
			'https://www.askamanager.org/wp-content/uploads/2017/11/Alison_EDIT2_V08A8451-Edit-2_20170609_11-234x300.jpg',
		description: __(
			'Workplace advice on difficult bosses, coworkers, hiring, and everyday office dilemmas.'
		),
	},
	{
		feed_ID: 25599614,
		site_ID: 124014575,
		name: 'Rands in Repose',
		site_URL: 'https://randsinrepose.com/',
		feed_URL: 'https://randsinrepose.com/feed/',
		icon_URL:
			'https://randsinrepose.com/wp-content/uploads/2025/08/cropped-rands-favicon-1-180x180.png',
		description: __(
			'Engineering management, leadership, and the human side of working in technology.'
		),
	},
	{
		feed_ID: 174904924,
		site_ID: 0,
		name: 'Cal Newport',
		site_URL: 'https://calnewport.com/',
		feed_URL: 'https://calnewport.com/feed/',
		icon_URL:
			'https://calnewport.com/wp-content/uploads/2022/10/cropped-cal-newport-favicon-512x512-1-180x180.png',
		description: __(
			'Practical reflections on deep work, digital habits, and a meaningful working life.'
		),
	},
	{
		feed_ID: 56752376,
		site_ID: 0,
		name: 'Workplace Insight',
		site_URL: 'https://workplaceinsight.net/',
		feed_URL: 'https://workplaceinsight.net/feed/',
		icon_URL:
			'https://workplaceinsight.net/wp-content/uploads/2021/02/cropped-in_social-media_Logo-scaled-1-250x250.jpg',
		description: __(
			'News and research on office design, workplace culture, and how people work.'
		),
	},
	{
		feed_ID: 159755392,
		site_ID: 0,
		name: 'The Pragmatic Engineer',
		site_URL: 'https://newsletter.pragmaticengineer.com/',
		feed_URL: 'https://newsletter.pragmaticengineer.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!iIpB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47d77fcc-2914-46a1-8d39-3a6e8758e0ad%2Fapple-touch-icon-180x180.png',
		description: __(
			'Inside engineering teams, software careers, and the changing technology workplace.'
		),
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
		feed_ID: 6664746,
		site_ID: 9813510,
		name: 'MIT Sloan Management Review',
		site_URL: 'https://sloanreview.mit.edu/',
		feed_URL: 'https://sloanreview.mit.edu/feed/',
		icon_URL: 'https://sloanreview.mit.edu/apple-icon-180x180.png',
		description: __(
			'Management research and practical ideas for leading teams and organizations.'
		),
	},
	{
		feed_ID: 83448543,
		site_ID: 147199084,
		name: "Seth's Blog",
		site_URL: 'https://seths.blog/',
		feed_URL: 'http://seths.blog/feed',
		icon_URL: 'https://seths.blog/wp-content/themes/godin/img/favicons/apple-touch-icon.png',
		description: __(
			'Daily essays on marketing, leadership, creativity, and doing meaningful business.'
		),
	},
	{
		feed_ID: 102181945,
		site_ID: 242260508,
		name: 'The Blog of Author Tim Ferriss',
		site_URL: 'https://tim.blog/',
		feed_URL: 'http://tim.blog/feed',
		icon_URL:
			'https://i0.wp.com/tim.blog/wp-content/uploads/2025/05/favicon.png?fit=180%2C180&quality=80&ssl=1',
		description: __(
			'Founder interviews, work experiments, and ideas for building a creative business.'
		),
	},
	{
		feed_ID: 139311453,
		site_ID: 6599589,
		name: 'Steve Blank',
		site_URL: 'https://steveblank.com/',
		feed_URL: 'https://steveblank.com/feed/',
		icon_URL:
			'https://i0.wp.com/steveblank.com/wp-content/uploads/2009/02/steve_blank-istanbul-300x284.jpg?resize=300%2C273&ssl=1',
		description: __(
			'Startup strategy, customer development, and lessons from building businesses.'
		),
	},
	{
		feed_ID: 178929684,
		site_ID: 0,
		name: 'Kellblog',
		site_URL: 'https://kellblog.com/',
		feed_URL: 'https://www.kellblog.com/rss/',
		icon_URL:
			'https://storage.ghost.io/c/c2/73/c273c431-3cb6-4d51-a332-a1ac8e611c29/content/images/size/w256h256/2026/04/dk-bio-pic-2-1.png',
		description: __(
			'SaaS strategy, business leadership, marketing, and lessons from company-building.'
		),
	},
	{
		feed_ID: 359631,
		site_ID: 6003453,
		name: 'David Cummings',
		site_URL: 'https://davidcummings.org/',
		feed_URL: 'https://davidcummings.org/feed/',
		icon_URL:
			'https://i0.wp.com/davidcummings.org/wp-content/uploads/2026/05/david-cummings-headshot.jpg?resize=180%2C180&ssl=1',
		description: __( 'Reflections on entrepreneurship, company culture, and building startups.' ),
	},
];
