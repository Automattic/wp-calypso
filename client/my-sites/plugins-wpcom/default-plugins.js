import i18n from 'lib/mixins/i18n';

/**
 * Standard plugins list
 */
export const defaultStandardPlugins = [
	{
		name: i18n.translate( 'Stats' ),
		descriptionLink: 'http://support.wordpress.com/stats/',
		icon: 'stats',
		category: 'Traffic Growth',
		description: i18n.translate( 'View your site\'s visits, referrers, and more.' )
	},
	{
		name: i18n.translate( 'Essential SEO' ),
		descriptionLink: 'http://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/',
		icon: 'search',
		category: 'Traffic Growth',
		description: i18n.translate( 'Search engine optimization and sitemaps.' )
	},
	{
		name: i18n.translate( 'Security Scanning' ),
		descriptionLink: 'http://support.wordpress.com/security/',
		icon: 'lock',
		category: 'Performance',
		description: i18n.translate( 'Constant monitoring of your site for threats.' )
	},
	{
		name: i18n.translate( 'Advanced Galleries' ),
		descriptionLink: 'http://support.wordpress.com/images/gallery/',
		icon: 'image-multiple',
		category: 'Appearance',
		description: i18n.translate( 'Tiled, mosaic, slideshows, and more.' )
	},
	{
		name: i18n.translate( 'Social Media' ),
		descriptionLink: 'http://support.wordpress.com/sharing/',
		icon: 'share',
		category: 'Traffic Growth',
		description: i18n.translate( 'Add social media buttons to your posts and pages.' )
	},
	{
		name: i18n.translate( 'Form Builder' ),
		descriptionLink: 'http://support.wordpress.com/contact-form/',
		icon: 'mention',
		category: 'Appearance',
		description: i18n.translate( 'Build contact forms so visitors can get in touch.' )
	},
	{
		name: i18n.translate( 'Extended Customizer' ),
		descriptionLink: 'https://en.support.wordpress.com/customizer/',
		icon: 'customize',
		category: 'Appearance',
		description: i18n.translate( 'Edit colors and backgrounds.' )
	},
	{
		name: i18n.translate( 'Extended Widgets' ),
		descriptionLink: 'https://en.support.wordpress.com/category/widgets-sidebars/',
		icon: 'calendar',
		category: 'Appearance',
		description: i18n.translate( 'Eventbrite, Flickr, Google Calendar, and more.' )
	},
	{
		name: i18n.translate( 'Akismet' ),
		descriptionLink: 'http://akismet.com/',
		icon: 'lock',
		category: 'Security',
		description: i18n.translate( 'Advanced anti-spam security.' )
	},
	{
		name: i18n.translate( 'Backup' ),
		descriptionLink: 'https://en.support.wordpress.com/export/#backups',
		icon: 'lock',
		category: 'Security',
		description: i18n.translate( '24/7 backup of your entire site.' )
	},
	{
		name: i18n.translate( 'Photon CDN' ),
		descriptionLink: 'https://jetpack.com/support/photon/',
		icon: 'image',
		category: 'Performance',
		description: i18n.translate( 'Faster image loading and editing.' )
	},
	{
		name: i18n.translate( 'Extended Shortcodes' ),
		descriptionLink: 'https://en.support.wordpress.com/shortcodes/',
		icon: 'pencil',
		category: 'Misc',
		description: i18n.translate( 'YouTube, Twitter, Instagram, Spotify, and more.' )
	},
	{
		name: i18n.translate( 'Importer' ),
		descriptionLink: 'http://support.wordpress.com/import/',
		icon: 'cloud-download',
		category: 'Misc',
		description: i18n.translate( 'Import your blog content from a variety of other blogging platforms.' )
	},
	{
		name: i18n.translate( 'Infinite Scroll' ),
		descriptionLink: 'https://en.support.wordpress.com/infinite-scroll/',
		icon: 'posts',
		category: 'Appearance',
		description: i18n.translate( 'Load more posts when you reach the bottom of a page.' )
	},
	{
		name: i18n.translate( 'Related Posts' ),
		descriptionLink: 'https://en.support.wordpress.com/related-posts/',
		icon: 'posts',
		category: 'Appearance',
		description: i18n.translate( 'Pulls relevant content from your blog to display at the bottom of your posts.' )
	},
	{
		name: i18n.translate( 'Email Subscriptions' ),
		descriptionLink: 'https://en.support.wordpress.com/widgets/follow-blog-widget/',
		icon: 'mail',
		category: 'Misc',
		description: i18n.translate( 'Enables your readers to sign up to receive your posts via email.' )
	},
	{
		name: i18n.translate( 'Markdown' ),
		descriptionLink: 'https://en.support.wordpress.com/markdown/',
		icon: 'pencil',
		category: 'Misc',
		description: i18n.translate( 'Text formatting using a lightweight markup language. ' )
	},
	{
		name: i18n.translate( 'Advanced Commenting' ),
		descriptionLink: 'https://en.support.wordpress.com/category/comments/',
		icon: 'comment',
		category: 'Misc',
		description: i18n.translate( 'Comment likes, user mentions, notifications, and more.' )
	}
];

/*
 * Premium plugins list
 */
export const defaultPremiumPlugins = [
	{
		name: i18n.translate( 'No Advertising' ),
		descriptionLink: 'https://en.support.wordpress.com/no-ads/',
		icon: 'block',
		plan: 'Premium',
		description: i18n.translate( 'Remove all ads from your site.' )
	},
	{
		name: i18n.translate( 'Custom Design' ),
		descriptionLink: 'https://en.support.wordpress.com/custom-design/',
		icon: 'customize',
		plan: 'Premium',
		description: i18n.translate( 'Customize your blog\'s look with custom fonts, a CSS editor, and more.' )
	},
	{
		name: i18n.translate( 'Video Uploads' ),
		descriptionLink: 'https://en.support.wordpress.com/videopress/',
		icon: 'video-camera',
		plan: 'Premium',
		description: i18n.translate( 'Upload and host your video files on your site with VideoPress.' )
	}
];

/**
 * Business plugins list
 */
export const defaultBusinessPlugins = [
	{
		name: i18n.translate( 'Google Analytics' ),
		descriptionLink: '/plans/features/{siteSlug}',
		icon: 'stats',
		plan: 'Business',
		description: i18n.translate( 'Advanced features to complement WordPress.com stats. Funnel reports, goal conversion, and more.' )
	}
];
