/**
 * External dependencies
 */
import { compact, first, get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { RESULT_TOUR, RESULT_VIDEO } from './constants';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Module variables
 */
const fallbackLinks = [
	{
		link: localizeUrl(
			'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
		),
		post_id: 143180,
		title: translate( 'Do I Need a Website, a Blog, or a Website with a Blog?' ),
		description: translate(
			'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
		),
	},
	{
		link: localizeUrl( 'https://wordpress.com/support/business-plan/' ),
		post_id: 134940,
		title: translate( 'Uploading custom plugins and themes' ),
		description: translate(
			'Learn more about installing a custom theme or plugin using the Business plan.'
		),
	},
	{
		link: localizeUrl( 'https://wordpress.com/support/all-about-domains/' ),
		post_id: 41171,
		title: translate( 'All About Domains' ),
		description: translate(
			'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
		),
	},
	{
		link: localizeUrl( 'https://wordpress.com/support/start/' ),
		post_id: 81083,
		title: translate( 'Quick-Start Guide' ),
		description: translate(
			"Use our five-step checklist to get set up and ready to publish, no matter what kind of site you're building."
		),
	},
	{
		link: localizeUrl( 'https://wordpress.com/support/settings/privacy-settings/' ),
		post_id: 1507,
		title: translate( 'Privacy Settings' ),
		description: translate( 'Limit your site’s visibility or make it completely private.' ),
	},
];

const contextLinksForSection = {
	stats: [
		{
			link: localizeUrl( 'https://wordpress.com/support/stats/' ),
			post_id: 4454,
			title: translate( 'Understanding the Stats Page' ),
			description: translate(
				'Your stats page includes a bunch of nifty graphs, charts, and lists that show you how many ' +
					'visits your site gets, what posts and pages are the most popular ones, and much more. Learn what it all means.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' ),
			post_id: 3307,
			title: translate( 'Getting More Views and Traffic' ),
			description: translate(
				'Want more traffic? Here are some tips for attracting more visitors to your site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/increase-your-site-traffic/' ),
			post_id: 132186,
			title: translate( 'Increase Your Site Traffic' ),
			description: translate(
				'One of the most frequent questions our community members ask us — and themselves — ' +
					'is how to get more traffic. Here are a few best practices.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/grow-your-community/' ),
			post_id: 132190,
			title: translate( 'Grow Your Community' ),
			description: translate(
				'You’ve worked hard on building your site, now it’s time to explore the community and get noticed. Learn how.'
			),
		},
	],
	sharing: [
		{
			link: localizeUrl( 'https://wordpress.com/support/video-tutorials/connect-to-social-media/' ),
			post_id: 130825,
			title: translate( 'Integrate and Connect to Social Media' ),
			description: translate(
				'Start sharing your site and attract more traffic and visitors to your content! ' +
					'Learn to activate and control the social media and sharing options on your website or blog through these videos.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/sharing/' ),
			post_id: 7499,
			title: translate( 'Sharing Your Content' ),
			description: translate(
				'At the bottom of each post or page, you can include sharing buttons for your readers ' +
					'to make it easier to share your content.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/instagram/' ),
			post_id: 77589,
			title: translate( 'Using Instagram' ),
			description: translate(
				'Instagram is a simple way to capture, customize, ' +
					'and share photos and short videos using your smartphone or other mobile device. Learn how to use it with your website!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/twitter/' ),
			post_id: 124,
			title: translate( 'Using Twitter' ),
			description: translate(
				'Twitter is a service for the exchange of brief messages, commonly ' +
					'called "tweets", between users. Learn how to use it with your website!'
			),
		},
	],
	me: [
		{
			link: localizeUrl( 'https://wordpress.com/support/manage-my-profile/' ),
			post_id: 19775,
			title: translate( 'Managing Your Profile' ),
			description: translate(
				'Your profile is the information you’d like to be shown along with your ' +
					'name when you publish content or comment on WordPress.com sites.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/gravatars/' ),
			post_id: 1338,
			title: translate( 'Your Profile Picture' ),
			description: translate(
				'WordPress.com associates an Avatar with your email address. Gravatar ' +
					'powers the user avatars on WordPress.com.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/account-deactivation/' ),
			post_id: 138080,
			title: translate( 'Account Closure' ),
			description: translate( 'Need a fresh start? Learn how to close your account.' ),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/change-your-username/' ),
			post_id: 2116,
			title: translate( 'Change Your Username' ),
			description: translate(
				'You can change both your WordPress.com account username (the name you use to login) ' +
					'and your display name (the name that is seen on your posts and comments). Learn how!'
			),
		},
	],
	account: [
		{
			link: localizeUrl( 'https://wordpress.com/support/change-your-username/' ),
			title: translate( 'Change Your Username' ),
			description: translate(
				'You can change both your WordPress.com account username (the name you use to login) ' +
					'and your display name (the name that is seen on your posts and comments). Learn how!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/video-tutorials/manage-your-account/' ),
			post_id: 130826,
			title: translate( 'Manage Your Account' ),
			description: translate(
				'Learn the ins and outs of managing your WordPress.com account and site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/account-settings/' ),
			post_id: 80368,
			title: translate( 'Edit Your Account Settings' ),
			description: translate(
				'You can review and edit basic account information in Account Settings. '
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/account-deactivation/' ),
			post_id: 143899,
			title: translate( 'Close Your Account' ),
			description: translate(
				'Learn how to permanently delete your WordPress.com account, and what it means for your website and data.'
			),
		},
	],
	security: [
		{
			link: localizeUrl( 'https://wordpress.com/support/security/two-step-authentication/' ),
			post_id: 58847,
			title: translate( 'Two-Step Authentication' ),
			description: translate(
				'Your WordPress.com site is your home on the internet, and you want to keep that home safe. ' +
					'Learn how to add an additional "lock" to your account!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/account-recovery/' ),
			post_id: 46365,
			title: translate( 'Account Recovery' ),
			description: translate(
				'At some point, you may run into a situation in which you’ve lost access to your account. Learn how to get back on track!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/passwords/' ),
			post_id: 89,
			title: translate( 'Passwords And How To Use Them' ),
			description: translate(
				'Passwords are very important to user accounts, and there may come a time when you need to change your password.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/third-party-applications/' ),
			post_id: 17288,
			title: translate( 'Third Party Applications' ),
			description: translate(
				'WordPress.com allows you to connect with third-party applications that ' +
					'extend your WordPress.com site in new and cool ways.'
			),
		},
	],
	purchases: [
		{
			link: localizeUrl( 'https://wordpress.com/support/manage-purchases/' ),
			post_id: 111349,
			title: translate( 'Manage Purchases' ),
			description: translate(
				'Have a question or need to change something about a purchase you have made? Learn how.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/auto-renewal/' ),
			post_id: 110924,
			title: translate( 'Subscriptions for Plans and Domains' ),
			description: translate(
				'Your WordPress.com plans and any domains you add to your sites are based ' +
					'on a yearly subscription that renews automatically.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/discover-the-wordpress-com-plans/' ),
			post_id: 140323,
			title: translate( 'Explore the WordPress.com Plans' ),
			description: translate(
				"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals."
			),
		},
	],
	'notification-settings': [
		{
			link: localizeUrl( 'https://wordpress.com/support/notifications/' ),
			post_id: 40992,
			title: translate( 'Notifications' ),
			description: translate(
				'Notifications help you stay on top of the activity on your site and all the things happening on ' +
					'WordPress.com — learn how to use them.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/email-notifications/' ),
			post_id: 9443,
			title: translate( 'Email Notifications' ),
			description: translate(
				'WordPress.com sends email notifications to the email address registered to your account. Learn how to manage them.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/following-comments/' ),
			post_id: 4576,
			title: translate( 'Following Comments' ),
			description: translate(
				'When you leave a comment, you can automatically get email notifications for other new comments ' +
					"on the same post or page — you'll never be out of the loop."
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/following/' ),
			post_id: 4899,
			title: translate( 'Following Blogs' ),
			description: translate(
				'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.'
			),
		},
	],
	media: [
		{
			link: localizeUrl( 'https://wordpress.com/support/media/' ),
			post_id: 853,
			title: translate( 'The Media Library' ),
			description: translate(
				'The Media Library is where you can manage your images, audio, videos, and documents all in one place.'
			),
		},
		{
			link: localizeUrl(
				'https://wordpress.com/support/add-media/finding-free-images-and-other-media/'
			),
			post_id: 78425,
			title: translate( 'Finding Free Images and other Media' ),
			description: translate(
				'Use free images (and other media) to make your pages and posts more interesting and engaging when on a budget!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/add-media/' ),
			post_id: 38830,
			title: translate( 'Add Media' ),
			description: translate(
				'Dress up your text-based posts and pages with individual images, image galleries, ' +
					'slideshows, videos, and audio.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/videos/' ),
			post_id: 4744,
			title: translate( 'Including Videos' ),
			description: translate(
				'Videos are a great way to enhance your site pages and blog posts. Learn how to include them.'
			),
		},
	],
	people: [
		{
			link: localizeUrl( 'https://wordpress.com/support/user-roles/' ),
			post_id: 1221,
			title: translate( 'User Roles' ),
			description: translate(
				'User roles determine the access level or permissions of a person authorized to use a WordPress.com site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/user-mentions/' ),
			post_id: 91788,
			title: translate( 'User Mentions' ),
			description: translate(
				'User mentions are a great way to include other WordPress.com users within your ' +
					'posts and comments.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/adding-users/' ),
			post_id: 2160,
			title: translate( 'Inviting Contributors, Followers, and Viewers' ),
			description: translate(
				'Invite contributors, followers, and viewers to collaborate with others and grow your audience!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/followers/' ),
			post_id: 5444,
			title: translate( 'Your Followers' ),
			description: translate(
				'When someone follows your site, each time you publish new content on your blog they ' +
					'receive an update in their Reader, via email, or both depending on their settings.'
			),
		},
	],
	plugins: [
		{
			link: localizeUrl( 'https://wordpress.com/support/plugins/' ),
			post_id: 2108,
			title: translate( 'Using Plugins' ),
			description: translate(
				'On WordPress.com, we include the most popular plugin functionality within our ' +
					'sites automatically. Additionally, the Business plan allows you to choose from many ' +
					'thousands of plugins, and install them on your site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/plugins/managing-plugins/' ),
			post_id: 134818,
			title: translate( 'Managing plugins' ),
			description: translate(
				'After you install a plugin, it will appear in a list at My Sites → Plugins.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/plugins/adding-plugins/' ),
			post_id: 134719,
			title: translate( 'Adding Plugins' ),
			description: translate(
				'Along with all the tools and features built right into WordPress.com, the Business plan ' +
					'allows you to install other plugins.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/business-plan/' ),
			post_id: 134940,
			title: translate( 'Business Plan' ),
			description: translate(
				"When you want to build a one-of-a-kind website, it's time for WordPress.com Business: " +
					'upload plugins and themes to create a truly tailored experience for your visitors.'
			),
		},
	],
	'posts-pages': [
		{
			link: localizeUrl(
				'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
			),
			post_id: 143180,
			title: translate( 'Do I Need a Website, a Blog, or a Website with a Blog?' ),
			description: translate(
				'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/five-step-website-setup/' ),
			post_id: 100856,
			title: translate( 'Build Your Website in Five Steps' ),
			description: translate(
				'You’ve registered a website on WordPress.com. But now what? ' +
					'Learn five steps that will get the framework of your new website all set up, ' +
					'leaving it ready and waiting for your great content'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/pages/landing-pages/' ),
			post_id: 124077,
			title: translate( 'Landing Pages' ),
			description: translate(
				'Landing pages are pages with a single purpose: encouraging your visitors to, for example, sign up for ' +
					'a service, buy a product, or join a mailing list.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/posts/' ),
			post_id: 84,
			title: translate( 'About Blog Posts' ),
			description: translate(
				'Posts are what make your blog a blog — they’re servings of content that are listed in reverse chronological order.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/posts/post-formats/' ),
			post_id: 10382,
			title: translate( 'Post Formats' ),
			description: translate(
				'Learn how to make gallery, video, audio, and other post types pop with post formats. '
			),
		},
	],
	'settings-writing': [
		{
			link: localizeUrl( 'https://wordpress.com/support/settings/writing-settings/' ),
			post_id: 1502,
			title: translate( 'Writing Settings' ),
			description: translate(
				'Learn how to manage categories, date format, content types, and more.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/posts/categories-vs-tags/' ),
			post_id: 2135,
			title: translate( 'Categories vs. Tags' ),
			description: translate( 'Learn the differences between categories and tags.' ),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/feeds/' ),
			post_id: 3589,
			title: translate( 'Feeds' ),
			description: translate(
				'A feed (often called RSS) is a stream of posts or comments that is updated when new content is published.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/portfolios/' ),
			post_id: 84808,
			title: translate( 'Portfolios' ),
			description: translate(
				'To show off your portfolio separate from your blog posts and pages, the Portfolio content type will let you' +
					' manage all your portfolio projects in one place.'
			),
		},
	],
	'settings-discussion': [
		{
			link: localizeUrl( 'https://wordpress.com/support/settings/discussion-settings/' ),
			post_id: 1504,
			title: translate( 'Discussion Settings' ),
			description: translate(
				'The Discussion Settings are used to control how visitors and other blogs interact with your site.'
			),
		},
		{
			link: localizeUrl(
				'https://wordpress.com/support/enable-disable-comments-for-future-posts/'
			),
			post_id: 5997,
			title: translate( 'Enable and Disable Comments for Future Posts' ),
			description: translate(
				'You can enable/disable comments on future posts by going into your Discussion settings. '
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/comments/' ),
			post_id: 113,
			title: translate( 'Comments' ),
			description: translate(
				'Comments are a way for visitors to add feedback to your posts and pages.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/subscriptions-and-newsletters/' ),
			post_id: 67810,
			title: translate( 'Subscriptions and Newsletters' ),
			description: translate(
				'Learn how readers can subscribe to your blog to receive email notifications of all of your posts.'
			),
		},
	],
	'settings-traffic': [
		{
			link: localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' ),
			post_id: 3307,
			title: translate( 'Get More Views and Traffic' ),
			description: translate(
				'Want more traffic? Here are some tips for attracting more visitors to your site!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/related-posts/' ),
			post_id: 1545,
			title: translate( 'Related Posts' ),
			description: translate(
				'The Related Posts feature pulls relevant content from your blog to display at the bottom of your posts.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/webmaster-tools/' ),
			post_id: 5022,
			title: translate( 'Webmaster Tools' ),
			description: translate(
				'Learn how to verify your WordPress.com site for the webmaster tools that many search engines provide.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/amp-accelerated-mobile-pages/' ),
			post_id: 122516,
			title: translate( 'Accelerated Mobile Pages (AMP)' ),
			description: translate(
				'Accelerated Mobile Pages (AMP) allows browsers and apps to load your site more quickly on mobile devices. ' +
					'By default, it is enabled for every WordPress.com site.'
			),
		},
	],
	'settings-security': [
		{
			link: localizeUrl( 'https://wordpress.com/support/security/' ),
			post_id: 10977,
			title: translate( 'Security' ),
			description: translate(
				'Learn what we do to help protect your site and your personal data, along with added steps ' +
					'we recommend you take to do the same.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/unwanted-comments/' ),
			post_id: 5882,
			title: translate( 'Unwanted Comments and Comment Spam' ),
			description: translate(
				'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/selecting-a-strong-password/' ),
			post_id: 35364,
			title: translate( 'Selecting A Strong Password' ),
			description: translate(
				'The weakest point in any security for your online accounts is usually your password. Learn how to select a strong one.'
			),
		},
	],
	settings: [
		{
			link: localizeUrl( 'https://wordpress.com/support/settings/' ),
			post_id: 497,
			title: translate( 'Settings' ),
			description: translate(
				'The Settings menu of your site is where you will configure everything about how the blog works and functions.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/settings/general-settings/' ),
			post_id: 1501,
			title: translate( 'General Settings' ),
			description: translate(
				'The General Settings let you control how your site is displayed, such as the ' +
					'title, tagline, language, and visibility.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/site-icons/' ),
			post_id: 1327,
			title: translate( 'Site Icons' ),
			description: translate(
				'A Site Icon is a unique icon for your site that is shown in your visitor’s browser tab ' +
					'and other places around WordPress.com.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/five-step-blog-setup/' ),
			post_id: 100846,
			title: translate( 'Five Steps to Your Great New Blog' ),
			description: translate(
				'Get ready to publish! Our five-step checklist walks you through all the fundamentals.'
			),
		},
	],
	themes: [
		{
			link: localizeUrl( 'https://wordpress.com/support/themes/' ),
			post_id: 2278,
			title: translate( 'Themes: An Overview' ),
			description: translate(
				'A theme controls the general look and feel of your site including things like ' +
					'page layout, widget locations, and default font.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/themes/mobile-themes/' ),
			post_id: 4925,
			title: translate( 'Mobile Themes' ),
			description: translate(
				'When a visitor browses to a WordPress.com site on a mobile device, we show ' +
					'special themes designed to work on small screens focusing on fast load times.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/premium-themes/' ),
			post_id: 12112,
			title: translate( 'Premium Themes' ),
			description: translate(
				'On a site with the Premium or Business plan, you can switch to any premium theme at ' +
					'no extra cost, as many times as you’d like.'
			),
		},
		{
			link: localizeUrl(
				'https://wordpress.com/support/themes/uploading-setting-up-custom-themes/child-themes/'
			),
			post_id: 134704,
			title: translate( 'Child Themes' ),
			description: translate(
				"The only limit on your site is your vision — if the themes you see don't match that, it's " +
					'time to go beyond them. Learn to use child themes to customize and extend your website.'
			),
		},
	],
	theme: [
		{
			link: localizeUrl( 'https://wordpress.com/support/themes/' ),
			post_id: 134704,
			title: translate( 'Themes: An Overview' ),
			description: translate(
				'A theme controls the general look and feel of your site including things like ' +
					'page layout, widget locations, and default font.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/themes/mobile-themes/' ),
			post_id: 4925,
			title: translate( 'Mobile Themes' ),
			description: translate(
				'When a visitor browses to a WordPress.com site on a mobile device, we show ' +
					'special themes designed to work on small screens focusing on fast load times.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/premium-themes/' ),
			post_id: 12112,
			title: translate( 'Premium Themes' ),
			description: translate(
				'On a site with the Premium or Business plan, you can switch to any premium theme at ' +
					'no extra cost, as many times as you’d like.'
			),
		},
		{
			link: localizeUrl(
				'https://wordpress.com/support/themes/uploading-setting-up-custom-themes/child-themes/'
			),
			title: translate( 'Child Themes' ),
			post_id: 134704,
			description: translate(
				"The only limit on your site is your vision — if the themes you see don't match that, it's " +
					'time to go beyond them. Learn to use child themes to customize and extend your website.'
			),
		},
	],
	plans: [
		{
			link: localizeUrl( 'https://wordpress.com/support/discover-the-wordpress-com-plans/' ),
			post_id: 140323,
			title: translate( 'Explore the WordPress.com Plans' ),
			description: translate(
				"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals."
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/plan-features/' ),
			post_id: 134698,
			title: translate( 'WordPress.com Plans' ),
			description: translate(
				'Learn about the capabilities and features that the different plans unlock for your site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/auto-renewal/' ),
			post_id: 110924,
			title: translate( 'Subscriptions for Plans and Domains' ),
			description: translate(
				'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
					'subscription that renews automatically.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/jetpack-add-ons/' ),
			post_id: 115025,
			title: translate( 'Jetpack Plans' ),
			description: translate(
				'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.'
			),
		},
	],
	'post-editor': [
		{
			link: localizeUrl( 'https://wordpress.com/support/editors/' ),
			post_id: 3347,
			title: translate( 'The Visual Editor and the HTML Editor' ),
			description: translate(
				'When creating a post or page on your WordPress.com blog, you have two editing modes ' +
					'available to you: the Visual Editor and the HTML Editor.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/visual-editor/' ),
			post_id: 3644,
			title: translate( 'The Visual Editor' ),
			description: translate(
				'The visual editor provides a semi-WYSIWYG (What You See is What You Get) content editor that ' +
					'allows you to easily create, edit, and format your content in a view similar to that of a word processor.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/xml-rpc/' ),
			post_id: 3595,
			title: translate( 'Offline Editing' ),
			description: translate(
				'Learn how to create and edit content for your WordPress.com site even without being connected to the internet!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/adding-users/' ),
			post_id: 2160,
			title: translate( 'Inviting Contributors, Followers, and Viewers' ),
			description: translate(
				'Invite contributors, followers, and viewers to collaborate with others and grow your audience!'
			),
		},
	],
	'gutenberg-editor': [
		{
			link: localizeUrl( 'https://wordpress.com/support/wordpress-editor/' ),
			post_id: 147594,
			title: translate( 'What are "Blocks"?' ),
			description: translate(
				'The WordPress Editor uses blocks to transform the way you create content: it turns a single document into a collection of discrete elements with explicit, easy-to-tweak structure.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/xml-rpc/' ),
			post_id: 3595,
			title: translate( 'Offline Editing' ),
			description: translate(
				'Learn how to create and edit content for your WordPress.com site even without being connected to the internet!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/adding-users/' ),
			post_id: 2160,
			title: translate( 'Inviting Contributors, Followers, and Viewers' ),
			description: translate(
				'Invite contributors, followers, and viewers to collaborate with others and grow your audience!'
			),
		},
	],
	reader: [
		{
			link: localizeUrl( 'https://wordpress.com/support/reader/' ),
			post_id: 32011,
			title: translate( 'The Reader: An Overview' ),
			description: translate(
				'Read posts from all the sites you follow — even ones that aren’t on WordPress.com! ' +
					'Discover great new reads and keep track of your comments and replies in one convenient place.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/following/' ),
			post_id: 4899,
			title: translate( 'Follow Blogs' ),
			description: translate(
				'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/topics/' ),
			post_id: 2166,
			title: translate( 'Following Specific Topics in the Reader' ),
			description: translate(
				'Looking for posts on a specific topic? Besides following entire blogs, you can also follow posts on a specific subject ' +
					'from across WordPress.com. You do this by adding the topic you’re interested in under the Tags heading in the Reader.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/grow-your-community/' ),
			post_id: 132190,
			title: translate( 'Grow Your Community' ),
			description: translate(
				'You’ve worked hard on building your site, now it’s time to explore the community and get noticed.'
			),
		},
	],
	help: [
		{
			link: localizeUrl( 'https://wordpress.com/support/blogging-u/' ),
			post_id: 117437,
			title: translate( 'Blogging U.' ),
			description: translate(
				'Blogging U. courses deliver free expert advice, pro tips, and inspiration right to your ' +
					'email inbox. Sign up now!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/help-support-options/' ),
			post_id: 149,
			title: translate( 'Help! Getting WordPress.com Support' ),
			description: translate(
				'WordPress.com offers a number of avenues for reaching helpful, individualized support.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/' ),
			title: translate( 'All Support Articles' ),
			description: translate(
				'Looking to learn more about a feature? Our docs have all the details.'
			),
		},
		{
			link: localizeUrl( 'https://learn.wordpress.com/' ),
			title: translate( 'Self-guided Online Tutorial' ),
			description: translate( 'A step-by-step guide to getting familiar with the platform.' ),
		},
	],
	comments: [
		{
			link: localizeUrl( 'https://wordpress.com/support/comments/' ),
			post_id: 113,
			title: translate( 'Comments' ),
			description: translate(
				'Comments are a way for visitors to add feedback to your posts and pages.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/comment-display-options/' ),
			post_id: 5840,
			title: translate( 'Comment Display Options' ),
			description: translate(
				'You can control comment threading, paging, and comment order settings from the ' +
					'Discussion Settings page in your site’s settings.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/unwanted-comments/' ),
			post_id: 5882,
			title: translate( 'Unwanted Comments and Comment Spam' ),
			description: translate(
				'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/comment-likes/' ),
			post_id: 88757,
			title: translate( 'Comment Likes' ),
			description: translate(
				'Comment Likes: how to like others’ comments and control how Comment Likes appear on your site.'
			),
		},
	],
	hosting: [
		{
			link: localizeUrl( 'https://wordpress.com/support/sftp/' ),
			post_id: 159771,
			title: translate( 'SFTP on WordPress.com' ),
			description: translate(
				"Access and edit your website's files directly by using an SFTP client."
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/phpmyadmin-and-mysql/' ),
			post_id: 159822,
			title: translate( 'phpMyAdmin and MySQL' ),
			description: translate(
				'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/php-version-switching/' ),
			post_id: 160597,
			title: translate( 'PHP Version Switching' ),
			description: translate(
				'Sites on the Business Plan using custom plugins and/or custom themes and any site on the eCommerce Plan, now have the option to switch PHP versions.'
			),
		},
	],
	checkout: [
		{
			link: localizeUrl( 'https://wordpress.com/support/plan-features/' ),
			post_id: 134698,
			title: translate( 'WordPress.com Plans' ),
			description: translate(
				'Learn about the capabilities and features that the different plans unlock for your site.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/jetpack-add-ons/' ),
			post_id: 115025,
			title: translate( 'Jetpack Plans' ),
			description: translate(
				'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/manage-purchases/' ),
			post_id: 111349,
			title: translate( 'Manage Purchases and Refund Policy' ),
			description: translate(
				'Have a question or need to change something about a purchase you have made? Learn how.'
			),
		},
		{
			link: localizeUrl( 'https://wordpress.com/support/auto-renewal/' ),
			post_id: 110924,
			title: translate( 'Subscriptions for Plans and Domains' ),
			description: translate(
				'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
					'subscription that renews automatically.'
			),
		},
	],
	domains: [
		{
			link: localizeUrl( 'https://en.support.wordpress.com/add-email/' ),
			post_id: 34087,
			title: translate( 'Add Email to your Domain' ),
			description: translate(
				'Want to use a custom email with your domain, such as info@yourgroovydomain.com? There are multiple ways to add email to your custom domain.'
			),
		},
		{
			link: localizeUrl( 'https://en.support.wordpress.com/domains/custom-dns/' ),
			post_id: 6595,
			title: translate( 'Manage Custom DNS' ),
			description: translate(
				'Custom DNS records are special settings that change how your domain works. They allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider.'
			),
		},
		{
			link: localizeUrl(
				'https://en.support.wordpress.com/move-domain/transfer-domain-registration/'
			),
			post_id: 41298,
			title: translate( 'Transfer a Domain to Another Registrar' ),
			description: translate(
				'This article walks you through transferring your domain registration to another registrar. Your domain will need to be unlocked and privacy removed (if applicable) for the transfer.'
			),
		},
		{
			link: localizeUrl( 'https://en.support.wordpress.com/domain-mapping-vs-domain-transfer/' ),
			post_id: 41298,
			title: translate( 'Connect an Existing Domain' ),
			description: translate(
				'You can connect an existing domain you own that’s registered elsewhere by either mapping or transferring. Domain mapping lets you connect a domain while keeping it registered at the current registrar (where you purchased the domain from). Domain transferring moves the domain to WordPress.com so we become the new registrar.'
			),
		},
		{
			link: localizeUrl( 'https://en.support.wordpress.com/domains/' ),
			post_id: 1988,
			title: translate( 'All about domains' ),
			description: translate(
				'A domain name is an address people use to visit your site. It tells the web browser where to look for your site. Just like a street address, a domain is how people visit your website online. And, like having a sign in front of your store, a custom domain name helps give your site a professional look.'
			),
		},
	],
};

/*
source: https://www.youtube.com/playlist?list=PLQFhxUeNFfdKx9gO0a2mp9h8pKjb2y9la
run this in the console to get the videos into a more helpful format (also removes duplicates):
```JavaScript
data = {};
document.querySelectorAll('.yt-simple-endpoint.ytd-playlist-video-renderer').forEach( function( e ) {
	data[ new RegExp(/v=([^&]*)&/).exec( e.href )[1] ] = e.querySelector( '#video-title' ).innerHTML.trim();
} );
console.log( data );
```
*/
const videosForSection = {
	sharing: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/YVelWG3hf3o',
			title: translate( 'Add Social Sharing Buttons to Your Website' ),
			description: translate(
				'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
					'do with a Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/NcCe0ozmqFM',
			title: translate( 'Connect Your Blog to Facebook Using Publicize' ),
			description: translate(
				'Find out how to share blog posts directly on Facebook from your WordPress.com site, ' +
					'which you can also do on a Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/f44-4TgnWTs',
			title: translate( 'Display Your Instagram Feed on Your Website' ),
			description: translate(
				'Find out how to display your latest Instagram photos right on your WordPress.com site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3rTooGV_mlg',
			title: translate( 'Set Up the Social Links Menu' ),
			description: translate(
				'Find out how to set up a social links menu on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/gmrOkkqMNlc',
			title: translate( 'Embed a Twitter Timeline in your Sidebar' ),
			description: translate(
				'Find out how to display your Twitter timeline on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/vy-U5saqG9A',
			title: translate( 'Set Up a Social Media Icons Widget' ),
			description: translate(
				'Find out how to set up the social media icons widget on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/N0GRBFRkzzs',
			title: translate( 'Embed a Tweet from Twitter in Your Website' ),
			description: translate(
				'Find out how to embed a Tweet in your content (including posts and pages) on your WordPress.com ' +
					'or Jetpack-enabled WordPress website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/uVRji6bKJUE',
			title: translate( 'Embed an Instagram Photo in Your Website' ),
			description: translate(
				'Find out how to embed an Instagram photo in your content (including posts and pages) on your WordPress.com ' +
					'or Jetpack-enabled WordPress website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/sKm3Q83JxM0',
			title: translate( 'Embed a Facebook Update in Your Website' ),
			description: translate(
				'Find out how to embed a Facebook update in your content (including posts, pages, and even comments) on your ' +
					'WordPress.com or Jetpack-enabled WordPress website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/SBgNkre_b14',
			title: translate( 'Share Blog Posts Directly on Twitter' ),
			description: translate(
				'Find out how to share blog posts directly on Twitter from your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
	],
	settings: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/0YCZ22k4SfQ',
			title: translate( 'Add a Site Logo' ),
			description: translate( 'Find out how to add a custom logo to your WordPress.com site.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/vucZ1uZ2NPo',
			title: translate( 'Update Your Website Title and Tagline' ),
			description: translate(
				'Find out how to update the Title and Tagline of your WordPress.com site, which you can also ' +
					'do on your Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Y6iPsPwYD7g',
			title: translate( 'Change Your Privacy Settings' ),
			description: translate(
				'Find out how to change your website privacy settings on WordPress.com.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/bjxKGxW0MRA',
			title: translate( 'Add a Site Icon' ),
			description: translate( 'Find out how to add a site icon on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/z6fCtvLB0wM',
			title: translate( 'Create a Multilingual Site' ),
			description: translate( 'Find out how to create a multilingual site on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/D142Edhcpaw',
			title: translate( 'Customize Your Content Options' ),
			description: translate(
				'Find out how to customize your content options on select WordPress.com themes.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Vyr-g5SEuIA',
			title: translate( 'Change Your Language Settings' ),
			description: translate(
				'Find out how to change your blog or website language and your interface language settings on WordPress.com.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/EUuEuW_LCrc',
			title: translate( 'Activate Free Email Forwarding' ),
			description: translate(
				'Find out how to activate free email forwarding from an address using a custom domain registered through WordPress.com.'
			),
		},
	],
	'post-editor': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/hNg1rrkiAjg',
			title: translate( 'Set a Featured Image for a Post or Page' ),
			description: translate(
				'Find out how to add a featured image where available on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/dAcEBKXPlyA',
			title: translate( 'Add a Contact Form to Your Website' ),
			description: translate( 'Find out how to add a contact form to your WordPress.com site.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/ssfHW5lwFZg',
			title: translate( 'Embed a YouTube Video in Your Website' ),
			description: translate(
				'Find out how to embed a YouTube video in your content (including posts, pages, and even comments) ' +
					'on your WordPress.com or Jetpack-enabled WordPress website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/_tpcHN6ZtKM',
			title: translate( 'Schedule a Post' ),
			description: translate(
				'Find out how to schedule a post on your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/V8UToJoSf4Q',
			title: translate( 'Add a Simple Payment Button' ),
			description: translate(
				'Find out how to add a payment button to your WordPress.com website.'
			),
		},
	],
	account: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/aO-6yu3_xWQ',
			title: translate( 'Change Your Password' ),
			description: translate( 'Find out how to change your account password on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/qhsjkqFdDZo',
			title: translate( 'Change Your WordPress.com Username' ),
			description: translate( 'Find out how to change your username on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Tyxu_xT6q1k',
			title: translate( 'Change Your WordPress.com Display Name' ),
			description: translate( 'Find out how to change your display name on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/07Nf8FkjO4o',
			title: translate( 'Change Your Account Email Address' ),
			description: translate(
				'Find out how to change your account email address on WordPress.com.'
			),
		},
	],
	customizer: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/pf_ST7gvY8c',
			title: translate( 'Add a Custom Header Image' ),
			description: translate(
				'Find out how to add a custom header image to your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/CY20IAtl2Ac',
			title: translate( 'Create a Custom Website Menu' ),
			description: translate(
				'Find out how to create a custom menu on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/2H_Jsgh2Z3Y',
			title: translate( 'Add a Widget' ),
			description: translate( 'Find out how to add a widget to your WordPress.com website.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/ypFF4ONBfSQ',
			title: translate( 'Add a Custom Background' ),
			description: translate(
				'Find out how to add a custom background to your WordPress.com site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/b8EuJDrNeOA',
			title: translate( 'Change Your Site Fonts' ),
			description: translate(
				'Find out how to change the fonts on your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/7VPgvxV78Kc',
			title: translate( 'Add a Gallery Widget' ),
			description: translate(
				'Find out how to add an image gallery widget to your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/oDBuaBLrwF8',
			title: translate( 'Use Featured Content' ),
			description: translate(
				'Find out how to use the Featured Content option on your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3TqRr21zyiA',
			title: translate( 'Add an Image Widget' ),
			description: translate(
				'Find out how to add an image widget to your WordPress.com website or blog.'
			),
		},
	],
	'posts-pages': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3RPidSCQ0LI',
			title: translate( 'Create a Landing Page' ),
			description: translate(
				'Find out how to create a one-page website or landing page on your WordPress.com site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/4IkFQzl5nXc',
			title: translate( 'Set Up a Website in 5 Steps' ),
			description: translate( 'Find out how to create a website on WordPress.com in five steps.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/mta6Y0o7yJk',
			title: translate( 'Set Up a Blog in 5 Steps' ),
			description: translate( 'Find out how to create a blog on WordPress.com in five steps.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Gx7YNX1Wk5U',
			title: translate( 'Create a Page' ),
			description: translate( 'Find out how to create a page on your WordPress.com site.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/mCfuh5bCOwM',
			title: translate( 'Create a Post' ),
			description: translate( 'Find out how to create a post on WordPress.com.' ),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/bEVHg6nopcs',
			title: translate( 'Use a Custom Menu in a Widget' ),
			description: translate(
				'Find out how to use a custom menu in a widget on your WordPress.com or Jetpack-enabled WordPress site.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/nAzdUOlFoBI',
			title: translate( 'Configure a Static Homepage' ),
			description: translate(
				'By default, your new WordPress.com website displays your latest posts. Find out how to create a static homepage instead.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/MPpVeMmDOhk',
			title: translate( 'Show Related Posts on Your WordPress Blog' ),
			description: translate(
				'Find out how to show related posts on your WordPress.com site, which you can also do on a Jetpack-enabled WordPress blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/JVnltCZUKC4',
			title: translate( 'Add Testimonials' ),
			description: translate(
				'Find out how to add testimonials to your WordPress.com website or blog.'
			),
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/yH_gapAUGAA',
			title: translate( 'Change Your Post or Page Visibility Settings' ),
			description: translate(
				'Find out how to change your page or post visibility settings WordPress.com.'
			),
		},
	],
	media: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/VjGnEHyqVqQ',
			title: translate( 'Add a Photo Gallery' ),
			description: translate(
				'Find out how to add a photo gallery on your WordPress.com and Jetpack-enabled website.'
			),
		},
	],
	themes: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/yOfAuOb68Hc',
			title: translate( 'Change Your Website Theme on WordPress.com' ),
			description: translate( 'Find out how to change your WordPress.com theme.' ),
		},
	],
};

const toursForSection = {
	'post-editor': [
		{
			type: RESULT_TOUR,
			tour: 'simplePaymentsTour',
			key: 'tour:simplePaymentsTour',
			title: translate( 'Collect Payments and Donations' ),
			description: translate(
				'It’s easy to add a button that can collect payments or donations. See how!'
			),
		},
	],
	media: [
		{
			type: RESULT_TOUR,
			tour: 'mediaBasicsTour',
			key: 'tour:mediaBasicsTour',
			title: translate( 'Learn Media Library Basics' ),
			description: translate(
				'The Media Library is a useful tool to help you manage, search, and edit your photos, videos, documents, and other media.'
			),
		},
	],
};

export function getContextResults( section ) {
	// Posts and Pages have a common help section
	if ( section === 'posts' || section === 'pages' ) {
		section = 'posts-pages';
	}

	// make sure editorially to show at most one tour and one video at once
	// `first` is a safe-guard in case that fails
	const video = first( get( videosForSection, section ) );
	const tour = first( get( toursForSection, section ) );
	const links = get( contextLinksForSection, section, fallbackLinks );
	return compact( [ tour, video, ...links ] );
}
