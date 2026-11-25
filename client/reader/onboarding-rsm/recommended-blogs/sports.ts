import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getSportsBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 29374649,
		site_ID: 67503185,
		name: 'Awful Announcing',
		site_URL: 'https://awfulannouncing.com/',
		feed_URL: 'https://awfulannouncing.com/feed',
		icon_URL: 'https://cdn1.thecomeback.com/wp-content/uploads/sites/94/2024/07/180AAlogo.png',
		description: __(
			'Reporting and commentary on sports broadcasting, streaming, and the media business.'
		),
	},
	{
		feed_ID: 50066777,
		site_ID: 0,
		name: 'BBC Sport',
		site_URL: 'https://www.bbc.com/sport',
		feed_URL: 'https://feeds.bbci.co.uk/sport/rss.xml',
		icon_URL:
			'https://static.files.bbci.co.uk/core/website/assets/static/icons/touch/sport/touch-icon-180.f21cfb03df.png',
		description: __( 'Sports news and analysis from Britain and around the world.' ),
	},
	{
		feed_ID: 68735262,
		site_ID: 0,
		name: 'The Guardian Sport',
		site_URL: 'https://www.theguardian.com/sport',
		feed_URL: 'https://www.theguardian.com/sport/rss',
		icon_URL: 'https://assets.guim.co.uk/static/frontend/icons/homescreen/apple-touch-icon.svg',
		description: __( 'Reporting and commentary on football, cricket, tennis, and global sport.' ),
	},
	{
		feed_ID: 108818236,
		site_ID: 0,
		name: 'Defector',
		site_URL: 'https://defector.com/',
		feed_URL: 'https://defector.com/feed/',
		icon_URL:
			'https://lede-admin.defector.com/wp-content/uploads/sites/28/2023/09/cropped-defector-circle_avatar512-1.png',
		description: __( 'Independent reporting, essays, and sharp commentary on sports and culture.' ),
	},
	{
		feed_ID: 66221668,
		site_ID: 0,
		name: 'SB Nation',
		site_URL: 'https://www.sbnation.com/',
		feed_URL: 'https://www.sbnation.com/rss/index.xml',
		icon_URL: 'https://www.sbnation.com/static-assets/icons/apple-touch-icon.png',
		description: __( 'Sports stories, fan perspectives, and coverage across teams and leagues.' ),
	},
	{
		feed_ID: 96386926,
		site_ID: 0,
		name: 'FanGraphs',
		site_URL: 'https://blogs.fangraphs.com/',
		feed_URL: 'https://blogs.fangraphs.com/feed/',
		icon_URL: 'https://www.fangraphs.com/favicon.ico',
		description: __( 'Baseball analysis, player evaluation, and insights grounded in statistics.' ),
	},
	{
		feed_ID: 85660184,
		site_ID: 0,
		name: 'The Sporting News',
		site_URL: 'https://www.sportingnews.com/us',
		feed_URL: 'https://www.sportingnews.com/us/rss',
		icon_URL:
			'https://static-nw-production.sportingnews.com/011f180b410200dff2b0a0e4d45eba3978210e73-static/assets/images/favicon.ico',
		description: __( 'News, analysis, and stories from major sports around the world.' ),
	},
	{
		feed_ID: 21690516,
		site_ID: 45368137,
		name: 'FanSided',
		site_URL: 'https://fansided.com/',
		feed_URL: 'https://fansided.com/feed/',
		icon_URL:
			'https://images2.minutemediacdn.com/image/upload/v1687364198/shape/cover/sport/favicon_2-3c2b63dbd5e0b19d46e630e3ca0b8f92.ico',
		description: __( 'Sports news, opinion, and conversations for passionate fans.' ),
	},
	{
		feed_ID: 95839735,
		site_ID: 142724334,
		name: 'RaceFans',
		site_URL: 'https://www.racefans.net/',
		feed_URL: 'https://www.racefans.net/feed/',
		icon_URL: 'https://www.racefans.net/apple-touch-icon.png',
		description: __( 'Formula 1 news, race analysis, and conversations for motorsport fans.' ),
	},
	{
		feed_ID: 64211196,
		site_ID: 0,
		name: 'The Comeback',
		site_URL: 'https://thecomeback.com/',
		feed_URL: 'https://thecomeback.com/feed',
		icon_URL: 'https://cdn1.thecomeback.com/wp-content/uploads/2024/07/TCB-LOGO-square-180.png',
		description: __( 'Sports news, commentary, and the stories people are talking about.' ),
	},
	{
		feed_ID: 68363948,
		site_ID: 0,
		name: 'DC Rainmaker',
		site_URL: 'https://www.dcrainmaker.com/',
		feed_URL: 'https://www.dcrainmaker.com/feed',
		icon_URL: 'https://media.dcrainmaker.com/images/2017/03/dcrainmaker-dc-logo-square.png',
		description: __( 'Detailed tests of sports watches, cycling devices, and fitness technology.' ),
	},
	{
		feed_ID: 43999458,
		site_ID: 92124015,
		name: 'MLB Trade Rumors',
		site_URL: 'https://www.mlbtraderumors.com/',
		feed_URL: 'https://www.mlbtraderumors.com/feed',
		icon_URL:
			'https://cdn.mlbtraderumors.com/wp-content/themes/mlbtr2015/images/apple-touch-icon.png?v=ngkBbGyONn',
		description: __( 'Baseball trade news, roster moves, and analysis of the player market.' ),
	},
];
