import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getBusinessBlogs = (): RecommendedBlog[] => [
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
		feed_ID: 169060013,
		site_ID: 41106627,
		name: 'Duct Tape Marketing',
		site_URL: 'https://ducttapemarketing.com/',
		feed_URL: 'https://ducttapemarketing.com/feed/',
		icon_URL:
			'https://ducttapemarketing.com/wp-content/uploads/2022/08/cropped-15921-New-Logo-Favicon_V1-DTM.png',
		description: __(
			'Small-business marketing strategy, customer relationships, and practical growth ideas.'
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
		feed_ID: 130603291,
		site_ID: 0,
		name: 'Not Boring',
		site_URL: 'https://www.notboring.co/',
		feed_URL: 'https://www.notboring.co/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!LJ76!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5ec10a31-1fa7-415a-b2ae-53a71f17baed%2Fapple-touch-icon-180x180.png',
		description: __(
			'Optimistic essays on startups, technology businesses, and emerging business ideas.'
		),
	},
	{
		feed_ID: 34706790,
		site_ID: 0,
		name: 'Entrepreneur',
		site_URL: 'https://www.entrepreneur.com/',
		feed_URL: 'https://www.entrepreneur.com/latest.rss',
		icon_URL:
			'https://www.entrepreneur.com/wp-content/uploads/sites/2/2025/03/cropped-Ent_Logo_Circle_Black_300.png?w=180',
		description: __(
			'Stories and practical perspectives on starting, running, and growing a business.'
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
		feed_ID: 25353898,
		site_ID: 0,
		name: 'Tomasz Tunguz',
		site_URL: 'https://tomtunguz.com/',
		feed_URL: 'https://tomtunguz.com/index.xml',
		icon_URL: 'https://tomtunguz.com/favicon.ico',
		description: __(
			'Data-informed analysis of startups, SaaS, artificial intelligence, and business strategy.'
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
	{
		feed_ID: 50242239,
		site_ID: 79671428,
		name: 'SaaStr',
		site_URL: 'https://www.saastr.com/',
		feed_URL: 'https://www.saastr.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.saastr.com/wp-content/uploads/2020/10/cropped-SaaStr-Favicon.png?fit=180%2C180&quality=70&ssl=1',
		description: __(
			'Practical lessons for SaaS founders, business leaders, and growing software companies.'
		),
	},
	{
		feed_ID: 112645437,
		site_ID: 188043415,
		name: 'Stratechery',
		site_URL: 'https://stratechery.com/',
		feed_URL: 'https://stratechery.com/feed/',
		icon_URL:
			'https://i0.wp.com/stratechery.com/wp-content/uploads/2018/03/cropped-android-chrome-512x512-1.png?fit=180%2C180&ssl=1',
		description: __(
			'Ben Thompson’s analysis of technology businesses, strategy, and business models.'
		),
	},
];
