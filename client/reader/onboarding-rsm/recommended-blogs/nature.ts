import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getNatureBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 68582058,
		site_ID: 0,
		name: 'Mongabay',
		site_URL: 'https://news.mongabay.com/',
		feed_URL: 'https://news.mongabay.com/feed/',
		icon_URL: 'https://news.mongabay.com/wp-content/themes/mongabay_v2/img/icons/ico-s2.jpg',
		description: __(
			'Conservation reporting about wildlife, forests, oceans, and communities around the world.'
		),
	},
	{
		feed_ID: 95561016,
		site_ID: 0,
		name: 'Yale Environment 360',
		site_URL: 'https://e360.yale.edu/',
		feed_URL: 'https://e360.yale.edu/feed.xml',
		icon_URL: 'https://e360.yale.edu/assets/img/favicons/apple-touch-icon-180x180.png',
		description: __(
			'Environmental reporting, analysis, and ideas from journalists and researchers.'
		),
	},
	{
		feed_ID: 107813600,
		site_ID: 0,
		name: 'Yale Climate Connections',
		site_URL: 'https://yaleclimateconnections.org/',
		feed_URL: 'https://yaleclimateconnections.org/feed/',
		icon_URL:
			'https://i0.wp.com/yaleclimateconnections.org/wp-content/uploads/2020/10/ycc-favicon.png?fit=100%2C100&ssl=1',
		description: __(
			'Climate reporting explaining impacts, solutions, and the connections with daily life.'
		),
	},
	{
		feed_ID: 88307145,
		site_ID: 0,
		name: 'Audubon',
		site_URL: 'https://www.audubon.org/',
		feed_URL: 'https://www.audubon.org/rss.xml',
		icon_URL: 'https://www.audubon.org/icons/icon_x192.png',
		description: __( 'Bird stories, conservation reporting, and guides to the natural world.' ),
	},
	{
		feed_ID: 172523876,
		site_ID: 210842501,
		name: 'The Nature Conservancy Cool Green Science',
		site_URL: 'https://blog.nature.org/',
		feed_URL: 'https://blog.nature.org/feed/',
		icon_URL:
			'https://blog.nature.org/wp-content/uploads/2017/09/cropped-TNC-Social-Media-Avatar.png?w=180',
		description: __(
			'Field stories and research about wildlife, habitats, and practical conservation.'
		),
	},
	{
		feed_ID: 183302399,
		site_ID: 0,
		name: 'British Trust for Ornithology',
		site_URL: 'https://www.bto.org/',
		feed_URL: 'https://www.bto.org/rss.xml',
		icon_URL: 'https://www.bto.org/themes/custom/bto_b5/favicon.ico',
		description: __(
			'Bird research, conservation stories, and updates from community science projects.'
		),
	},
	{
		feed_ID: 34541679,
		site_ID: 0,
		name: 'The Wildlife Society',
		site_URL: 'https://wildlife.org/',
		feed_URL: 'https://wildlife.org/feed/',
		icon_URL: 'https://wildlife.org/wp-content/uploads/2025/09/tws-favicon-light.png',
		description: __(
			'Wildlife science, conservation practice, and news for people working with wild species.'
		),
	},
	{
		feed_ID: 183302402,
		site_ID: 0,
		name: 'The Revelator',
		site_URL: 'https://therevelator.org/',
		feed_URL: 'https://therevelator.org/feed/',
		icon_URL: 'https://therevelator.org/wp-content/uploads/2017/03/cropped-r-ico-180x180.png',
		description: __(
			'Conservation journalism about endangered species, wild places, and environmental solutions.'
		),
	},
	{
		feed_ID: 21322400,
		site_ID: 68687440,
		name: 'Finding Nature',
		site_URL: 'https://findingnature.org.uk/',
		feed_URL: 'https://findingnature.org.uk/feed/',
		icon_URL:
			'https://secure.gravatar.com/blavatar/6c740efc8394df36ad2b0b6f24dba35754e053813f3e4699ff3ce3eb9c327c86?s=114',
		description: __(
			'Research and practical ideas about people’s connection with nature and wellbeing.'
		),
	},
	{
		feed_ID: 183302403,
		site_ID: 0,
		name: 'BirdLife International',
		site_URL: 'https://www.birdlife.org/',
		feed_URL: 'https://www.birdlife.org/feed/',
		icon_URL:
			'https://www.birdlife.org/wp-content/themes/birdlife/dist/apple-touch-icon.png?v=E6wgnJvg3e',
		description: __(
			'Bird conservation stories and research from a worldwide network of conservation groups.'
		),
	},
	{
		feed_ID: 154160739,
		site_ID: 228474941,
		name: 'Inside Climate News',
		site_URL: 'https://insideclimatenews.org/',
		feed_URL: 'https://insideclimatenews.org/feed/',
		icon_URL:
			'https://insideclimatenews.org/wp-content/uploads/2020/09/cropped-favicon-180x180.png',
		description: __(
			'Independent environmental reporting on climate, energy, ecosystems, and affected communities.'
		),
	},
	{
		feed_ID: 183302406,
		site_ID: 0,
		name: 'Rewilding Institute',
		site_URL: 'https://rewilding.org/',
		feed_URL: 'https://rewilding.org/feed/',
		icon_URL:
			'https://rewilding.org/wp-content/uploads/2025/10/cropped-head-golden-aspen-180x180.png',
		description: __(
			'Ideas and field stories about restoring ecosystems, wildlife corridors, and wild species.'
		),
	},
];
