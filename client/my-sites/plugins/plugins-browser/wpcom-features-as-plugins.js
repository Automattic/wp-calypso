/**
 * External dependencies
 */
import { identity } from 'lodash';

/**
 * Internal dependencies
 */

import {
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_ADVANCED_SEO,
	FEATURE_VIDEO_UPLOADS,
} from 'lib/plans/constants';

const wpcomFeaturesAsPlugins = ( translate = identity ) => [
	{
		category: 'engagement',
		name: translate( 'Engagement' ),
		icon: 'stats-alt',
		plugins: [
			{
				name: translate( 'Stats' ),
				link: 'https://wordpress.com/support/stats/',
				description: translate( "View your site's visits, referrers, and more." ),
				plan: 'standard',
			},
			{
				name: translate( 'SEO Tools' ),
				link: 'https://wordpress.com/support/seo-tools/',
				description: translate( 'Custom meta descriptions, social media previews, and more.' ),
				plan: 'business',
				feature: FEATURE_ADVANCED_SEO,
			},
			{
				name: translate( 'Google Analytics' ),
				link: 'https://wordpress.com/support/google-analytics/',
				description: translate(
					'Advanced features to complement WordPress.com stats. Funnel reports, goal conversion, and more.'
				),
				plan: 'business',
				feature: FEATURE_GOOGLE_ANALYTICS,
			},
			{
				name: translate( 'Social Media' ),
				link: 'https://wordpress.com/support/sharing/',
				description: translate( 'Add social media buttons to your posts and pages.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Publicize' ),
				link: 'https://wordpress.com/support/publicize/',
				description: translate(
					'Automatically share your posts on Facebook, Twitter, Tumblr, and more.'
				),
				plan: 'standard',
			},
			{
				name: translate( 'Email Subscriptions' ),
				link: 'https://wordpress.com/support/follow-blog-widget/',
				description: translate(
					'Enables your readers to sign up to receive your posts via email.'
				),
				plan: 'standard',
			},
			{
				name: translate( 'Related Posts' ),
				link: 'https://wordpress.com/support/related-posts/',
				description: translate(
					'Pulls relevant content from your blog to display at the bottom of your posts.'
				),
				plan: 'standard',
			},
			{
				name: translate( 'Likes' ),
				link: 'https://wordpress.com/support/likes/',
				description: translate( 'Engage readers with a Like button on your posts.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Advanced Comments' ),
				link: 'https://wordpress.com/support/comments/',
				description: translate( 'Comment likes, user mentions, notifications, and more.' ),
				plan: 'standard',
			},
		],
	},
	{
		category: 'security',
		name: translate( 'Security' ),
		icon: 'spam',
		plugins: [
			{
				name: translate( 'Security Scanning' ),
				link: 'https://wordpress.com/support/security/',
				description: translate( 'Constant monitoring of your site for threats.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Backup & Export' ),
				link: 'https://wordpress.com/support/export/#backups',
				description: translate( '24/7 backup of your entire site. Export everything.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Akismet' ),
				link: 'http://akismet.com/',
				description: translate( 'Advanced anti-spam security.' ),
				plan: 'standard',
			},
		],
	},
	{
		category: 'appearance',
		name: translate( 'Appearance' ),
		icon: 'customize',
		plugins: [
			{
				name: translate( 'Advanced Galleries' ),
				link: 'https://wordpress.com/support/images/gallery/',
				description: translate( 'Tiled, mosaic, slideshows, and more.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Extended Customizer' ),
				link: 'https://wordpress.com/support/customizer/',
				description: translate( 'Edit colors and backgrounds.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Custom Design' ),
				link: 'https://wordpress.com/support/custom-design/',
				description: translate(
					"Customize your blog's look with custom fonts, a CSS editor, and more."
				),
				plan: 'premium',
				feature: FEATURE_ADVANCED_DESIGN,
			},
			{
				name: translate( 'Extended Widgets' ),
				link: 'https://wordpress.com/support/category/widgets-sidebars/',
				description: translate( 'Eventbrite, Flickr, Google Calendar, and more.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Infinite Scroll' ),
				link: 'https://wordpress.com/support/infinite-scroll/',
				description: translate(
					'Load more posts when you reach the bottom of a page on your site.'
				),
				plan: 'standard',
			},
			{
				name: translate( 'Photon CDN' ),
				link: 'https://jetpack.com/support/photon/',
				description: translate( 'Faster image loading and editing.' ),
				plan: 'standard',
			},
		],
	},
	{
		category: 'writing',
		name: translate( 'Writing' ),
		icon: 'pencil',
		plugins: [
			{
				name: translate( 'Form Builder' ),
				link: 'https://wordpress.com/support/contact-form/',
				description: translate( 'Build contact forms so visitors can get in touch.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Extended Shortcodes' ),
				link: 'https://wordpress.com/support/shortcodes/',
				description: translate( 'YouTube, Twitter, Instagram, Spotify, and more.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Video Uploads' ),
				link: 'https://wordpress.com/support/videopress/',
				description: translate( 'Upload and host your video files on your site with VideoPress.' ),
				plan: 'premium',
				feature: FEATURE_VIDEO_UPLOADS,
			},
			{
				name: translate( 'Importer' ),
				link: 'https://wordpress.com/support/import/',
				description: translate(
					'Import your blog content from a variety of other blogging platforms.'
				),
				plan: 'standard',
			},
			{
				name: translate( 'Polls & Surveys' ),
				link: 'https://wordpress.com/support/polls/',
				description: translate( 'Add polls and surveys to your site.' ),
				plan: 'standard',
			},
			{
				name: translate( 'Markdown' ),
				link: 'https://wordpress.com/support/markdown/',
				description: translate( 'Text formatting using a lightweight markup language.' ),
				plan: 'standard',
			},
		],
	},
];

export default wpcomFeaturesAsPlugins;
