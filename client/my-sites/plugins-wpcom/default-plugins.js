import i18n from 'i18n-calypso';

/**
 * Standard plugins list
 */
export const defaultStandardPlugins = [
	{
		name: i18n.translate( 'Stats' ),
		descriptionLink: 'https://support.wordpress.com/stats/',
		icon: 'stats-alt',
		category: 'Traffic Growth',
		description: i18n.translate( 'View your site\'s visits, referrers, and more.' )
	},
	{
		name: i18n.translate( 'Essential SEO' ),
		descriptionLink: 'http://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/',
		icon: 'search',
		category: 'Traffic Growth',
		description: i18n.translate( 'Search engine optimization and sitemaps.' )
	},
	{
		name: i18n.translate( 'Security Scanning' ),
		descriptionLink: 'https://support.wordpress.com/security/',
		icon: 'lock',
		category: 'Performance',
		description: i18n.translate( 'Constant monitoring of your site for threats.' )
	},
	{
		name: i18n.translate( 'Advanced Galleries' ),
		descriptionLink: 'https://support.wordpress.com/images/gallery/',
		icon: 'image-multiple',
		category: 'Appearance',
		description: i18n.translate( 'Tiled, mosaic, slideshows, and more.' )
	},
	{
		name: i18n.translate( 'Social Media' ),
		descriptionLink: 'https://support.wordpress.com/sharing/',
		icon: 'share',
		category: 'Traffic Growth',
		description: i18n.translate( 'Add social media buttons to your posts and pages.' )
	},
	{
		name: i18n.translate( 'Form Builder' ),
		descriptionLink: 'https://support.wordpress.com/contact-form/',
		icon: 'mention',
		category: 'Appearance',
		description: i18n.translate( 'Build contact forms so visitors can get in touch.' )
	},
	{
		name: i18n.translate( 'Publicize' ),
		descriptionLink: 'https://support.wordpress.com/publicize/',
		icon: 'share',
		category: 'Traffic Growth',
		description: i18n.translate( 'Automatically share your posts on Facebook, Twitter, Tumblr, and more.' )
	},
	{
		name: i18n.translate( 'Email Subscriptions' ),
		descriptionLink: 'https://support.wordpress.com/widgets/follow-blog-widget/',
		icon: 'mail',
		category: 'Misc',
		description: i18n.translate( 'Enables your readers to sign up to receive your posts via email.' )
	},
	{
		name: i18n.translate( 'Extended Customizer' ),
		descriptionLink: 'https://support.wordpress.com/customizer/',
		icon: 'customize',
		category: 'Appearance',
		description: i18n.translate( 'Edit colors and backgrounds.' )
	},
	{
		name: i18n.translate( 'Extended Widgets' ),
		descriptionLink: 'https://support.wordpress.com/category/widgets-sidebars/',
		icon: 'calendar',
		category: 'Appearance',
		description: i18n.translate( 'Eventbrite, Flickr, Google Calendar, and more.' )
	},
	{
		name: i18n.translate( 'Backup & Export' ),
		descriptionLink: 'https://support.wordpress.com/export/#backups',
		icon: 'lock',
		category: 'Security',
		description: i18n.translate( '24/7 backup of your entire site. Export everything.' )
	},
	{
		name: i18n.translate( 'Akismet' ),
		descriptionLink: 'http://akismet.com/',
		icon: 'lock',
		category: 'Security',
		description: i18n.translate( 'Advanced anti-spam security.' )
	},
	{
		name: i18n.translate( 'Extended Shortcodes' ),
		descriptionLink: 'https://support.wordpress.com/shortcodes/',
		icon: 'pencil',
		category: 'Misc',
		description: i18n.translate( 'YouTube, Twitter, Instagram, Spotify, and more.' )
	},
	{
		name: i18n.translate( 'Importer' ),
		descriptionLink: 'https://support.wordpress.com/import/',
		icon: 'cloud-download',
		category: 'Misc',
		description: i18n.translate( 'Import your blog content from a variety of other blogging platforms.' )
	},
	{
		name: i18n.translate( 'Infinite Scroll' ),
		descriptionLink: 'https://support.wordpress.com/infinite-scroll/',
		icon: 'posts',
		category: 'Appearance',
		description: i18n.translate( 'Load more posts when you reach the bottom of a page on your site.' )
	},
	{
		name: i18n.translate( 'Related Posts' ),
		descriptionLink: 'https://support.wordpress.com/related-posts/',
		icon: 'posts',
		category: 'Appearance',
		description: i18n.translate( 'Pulls relevant content from your blog to display at the bottom of your posts.' )
	},
	{
		name: i18n.translate( 'Polls & Surveys' ),
		descriptionLink: 'https://support.wordpress.com/polls/',
		icon: 'stats',
		category: 'Misc',
		description: i18n.translate( 'Add polls and surveys to your site.' )
	},
	{
		name: i18n.translate( 'Markdown' ),
		descriptionLink: 'https://support.wordpress.com/markdown/',
		icon: 'pencil',
		category: 'Misc',
		description: i18n.translate( 'Text formatting using a lightweight markup language.' )
	},
	{
		name: i18n.translate( 'Likes' ),
		descriptionLink: 'https://support.wordpress.com/likes/',
		icon: 'star',
		category: 'Traffic Growth',
		description: i18n.translate( 'Engage readers with a Like button on your posts.' )
	},
	{
		name: i18n.translate( 'Advanced Comments' ),
		descriptionLink: 'https://support.wordpress.com/category/comments/',
		icon: 'comment',
		category: 'Misc',
		description: i18n.translate( 'Comment likes, user mentions, notifications, and more.' )
	},
	{
		name: i18n.translate( 'Photon CDN' ),
		descriptionLink: 'https://jetpack.com/support/photon/',
		icon: 'image',
		category: 'Performance',
		description: i18n.translate( 'Faster image loading and editing.' )
	}
];

/*
 * Premium plugins list
 */
export const defaultPremiumPlugins = [
	{
		name: i18n.translate( 'No Advertising' ),
		descriptionLink: 'https://support.wordpress.com/no-ads/',
		icon: 'block',
		category: 'Premium',
		description: i18n.translate( 'Remove WordPress.com ads from your site.' )
	},
	{
		name: i18n.translate( 'Custom Design' ),
		descriptionLink: 'https://support.wordpress.com/custom-design/',
		icon: 'customize',
		category: 'Premium',
		description: i18n.translate( 'Customize your blog\'s look with custom fonts, a CSS editor, and more.' )
	},
	{
		name: i18n.translate( 'Video Uploads' ),
		descriptionLink: 'https://support.wordpress.com/videopress/',
		icon: 'video-camera',
		category: 'Premium',
		description: i18n.translate( 'Upload and host your video files on your site with VideoPress.' )
	}
];

/**
 * Business plugins list
 */
export const defaultBusinessPlugins = [
	{
		name: i18n.translate( 'Google Analytics' ),
		descriptionLink: '/plans/features/google-analytics/{siteSlug}',
		icon: 'stats',
		category: 'Business',
		description: i18n.translate( 'Advanced features to complement WordPress.com stats. Funnel reports, goal conversion, and more.' )
	}
];
