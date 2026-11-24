import { __ } from '@wordpress/i18n';
import type { RecommendedBlog } from './types';

export const getPoliticsBlogs = (): RecommendedBlog[] => [
	{
		feed_ID: 8941811,
		site_ID: 0,
		name: 'Pew Research Center',
		site_URL: 'https://www.pewresearch.org/',
		feed_URL: 'https://www.pewresearch.org/feed/',
		icon_URL: 'https://www.pewresearch.org/wp-content/images/symbol-alt.svg',
		description: __(
			'Nonpartisan polling and research on public opinion, politics, and social trends.'
		),
	},
	{
		feed_ID: 128711904,
		site_ID: 201940957,
		name: 'The Hill',
		site_URL: 'https://thehill.com/',
		feed_URL: 'https://thehill.com/feed/',
		icon_URL:
			'https://thehill.com/wp-content/uploads/sites/2/2023/03/cropped-favicon-512px-1.png?w=180',
		description: __( 'Centrist reporting on Congress, elections, and public policy.' ),
	},
	{
		feed_ID: 9060689,
		site_ID: 0,
		name: 'The Christian Science Monitor: USA',
		site_URL: 'https://www.csmonitor.com/USA',
		feed_URL: 'https://rss.csmonitor.com/feeds/usa',
		icon_URL: 'https://www.csmonitor.com/bundles/csm/images/favicon/apple-touch-icon.png',
		description: __(
			'Centrist reporting and analysis of politics and public life in the United States.'
		),
	},
	{
		feed_ID: 19867761,
		site_ID: 0,
		name: 'Newsweek',
		site_URL: 'https://www.newsweek.com/',
		feed_URL: 'https://www.newsweek.com/rss.xml',
		icon_URL: 'https://www.newsweek.com/apple-touch-icon.png',
		description: __( 'Centrist news and analysis of politics, world affairs, and public life.' ),
	},
	{
		feed_ID: 53919197,
		site_ID: 0,
		name: 'The Atlantic: Politics',
		site_URL: 'https://www.theatlantic.com/politics/',
		feed_URL: 'https://www.theatlantic.com/feed/channel/politics/',
		icon_URL:
			'https://cdn.theatlantic.com/_next/static/images/apple-touch-icon-152x152-aafde20dd981a38fcd549b29b2b3b785.png',
		description: __(
			'Left-leaning reporting and analysis of American politics and public policy.'
		),
	},
	{
		feed_ID: 20957468,
		site_ID: 0,
		name: 'Vox',
		site_URL: 'https://www.vox.com/',
		feed_URL: 'https://www.vox.com/rss/index.xml',
		icon_URL: 'https://www.vox.com/static-assets/icons/android-chrome-512x512.png',
		description: __(
			'Progressive explanations of politics, public policy, and the ideas behind the news.'
		),
	},
	{
		feed_ID: 67788138,
		site_ID: 130213978,
		name: 'Mother Jones',
		site_URL: 'https://www.motherjones.com/',
		feed_URL: 'https://www.motherjones.com/feed/',
		icon_URL:
			'https://www.motherjones.com/wp-content/uploads/2017/09/cropped-favicon-512x512.png?w=180',
		description: __(
			'Progressive investigative reporting and commentary on politics and public affairs.'
		),
	},
	{
		feed_ID: 172685313,
		site_ID: 0,
		name: 'Slow Boring',
		site_URL: 'https://www.slowboring.com/',
		feed_URL: 'https://www.slowboring.com/feed',
		icon_URL:
			'https://substackcdn.com/image/fetch/$s_!huzz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae5b8f8f-f67d-479c-9173-ff000d8f1b50%2Fapple-touch-icon-1024x1024.png',
		description: __(
			'Center-left commentary on politics, economics, and public policy from Matthew Yglesias.'
		),
	},
	{
		feed_ID: 82849431,
		site_ID: 0,
		name: 'National Review',
		site_URL: 'https://www.nationalreview.com/',
		feed_URL: 'https://www.nationalreview.com/feed/',
		icon_URL: 'https://www.nationalreview.com/apple-icon.png?apple-icon.39ovsxurdk46o.png',
		description: __( 'Conservative reporting, political analysis, and opinion.' ),
	},
	{
		feed_ID: 176242847,
		site_ID: 244949569,
		name: 'Washington Examiner',
		site_URL: 'https://www.washingtonexaminer.com/',
		feed_URL: 'https://www.washingtonexaminer.com/feed/',
		icon_URL:
			'https://www.washingtonexaminer.com/wp-content/uploads/2023/11/cropped-favicon.png?w=192',
		description: __(
			'Conservative reporting and commentary on Washington, elections, and public policy.'
		),
	},
	{
		feed_ID: 135063033,
		site_ID: 205853250,
		name: 'The Dispatch',
		site_URL: 'https://thedispatch.com/',
		feed_URL: 'https://thedispatch.com/feed/',
		icon_URL: 'https://thedispatch.com/wp-content/uploads/2025/08/cropped-td_favicon.png?w=192',
		description: __( 'Conservative reporting and analysis of politics, policy, and culture.' ),
	},
	{
		feed_ID: 24726072,
		site_ID: 56206191,
		name: 'The American Conservative',
		site_URL: 'https://www.theamericanconservative.com/',
		feed_URL: 'https://www.theamericanconservative.com/feed/',
		icon_URL: 'https://www.theamericanconservative.com/wp-content/themes/tac/dist/img/favicon.ico',
		description: __( 'Conservative commentary on politics, foreign policy, and public life.' ),
	},
];
