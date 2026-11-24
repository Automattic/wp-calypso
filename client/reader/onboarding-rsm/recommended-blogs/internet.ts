import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getInternetBlogs = (): RecommendedBlog[] => [
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
	{
		feed_ID: 6438763,
		site_ID: 0,
		name: 'Kottke.org',
		site_URL: 'https://kottke.org/',
		feed_URL: 'https://feeds.kottke.org/main',
		icon_URL: 'https://kottke.org/images/2024/icons/180x180.png',
		description: __(
			'Curious discoveries across art, media, design, science, and internet culture.'
		),
	},
	{
		feed_ID: 9166444,
		site_ID: 87954168,
		name: 'Boing Boing',
		site_URL: 'https://boingboing.net/',
		feed_URL: 'https://boingboing.net/feed',
		icon_URL: 'https://boingboing.net/wp-content/uploads/fbrfg/apple-touch-icon.png',
		description: __( 'Offbeat discoveries, technology, culture, and curious corners of the web.' ),
	},
	{
		feed_ID: 94842904,
		site_ID: 156670177,
		name: 'Hackaday',
		site_URL: 'https://hackaday.com/',
		feed_URL: 'https://hackaday.com/feed/',
		icon_URL:
			'https://hackaday.com/wp-content/themes/hackaday-2/img/hackaday-logo_1024x1024.png?v=3',
		description: __(
			'Creative hardware hacks, electronics projects, and clever engineering from the maker community.'
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
			'Andy Baio’s discoveries and commentary on internet culture and creative technology.'
		),
	},
	{
		feed_ID: 162891826,
		site_ID: 0,
		name: 'Where’s Your Ed At',
		site_URL: 'https://www.wheresyoured.at/',
		feed_URL: 'https://www.wheresyoured.at/rss/',
		icon_URL:
			'https://storage.ghost.io/c/24/d8/24d8fcec-dfba-4f40-a467-823d2941ae46/content/images/size/w256h256/2024/01/wyea-.jpeg',
		description: __(
			'Ed Zitron’s essays on the technology industry and its influence on the internet.'
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
];
