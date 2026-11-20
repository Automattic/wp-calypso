import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getScienceBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 162932267,
		site_ID: 233338632,
		name: 'Popular Science',
		site_URL: 'https://www.popsci.com/',
		feed_URL: 'https://www.popsci.com/feed',
		icon_URL:
			'https://www.popsci.com/wp-content/uploads/2024/06/cropped-favicon-ps-FE5102-1.png?quality=85&w=180',
		description: __(
			'Science and technology stories explaining discoveries, inventions, and the everyday world.'
		),
	},
	{
		feed_ID: 163808541,
		site_ID: 0,
		name: 'Scientific American',
		site_URL: 'https://www.scientificamerican.com/',
		feed_URL: 'https://www.scientificamerican.com/platform/syndication/rss/',
		icon_URL: 'https://www.scientificamerican.com/static/favicon.ico',
		description: __(
			'Science reporting and analysis connecting research with society and daily life.'
		),
	},
	{
		feed_ID: 163620874,
		site_ID: 0,
		name: 'Quanta Magazine',
		site_URL: 'https://www.quantamagazine.org/',
		feed_URL: 'https://www.quantamagazine.org/feed/',
		icon_URL:
			'https://www.quantamagazine.org/wp-content/themes/quanta2024/frontend/images/apple-touch-icon.png',
		description: __(
			'Clear, detailed reporting on discoveries in mathematics, physics, biology, and computer science.'
		),
	},
	{
		feed_ID: 8977575,
		site_ID: 0,
		name: 'Phys.org',
		site_URL: 'https://phys.org/',
		feed_URL: 'https://phys.org/rss-feed/',
		icon_URL: 'https://phys.b-cdn.net/tmpl/v6/img/favicons/apple-touch-icon.png',
		description: __(
			'Research news spanning physics, biology, chemistry, Earth science, and engineering.'
		),
	},
	{
		feed_ID: 138411836,
		site_ID: 0,
		name: 'ScienceAlert',
		site_URL: 'https://www.sciencealert.com/',
		feed_URL: 'https://www.sciencealert.com/feed',
		icon_URL: 'https://www.sciencealert.com/images/2022/08/cropped-sa-rounded-favicon-180x180.png',
		description: __(
			'Accessible reporting on scientific discoveries, mysteries, and emerging research.'
		),
	},
	{
		feed_ID: 127462013,
		site_ID: 0,
		name: 'Nautilus',
		site_URL: 'https://nautil.us/',
		feed_URL: 'https://nautil.us/feed/',
		icon_URL:
			'https://lede-admin.nautil.us/wp-content/uploads/sites/70/sites/3/nautilus/cropped-thicker_smaller_logo.png',
		description: __(
			'Essays and reporting connecting scientific ideas with culture, philosophy, and everyday experience.'
		),
	},
	{
		feed_ID: 42104124,
		site_ID: 0,
		name: 'The Conversation Science',
		site_URL: 'https://theconversation.com/us/technology',
		feed_URL: 'https://theconversation.com/us/technology/articles.atom',
		icon_URL:
			'https://images.theconversation.com/files/581997/original/9275d5c0-7dd5-4ddf-b50b-98d537e016f4.png',
		description: __(
			'Research-informed explanations of science and technology written with academic experts.'
		),
	},
	{
		feed_ID: 8897454,
		site_ID: 0,
		name: 'Ars Technica Science',
		site_URL: 'https://arstechnica.com/science/',
		feed_URL: 'https://feeds.arstechnica.com/arstechnica/science',
		icon_URL:
			'https://cdn.arstechnica.net/wp-content/uploads/2016/10/cropped-ars-logo-512_480-300x300.png',
		description: __(
			'Science reporting covering research, space, the environment, and the evidence behind discoveries.'
		),
	},
	{
		feed_ID: 183302414,
		site_ID: 0,
		name: 'Live Science',
		site_URL: 'https://www.livescience.com/',
		feed_URL: 'https://www.livescience.com/feeds/all',
		icon_URL: 'https://cdn.mos.cms.futurecdn.net/flexiimages/ze6kddeaxb1774625505.png',
		description: __(
			'Science news and explanations about our planet, the human body, and the wider universe.'
		),
	},
	{
		feed_ID: 139887294,
		site_ID: 0,
		name: 'Nature',
		site_URL: 'https://www.nature.com/',
		feed_URL: 'https://www.nature.com/nature.rss',
		icon_URL:
			'https://www.nature.com/static/images/favicons/nature/apple-touch-icon-f39cb19454.png',
		description: __(
			'Research highlights, science journalism, and discoveries from a multidisciplinary science journal.'
		),
	},
	{
		feed_ID: 67034007,
		site_ID: 0,
		name: 'ScienceDaily',
		site_URL: 'https://www.sciencedaily.com/',
		feed_URL: 'https://www.sciencedaily.com/rss/all.xml',
		icon_URL: 'https://www.sciencedaily.com/images/scidaily-icon.png',
		description: __(
			'Research news and summaries covering science, health, technology, and the natural world.'
		),
	},
	{
		feed_ID: 86293713,
		site_ID: 0,
		name: 'Physics World',
		site_URL: 'https://physicsworld.com/',
		feed_URL: 'https://physicsworld.com/feed/',
		icon_URL: 'https://physicsworld.com/favicon.ico',
		description: __(
			'Reporting and explanations about physics research, discoveries, and the people behind them.'
		),
	},
];
