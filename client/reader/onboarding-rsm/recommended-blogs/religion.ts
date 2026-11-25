import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getReligionBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 48198799,
		site_ID: 0,
		name: 'Religion News Service',
		site_URL: 'https://religionnews.com/',
		feed_URL: 'https://religionnews.com/feed/',
		icon_URL:
			'https://religionnews.com/wp-content/uploads/2024/09/cropped-RNS-logo-favicon@3x-192x192.png',
		description: __( 'Independent news about religion, belief, and their roles in public life.' ),
	},
	{
		feed_ID: 122622432,
		site_ID: 193521692,
		name: 'The Revealer',
		site_URL: 'https://therevealer.org/',
		feed_URL: 'https://therevealer.org/feed/',
		icon_URL: 'https://therevealer.org/wp-content/uploads/2017/11/cropped-icon-192x192.png',
		description: __( 'Scholarship and journalism examining religion, media, and society.' ),
	},
	{
		feed_ID: 181375584,
		site_ID: 0,
		name: 'Harvard Divinity Bulletin',
		site_URL: 'https://bulletin.hds.harvard.edu/',
		feed_URL: 'https://bulletin.hds.harvard.edu/feed/',
		icon_URL:
			'https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/4/9/files/2019/11/fav-icon-250x250.png',
		description: __(
			'Nonsectarian essays and scholarship on religious traditions and contemporary life.'
		),
	},
	{
		feed_ID: 162180674,
		site_ID: 0,
		name: 'Christianity Today',
		site_URL: 'https://www.christianitytoday.com/',
		feed_URL: 'https://www.christianitytoday.com/feed/',
		icon_URL:
			'https://www.christianitytoday.com/wp-content/uploads/2024/07/cropped-ct_site_icon.png?w=192',
		description: __(
			'Evangelical Christian reporting and commentary on faith, culture, and public life.'
		),
	},
	{
		feed_ID: 172031551,
		site_ID: 247153970,
		name: 'America Magazine',
		site_URL: 'https://www.americamagazine.org/',
		feed_URL: 'https://www.americamagazine.org/feed/',
		icon_URL:
			'https://i0.wp.com/www.americamagazine.org/wp-content/uploads/2025/07/cropped-512x5124-1.jpg?fit=180%2C180&ssl=1',
		description: __( 'Jesuit and Catholic perspectives on faith, culture, and public affairs.' ),
	},
	{
		feed_ID: 58133127,
		site_ID: 0,
		name: 'Jewish Telegraphic Agency',
		site_URL: 'https://www.jta.org/',
		feed_URL: 'https://www.jta.org/feed',
		icon_URL: 'https://www.jta.org/wp-content/uploads/2024/04/cropped-JTA-Favicon-192x192.png',
		description: __( 'News and reporting about Jewish communities around the world.' ),
	},
	{
		feed_ID: 33815871,
		site_ID: 82518232,
		name: 'Kveller',
		site_URL: 'https://www.kveller.com/',
		feed_URL: 'https://www.kveller.com/feed/',
		icon_URL:
			'https://www.kveller.com/wp-content/uploads/2014/12/cropped-Kveller_Mark_orng_cranb-192x192.png',
		description: __( 'Jewish perspectives on family life, culture, traditions, and identity.' ),
	},
	{
		feed_ID: 32772615,
		site_ID: 1128588,
		name: 'MuslimMatters',
		site_URL: 'https://muslimmatters.org/',
		feed_URL: 'https://muslimmatters.org/feed/',
		icon_URL:
			'https://muslimmatters.org/wp-content/uploads/cropped-MM-Logo-500-px-white-bg-192x192.png',
		description: __( 'Muslim perspectives on faith, family, community, and public life.' ),
	},
	{
		feed_ID: 47484897,
		site_ID: 0,
		name: 'Tricycle',
		site_URL: 'https://tricycle.org/',
		feed_URL: 'https://tricycle.org/feed/',
		icon_URL:
			'https://tricycle.org/wp-content/uploads/2026/08/cropped-tricycle-site-icon-192x192.png',
		description: __(
			'Buddhist teachings, practice, culture, and conversations across traditions.'
		),
	},
	{
		feed_ID: 17717663,
		site_ID: 63677137,
		name: 'Sanskriti Magazine',
		site_URL: 'https://www.sanskritimagazine.com/',
		feed_URL: 'https://www.sanskritimagazine.com/feed/',
		icon_URL:
			'https://www.sanskritimagazine.com/wp-content/uploads/2021/11/cropped-Sanskriti-Favicon-Logo-192x192.png',
		description: __( 'Hindu traditions, festivals, spiritual practice, and cultural heritage.' ),
	},
	{
		feed_ID: 9066211,
		site_ID: 0,
		name: "Baha'i World News Service",
		site_URL: 'https://news.bahai.org/',
		feed_URL: 'https://news.bahai.org/rss.xml',
		icon_URL: 'https://news.bahai.org/apple-touch-icon.png',
		description: __(
			'News about Bahá’í communities, service, and social development around the world.'
		),
	},
	{
		feed_ID: 76130018,
		site_ID: 0,
		name: 'The Immanent Frame',
		site_URL: 'https://tif.ssrc.org/',
		feed_URL: 'https://tif.ssrc.org/feed/',
		icon_URL:
			'https://ssrc-static.s3.amazonaws.com/wp-content/uploads/2026/03/09154012/cropped-The_Immanent_Frame_Logo-1-e1773085175943-192x192.png',
		description: __( 'Scholarly discussion of religion, secularism, and the public sphere.' ),
	},
];
