import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getSocialMediaBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 257425,
		site_ID: 80521841,
		name: 'Social Media Examiner',
		site_URL: 'https://www.socialmediaexaminer.com/',
		feed_URL: 'https://www.socialmediaexaminer.com/feed/',
		icon_URL: 'https://www.socialmediaexaminer.com/apple-touch-icon.png',
		description: __(
			'Social marketing strategies, platform changes, and practical advice for creators.'
		),
	},
	{
		feed_ID: 32786562,
		site_ID: 26643719,
		name: 'Jon Loomer',
		site_URL: 'https://www.jonloomer.com/',
		feed_URL: 'https://www.jonloomer.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.jonloomer.com/wp-content/themes/jonloomer/library/images/apple-touch-icon.png?resize=180%2C180&ssl=1',
		description: __( 'Detailed guidance on Meta advertising and social marketing experiments.' ),
	},
	{
		feed_ID: 96710053,
		site_ID: 41151446,
		name: 'Neal Schaffer',
		site_URL: 'https://nealschaffer.com/',
		feed_URL: 'https://nealschaffer.com/feed/',
		icon_URL: 'https://nealschaffer.com/wp-content/uploads/android-chrome-512x512-1.png',
		description: __(
			'Social marketing strategy, creator partnerships, and practical digital advice.'
		),
	},
	{
		feed_ID: 110249984,
		site_ID: 0,
		name: 'Buffer',
		site_URL: 'https://buffer.com/resources/',
		feed_URL: 'https://buffer.com/resources/rss/',
		icon_URL: 'https://buffer.com/icons/apple-touch-icon.png',
		description: __(
			'Practical social media ideas and stories about building an engaged audience.'
		),
	},
	{
		feed_ID: 5371605,
		site_ID: 36232339,
		name: 'Hootsuite Blog',
		site_URL: 'https://blog.hootsuite.com/',
		feed_URL: 'https://blog.hootsuite.com/feed/',
		icon_URL:
			'https://blog.hootsuite.com/wp-content/uploads/2023/03/cropped-owly-favicon-180x180.png',
		description: __(
			'Social media strategy, platform updates, and tools for managing online communities.'
		),
	},
	{
		feed_ID: 8975011,
		site_ID: 17386662,
		name: 'Sprout Social Insights',
		site_URL: 'https://sproutsocial.com/insights/',
		feed_URL: 'https://sproutsocial.com/insights/feed/',
		icon_URL: 'https://media.sproutsocial.com/uploads/favicon_apple-touch.png',
		description: __(
			'Social media research, marketing strategy, and ideas for stronger communities.'
		),
	},
	{
		feed_ID: 66439839,
		site_ID: 0,
		name: 'HubSpot Marketing',
		site_URL: 'https://blog.hubspot.com/marketing',
		feed_URL: 'https://blog.hubspot.com/marketing/rss.xml',
		icon_URL: 'https://blog.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
		description: __(
			'Marketing research and practical guidance on social media, content, and audiences.'
		),
	},
	{
		feed_ID: 55945485,
		site_ID: 119218573,
		name: 'Waxy.org',
		site_URL: 'https://waxy.org/',
		feed_URL: 'https://waxy.org/feed/',
		icon_URL: 'https://waxy.org/wp-content/uploads/2016/10/square_logo.png',
		description: __(
			'Links and commentary on web culture, online creators, and digital communities.'
		),
	},
	{
		feed_ID: 73039693,
		site_ID: 0,
		name: 'Agorapulse',
		site_URL: 'https://www.agorapulse.com/blog/',
		feed_URL: 'https://www.agorapulse.com/blog/feed/',
		icon_URL: 'https://static1.agorapulse.com/apple-touch-icon.png',
		description: __(
			'Social media management advice, marketing experiments, and platform updates.'
		),
	},
	{
		feed_ID: 174662796,
		site_ID: 0,
		name: 'Platformer',
		site_URL: 'https://www.platformer.news/',
		feed_URL: 'https://www.platformer.news/rss/',
		icon_URL:
			'https://storage.ghost.io/c/a0/4c/a04c7225-d919-4d78-9b7c-a3fdd071349b/content/images/size/w256h256/2024/05/Logomark_Blue_800px.png',
		description: __(
			'Reporting and analysis on social platforms and the power of technology companies.'
		),
	},
	{
		feed_ID: 164650232,
		site_ID: 0,
		name: '404 Media',
		site_URL: 'https://www.404media.co/',
		feed_URL: 'https://www.404media.co/rss/',
		icon_URL:
			'https://storage.ghost.io/c/0f/76/0f76b548-bc58-4f25-abc3-3f5ebca07da4/content/images/size/w256h256/format/png/2023/08/favicon-3.svg',
		description: __(
			'Independent investigations into surveillance, cybersecurity, online communities, and the technology industry.'
		),
	},
	{
		feed_ID: 169895071,
		site_ID: 0,
		name: 'Techdirt',
		site_URL: 'https://www.techdirt.com/',
		feed_URL: 'https://www.techdirt.com/feed/',
		icon_URL:
			'https://i0.wp.com/www.techdirt.com/wp-content/uploads/2022/02/cropped-techdirt-square-512x512-1.png?fit=180%2C180&ssl=1',
		description: __(
			'Analysis of technology policy, civil liberties, innovation, and the internet economy.'
		),
	},
];
