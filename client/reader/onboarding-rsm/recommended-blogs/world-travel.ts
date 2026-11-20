import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getWorldTravelBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 50426619,
		site_ID: 0,
		name: 'Atlas Obscura',
		site_URL: 'https://www.atlasobscura.com/',
		feed_URL: 'https://www.atlasobscura.com/feeds/latest',
		icon_URL:
			'https://img.atlasobscura.com/j-xg8FDByF8DTcfMgVpd9SN8tqSa3aZa3T6gk1vSwgo/sm:1/scp:1/aHR0cHM6Ly9zMy5h/bWF6b25hd3MuY29t/L2F0bGFzLWRldi9t/aXNjL2ljb25zL2Fw/cGxlLXRvdWNoLWlj/b24ucG5n',
		description: __(
			'Unusual places, hidden histories, and discoveries for curious travelers around the world.'
		),
	},
	{
		feed_ID: 5722,
		site_ID: 0,
		name: 'Matador Network',
		site_URL: 'https://matadornetwork.com/',
		feed_URL: 'https://matadornetwork.com/feed/',
		icon_URL: 'https://matadornetwork.com/apple-touch-icon.png',
		description: __(
			'Travel stories and destination guides connecting people, cultures, and outdoor adventures.'
		),
	},
	{
		feed_ID: 43994785,
		site_ID: 33666834,
		name: 'Roads & Kingdoms',
		site_URL: 'https://roadsandkingdoms.com/',
		feed_URL: 'https://roadsandkingdoms.com/feed/',
		icon_URL: 'https://roadsandkingdoms.com/favicon.ico',
		description: __( 'Stories about food, culture, and the people who make places distinctive.' ),
	},
	{
		feed_ID: 25867223,
		site_ID: 0,
		name: 'Adventure.com',
		site_URL: 'https://adventure.com/',
		feed_URL: 'https://adventure.com/feed/',
		icon_URL: 'https://adventure.com/wp-content/uploads/2017/03/cropped-small_black-180x180.png',
		description: __(
			'Thoughtful travel journalism about people, places, and exploring the world responsibly.'
		),
	},
	{
		feed_ID: 183302265,
		site_ID: 0,
		name: 'AFAR',
		site_URL: 'https://www.afar.com/',
		feed_URL: 'https://www.afar.com/rss',
		icon_URL: 'https://www.afar.com/apple-touch-icon.png',
		description: __(
			'Travel reporting and practical guides focused on culture, communities, and meaningful journeys.'
		),
	},
	{
		feed_ID: 117449038,
		site_ID: 0,
		name: 'Travel Dudes',
		site_URL: 'https://traveldudes.com/',
		feed_URL: 'https://traveldudes.com/feed/',
		icon_URL: 'https://traveldudes.com/wp-content/uploads/2019/10/Favicon-TD-2_trans.png',
		description: __(
			'Destination advice and local discoveries shared by travelers exploring around the world.'
		),
	},
	{
		feed_ID: 183302270,
		site_ID: 0,
		name: 'Wanderlust Magazine',
		site_URL: 'https://www.wanderlustmagazine.com/',
		feed_URL: 'https://www.wanderlustmagazine.com/feed/',
		icon_URL: 'https://www.wanderlustmagazine.com/apple-touch-icon.png',
		description: __(
			'Destination stories, cultural encounters, and ideas for curious independent travelers.'
		),
	},
	{
		feed_ID: 67026190,
		site_ID: 0,
		name: 'Lost With Purpose',
		site_URL: 'https://www.lostwithpurpose.com/',
		feed_URL: 'https://www.lostwithpurpose.com/feed/',
		icon_URL:
			'https://www.lostwithpurpose.com/wp-content/themes/Wander-child/img/favicon/favicon-152.png',
		description: __(
			'Solo travel stories and practical guides to places beyond familiar tourist routes.'
		),
	},
	{
		feed_ID: 143409145,
		site_ID: 0,
		name: 'The Common Wanderer',
		site_URL: 'https://www.thecommonwanderer.com/',
		feed_URL: 'https://www.thecommonwanderer.com/blog?format=rss',
		icon_URL:
			'https://images.squarespace-cdn.com/content/v1/5a3bb03b4c326d76de73ddaa/28981f09-aaa8-4d24-a806-0b5222a78bbe/favicon.ico',
		description: __(
			'Responsible travel guides and photography rooted in local experiences and outdoor adventures.'
		),
	},
	{
		feed_ID: 139324151,
		site_ID: 0,
		name: 'Time Travel Turtle',
		site_URL: 'https://www.timetravelturtle.com/',
		feed_URL: 'https://www.timetravelturtle.com/feed/',
		icon_URL:
			'https://cdn.shortpixel.ai/spai/q_glossy+ret_img/www.timetravelturtle.com/wp-content/uploads/2023/05/logo-blue.png',
		description: __(
			'Travel stories exploring cultural heritage, local people, and places beyond the usual itinerary.'
		),
	},
	{
		feed_ID: 23250985,
		site_ID: 0,
		name: 'Never Ending Voyage',
		site_URL: 'https://www.neverendingvoyage.com/',
		feed_URL: 'https://www.neverendingvoyage.com/feed/',
		icon_URL:
			'https://www.neverendingvoyage.com/wp-content/uploads/2017/11/cropped-nev-favicon-180x180.png',
		description: __(
			'Independent travel guides, practical itineraries, and ideas for carrying less on longer journeys.'
		),
	},
	{
		feed_ID: 85473636,
		site_ID: 0,
		name: 'Against the Compass',
		site_URL: 'https://againstthecompass.com/en/',
		feed_URL: 'https://againstthecompass.com/en/feed/',
		icon_URL:
			'https://againstthecompass.com/wp-content/uploads/2018/10/cropped-ATC-Icon-512-final-300x300.png',
		description: __(
			'Independent travel stories and practical guides to destinations beyond the usual routes.'
		),
	},
];
