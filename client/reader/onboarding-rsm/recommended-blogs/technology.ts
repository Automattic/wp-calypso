import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getTechnologyBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 111100674,
		site_ID: 136296444,
		name: 'TechCrunch',
		site_URL: 'https://techcrunch.com/',
		feed_URL: 'https://techcrunch.com/feed/',
		icon_URL:
			'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png?w=180',
		description: __(
			'Startup reporting, venture capital, and the companies building new technology.'
		),
	},
	{
		feed_ID: 107270245,
		site_ID: 172986898,
		name: 'MIT Technology Review',
		site_URL: 'https://technologyreview.com/',
		feed_URL: 'https://wp.technologyreview.com/feed',
		icon_URL:
			'https://www.technologyreview.com/static/media/favicon.1cfcdb44759a0f93ddf5feb5405dd4cc.ico',
		description: __(
			'Emerging technology reporting and analysis of its effects on business and society.'
		),
	},
	{
		feed_ID: 7396759,
		site_ID: 0,
		name: 'Ars Technica',
		site_URL: 'https://arstechnica.com/',
		feed_URL: 'https://feeds.arstechnica.com/arstechnica/index',
		icon_URL:
			'https://cdn.arstechnica.net/wp-content/uploads/2016/10/cropped-ars-logo-512_480-300x300.png',
		description: __(
			'In-depth technology reporting covering computing, science, policy, and digital culture.'
		),
	},
	{
		feed_ID: 68153863,
		site_ID: 0,
		name: 'The Verge',
		site_URL: 'https://www.theverge.com/',
		feed_URL: 'https://www.theverge.com/rss/index.xml',
		icon_URL: 'https://www.theverge.com/static-assets/icons/apple-touch-icon.png',
		description: __(
			'Technology news, product reviews, and reporting on how digital tools change culture.'
		),
	},
	{
		feed_ID: 68709138,
		site_ID: 0,
		name: 'WIRED',
		site_URL: 'https://www.wired.com/',
		feed_URL: 'https://www.wired.com/feed/rss',
		icon_URL:
			'https://media.wired.com/photos/615e2b8ce78a8cd913bbaa76/16:9/w_1280,c_limit/wired_bug.jpg',
		description: __(
			'Ideas and investigations connecting technology with culture, science, business, and daily life.'
		),
	},
	{
		feed_ID: 2817647,
		site_ID: 0,
		name: 'Engadget',
		site_URL: 'https://www.engadget.com/',
		feed_URL: 'https://www.engadget.com/rss.xml',
		icon_URL: 'https://www.engadget.com/img/engadget-favicon.png',
		description: __( 'Gadget news, product reviews, and consumer technology.' ),
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
		feed_ID: 126372053,
		site_ID: 0,
		name: 'IEEE Spectrum',
		site_URL: 'https://spectrum.ieee.org/',
		feed_URL: 'https://spectrum.ieee.org/feeds/feed.rss',
		icon_URL: 'https://assets.rbl.ms/26596649/origin.png',
		description: __(
			'Engineering discoveries and clear explanations of emerging technologies and the people developing them.'
		),
	},
	{
		feed_ID: 121587305,
		site_ID: 0,
		name: 'The Register',
		site_URL: 'https://www.theregister.com/',
		feed_URL: 'https://www.theregister.com/headlines.atom',
		icon_URL:
			'https://www.theregister.com/view-resources/dachser2/public/theregister/favicons/apple-touch-icon.png',
		description: __(
			'Enterprise technology news, software infrastructure, security, and the business of computing.'
		),
	},
	{
		feed_ID: 164650233,
		site_ID: 0,
		name: 'Rest of World',
		site_URL: 'https://restofworld.org/',
		feed_URL: 'https://restofworld.org/feed/',
		icon_URL: 'https://restofworld.org/wp-content/themes/orbis/assets/icons/icon-180.png?1',
		description: __(
			'Reporting on how technology shapes everyday life beyond the Western technology industry.'
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
	{
		feed_ID: 20787116,
		site_ID: 0,
		name: 'Daring Fireball',
		site_URL: 'https://daringfireball.net/',
		feed_URL: 'https://daringfireball.net/feeds/main',
		icon_URL: 'https://daringfireball.net/graphics/apple-touch-icon.png',
		description: __(
			'Apple, technology products, and independent commentary on the software industry.'
		),
	},
];
