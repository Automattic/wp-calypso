import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getHistoryBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 138963646,
		site_ID: 161773962,
		name: 'A Collection of Unmitigated Pedantry',
		site_URL: 'https://acoup.blog/',
		feed_URL: 'https://acoup.blog/feed/',
		icon_URL:
			'https://i0.wp.com/acoup.blog/wp-content/uploads/2019/05/cropped-altar-of-domitius-ahenobarb-1-1.jpg?fit=180%2C180&ssl=1',
		description: __( 'Deep historical analysis of warfare, society, and portrayals of the past.' ),
	},
	{
		feed_ID: 179563454,
		site_ID: 249134001,
		name: 'How-to History',
		site_URL: 'https://how-to-history.com',
		feed_URL: 'https://how-to-history.com/feed/',
		icon_URL:
			'https://i0.wp.com/how-to-history.com/wp-content/uploads/2025/10/cropped-how-to-history.png?fit=180%2C180&ssl=1',
		description: __(
			'Practical advice on researching history, using archives, and understanding historical sources.'
		),
	},
	{
		feed_ID: 176882310,
		site_ID: 191886633,
		name: 'History of the Germans Podcast',
		site_URL: 'https://historyofthegermans.com',
		feed_URL: 'https://historyofthegermans.com/feed/',
		icon_URL:
			'https://i0.wp.com/historyofthegermans.com/wp-content/uploads/2023/10/cropped-Option-13.jpg?fit=180%2C180&ssl=1',
		description: __( 'Stories and analysis exploring the history of German-speaking Europe.' ),
	},
	{
		feed_ID: 178012027,
		site_ID: 42179464,
		name: 'The History of Parliament',
		site_URL: 'https://historyofparliament.com',
		feed_URL: 'https://historyofparliament.com/feed/',
		icon_URL:
			'https://i0.wp.com/historyofparliament.com/wp-content/uploads/2026/07/Site-Icon.png?fit=180%2C180&ssl=1',
		description: __(
			'Research and stories about Britain’s parliamentary history and the people who shaped it.'
		),
	},
	{
		feed_ID: 9002220,
		site_ID: 9563068,
		name: 'The History Blog',
		site_URL: 'http://www.thehistoryblog.com/',
		feed_URL: 'http://www.thehistoryblog.com/feed',
		icon_URL:
			'https://www.thehistoryblog.com/wp-content/uploads/2023/01/cropped-mygravatar-180x180.png',
		description: __( 'Discoveries, archaeology, and curious stories from the past.' ),
	},
	{
		feed_ID: 111739841,
		site_ID: 181957101,
		name: 'Living London History',
		site_URL: 'https://livinglondonhistory.com/',
		feed_URL: 'http://livinglondonhistory.com/feed',
		icon_URL:
			'https://i0.wp.com/livinglondonhistory.com/wp-content/uploads/2021/06/cropped-Living-London-HIstory-3.png?fit=180%2C180&ssl=1',
		description: __( 'London’s history explored through walks, hidden places, and local stories.' ),
	},
	{
		feed_ID: 144373922,
		site_ID: 0,
		name: 'History Facts',
		site_URL: 'https://historyfacts.com/',
		feed_URL: 'http://historyfacts.com/feed',
		icon_URL:
			'https://media.historyfacts.com/s3:inbox-media-offload.historyfacts.com/wp-content/uploads/2023/06/favicon.png',
		description: __(
			'Short, researched stories about people, events, and everyday life in the past.'
		),
	},
	{
		feed_ID: 23060057,
		site_ID: 21638101,
		name: 'History Workshop',
		site_URL: 'https://www.historyworkshop.org.uk/',
		feed_URL: 'https://www.historyworkshop.org.uk/feed/',
		icon_URL:
			'https://i0.wp.com/www.historyworkshop.org.uk/wp-content/uploads/2022/10/cropped-history-workshop-favicon.png?fit=180%2C180&ssl=1',
		description: __( 'Accessible historical scholarship connecting the past with public debate.' ),
	},
	{
		feed_ID: 50426619,
		site_ID: 0,
		name: 'Atlas Obscura',
		site_URL: 'https://www.atlasobscura.com/',
		feed_URL: 'https://www.atlasobscura.com/feeds/latest',
		icon_URL:
			'https://img.atlasobscura.com/j-xg8FDByF8DTcfMgVpd9SN8tqSa3aZa3T6gk1vSwgo/sm:1/scp:1/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2F0bGFzLWRldi9t/aXNjL2ljb25zL2Fw/cGxlLXRvdWNoLWlj/b24ucG5n',
		description: __(
			'Curious histories, cultural discoveries, and hidden places around the world.'
		),
	},
	{
		feed_ID: 52143309,
		site_ID: 0,
		name: 'JSTOR Daily',
		site_URL: 'https://daily.jstor.org/',
		feed_URL: 'https://daily.jstor.org/feed/',
		icon_URL:
			'https://daily.jstor.org/wp-content/uploads/2016/05/JSTOR_Daily_logo_square-copy-300x300.jpg',
		description: __(
			'Accessible stories linking historical scholarship with contemporary questions.'
		),
	},
	{
		feed_ID: 103309695,
		site_ID: 0,
		name: 'Public Domain Review',
		site_URL: 'https://publicdomainreview.org/',
		feed_URL: 'https://publicdomainreview.org/rss.xml',
		icon_URL: 'https://publicdomainreview.org/apple-icon-180x180.png',
		description: __(
			'Historical art, literature, and curious discoveries from the public domain.'
		),
	},
	{
		feed_ID: 33925087,
		site_ID: 0,
		name: 'Smithsonian Magazine',
		site_URL: 'https://www.smithsonianmag.com/',
		feed_URL: 'https://www.smithsonianmag.com/rss/latest_articles/',
		icon_URL:
			'https://www.smithsonianmag.com/static/smithsonianmag/img/smithmag-favicon-logo.cb31c6e193dd.png',
		description: __( 'Reporting on history, archaeology, science, and cultural discoveries.' ),
	},
];
