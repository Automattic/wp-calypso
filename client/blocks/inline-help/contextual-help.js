import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { RESULT_TOUR, RESULT_VIDEO, SELL_INTENT } from './constants';

/**
 * Module variables
 */

/* eslint-disable inclusive-language/use-inclusive-words */
// All usage of the word "master" here refers to the verb (ie. "to learn"), not a synonym of "primary".
const defaultFallbackLinks = [
	{
		get link() {
			return localizeUrl(
				'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
			);
		},
		post_id: 143180,
		get title() {
			return translate( 'Do I Need a Website, a Blog, or a Website with a Blog?' );
		},
		get description() {
			return translate(
				'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/business-plan/' );
		},
		post_id: 134940,
		get title() {
			return translate( 'Uploading custom plugins and themes' );
		},
		get description() {
			return translate(
				'Learn more about installing a custom theme or plugin using the Business plan.'
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/domains/' );
		},
		post_id: 1988,
		get title() {
			return translate( 'All About Domains' );
		},
		get description() {
			return translate(
				'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/start/' );
		},
		post_id: 81083,
		get title() {
			return translate( 'Quick-Start Guide' );
		},
		get description() {
			return translate(
				"Use our five-step checklist to get set up and ready to publish, no matter what kind of site you're building."
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/settings/privacy-settings/' );
		},
		post_id: 1507,
		get title() {
			return translate( 'Privacy Settings' );
		},
		get description() {
			return translate( 'Limit your site’s visibility or make it completely private.' );
		},
	},
];

const bloggerFallbackLinks = [
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/posts/' );
		},
		get title() {
			return translate( 'All about blog posts' );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/subscriptions-and-newsletters/' );
		},
		get title() {
			return translate( 'Encourage visitors to subscribe to your content' );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/publicize/' );
		},
		get title() {
			return translate( 'Share your content to social media automatically' );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/sharing/' );
		},
		get title() {
			return translate( 'Encourage visitors to share your content' );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/seo/' );
		},
		get title() {
			return translate( 'Learn about how to get noticed by search engines' );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/site-verification-services/' );
		},
		get title() {
			return translate( 'Verify your site with Google and other services' );
		},
	},
];

const contextLinksForSection = {
	stats: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/stats/' );
			},
			post_id: 4454,
			get title() {
				return translate( 'Understanding the Stats Page' );
			},
			get description() {
				return translate(
					'Your stats page includes a bunch of nifty graphs, charts, and lists that show you how many ' +
						'visits your site gets, what posts and pages are the most popular ones, and much more. Learn what it all means.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' );
			},
			post_id: 3307,
			get title() {
				return translate( 'Getting More Views and Traffic' );
			},
			get description() {
				return translate(
					'Want more traffic? Here are some tips for attracting more visitors to your site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/increase-your-site-traffic/' );
			},
			post_id: 132186,
			get title() {
				return translate( 'Increase Your Site Traffic' );
			},
			get description() {
				return translate(
					'One of the most frequent questions our community members ask us — and themselves — ' +
						'is how to get more traffic. Here are a few best practices.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/grow-your-community/' );
			},
			post_id: 132190,
			get title() {
				return translate( 'Grow Your Community' );
			},
			get description() {
				return translate(
					'You’ve worked hard on building your site, now it’s time to explore the community and get noticed. Learn how.'
				);
			},
		},
	],
	sharing: [
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/video-tutorials/connect-to-social-media/'
				);
			},
			post_id: 130825,
			get title() {
				return translate( 'Integrate and Connect to Social Media' );
			},
			get description() {
				return translate(
					'Start sharing your site and attract more traffic and visitors to your content! ' +
						'Learn to activate and control the social media and sharing options on your website or blog through these videos.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/sharing/' );
			},
			post_id: 7499,
			get title() {
				return translate( 'Sharing Your Content' );
			},
			get description() {
				return translate(
					'At the bottom of each post or page, you can include sharing buttons for your readers ' +
						'to make it easier to share your content.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/instagram/' );
			},
			post_id: 77589,
			get title() {
				return translate( 'Using Instagram' );
			},
			get description() {
				return translate(
					'Instagram is a simple way to capture, customize, ' +
						'and share photos and short videos using your smartphone or other mobile device. Learn how to use it with your website!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/twitter/' );
			},
			post_id: 124,
			get title() {
				return translate( 'Using Twitter' );
			},
			get description() {
				return translate(
					'Twitter is a service for the exchange of brief messages, commonly ' +
						'called "tweets", between users. Learn how to use it with your website!'
				);
			},
		},
	],
	home: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
	],
	me: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-my-profile/' );
			},
			post_id: 19775,
			get title() {
				return translate( 'Managing Your Profile' );
			},
			get description() {
				return translate(
					'Your profile is the information you’d like to be shown along with your ' +
						'name when you publish content or comment on WordPress.com sites.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/gravatars/' );
			},
			post_id: 1338,
			get title() {
				return translate( 'Your Profile Picture' );
			},
			get description() {
				return translate(
					'WordPress.com associates an Avatar with your email address. Gravatar ' +
						'powers the user avatars on WordPress.com.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-deactivation/' );
			},
			post_id: 138080,
			get title() {
				return translate( 'Account Closure' );
			},
			get description() {
				return translate( 'Need a fresh start? Learn how to close your account.' );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/change-your-username/' );
			},
			post_id: 2116,
			get title() {
				return translate( 'Change Your Username' );
			},
			get description() {
				return translate(
					'You can change both your WordPress.com account username (the name you use to login) ' +
						'and your display name (the name that is seen on your posts and comments). Learn how!'
				);
			},
		},
	],
	account: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/change-your-username/' );
			},
			get title() {
				return translate( 'Change Your Username' );
			},
			get description() {
				return translate(
					'You can change both your WordPress.com account username (the name you use to login) ' +
						'and your display name (the name that is seen on your posts and comments). Learn how!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/video-tutorials/manage-your-account/' );
			},
			post_id: 130826,
			get title() {
				return translate( 'Manage Your Account' );
			},
			get description() {
				return translate(
					'Learn the ins and outs of managing your WordPress.com account and site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-settings/' );
			},
			post_id: 80368,
			get title() {
				return translate( 'Edit Your Account Settings' );
			},
			get description() {
				return translate(
					'You can review and edit basic account information in Account Settings. '
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-deactivation/' );
			},
			post_id: 143899,
			get title() {
				return translate( 'Close Your Account' );
			},
			get description() {
				return translate(
					'Learn how to permanently delete your WordPress.com account, and what it means for your website and data.'
				);
			},
		},
	],
	security: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/security/two-step-authentication/' );
			},
			post_id: 58847,
			get title() {
				return translate( 'Two-Step Authentication' );
			},
			get description() {
				return translate(
					'Your WordPress.com site is your home on the internet, and you want to keep that home safe. ' +
						'Learn how to add an additional "lock" to your account!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-recovery/' );
			},
			post_id: 46365,
			get title() {
				return translate( 'Account Recovery' );
			},
			get description() {
				return translate(
					'At some point, you may run into a situation in which you’ve lost access to your account. Learn how to get back on track!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/passwords/' );
			},
			post_id: 89,
			get title() {
				return translate( 'Passwords And How To Use Them' );
			},
			get description() {
				return translate(
					'Passwords are very important to user accounts, and there may come a time when you need to change your password.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/third-party-applications/' );
			},
			post_id: 17288,
			get title() {
				return translate( 'Third Party Applications' );
			},
			get description() {
				return translate(
					'WordPress.com allows you to connect with third-party applications that ' +
						'extend your WordPress.com site in new and cool ways.'
				);
			},
		},
	],
	purchases: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/auto-renewal/' );
			},
			post_id: 110924,
			get title() {
				return translate( 'Subscriptions for Plans and Domains' );
			},
			get description() {
				return translate(
					'Your WordPress.com plans and any domains you add to your sites are based ' +
						'on a yearly subscription that renews automatically.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/discover-the-wordpress-com-plans/' );
			},
			post_id: 140323,
			get title() {
				return translate( 'Explore the WordPress.com Plans' );
			},
			get description() {
				return translate(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals."
				);
			},
		},
	],
	'site-purchases': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/auto-renewal/' );
			},
			post_id: 110924,
			get title() {
				return translate( 'Subscriptions for Plans and Domains' );
			},
			get description() {
				return translate(
					'Your WordPress.com plans and any domains you add to your sites are based ' +
						'on a yearly subscription that renews automatically.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/discover-the-wordpress-com-plans/' );
			},
			post_id: 140323,
			get title() {
				return translate( 'Explore the WordPress.com Plans' );
			},
			get description() {
				return translate(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals."
				);
			},
		},
	],
	'notification-settings': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/notifications/' );
			},
			post_id: 40992,
			get title() {
				return translate( 'Notifications' );
			},
			get description() {
				return translate(
					'Notifications help you stay on top of the activity on your site and all the things happening on ' +
						'WordPress.com — learn how to use them.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/email-notifications/' );
			},
			post_id: 9443,
			get title() {
				return translate( 'Email Notifications' );
			},
			get description() {
				return translate(
					'WordPress.com sends email notifications to the email address registered to your account. Learn how to manage them.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following-comments/' );
			},
			post_id: 4576,
			get title() {
				return translate( 'Following Comments' );
			},
			get description() {
				return translate(
					'When you leave a comment, you can automatically get email notifications for other new comments ' +
						"on the same post or page — you'll never be out of the loop."
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following/' );
			},
			post_id: 4899,
			get title() {
				return translate( 'Following Blogs' );
			},
			get description() {
				return translate(
					'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.'
				);
			},
		},
	],
	media: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/media/' );
			},
			post_id: 853,
			get title() {
				return translate( 'The Media Library' );
			},
			get description() {
				return translate(
					'The Media Library is where you can manage your images, audio, videos, and documents all in one place.'
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/add-media/finding-free-images-and-other-media/'
				);
			},
			post_id: 78425,
			get title() {
				return translate( 'Finding Free Images and other Media' );
			},
			get description() {
				return translate(
					'Use free images (and other media) to make your pages and posts more interesting and engaging when on a budget!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/add-media/' );
			},
			post_id: 38830,
			get title() {
				return translate( 'Add Media' );
			},
			get description() {
				return translate(
					'Dress up your text-based posts and pages with individual images, image galleries, ' +
						'slideshows, videos, and audio.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/videos/' );
			},
			post_id: 4744,
			get title() {
				return translate( 'Including Videos' );
			},
			get description() {
				return translate(
					'Videos are a great way to enhance your site pages and blog posts. Learn how to include them.'
				);
			},
		},
	],
	people: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/user-roles/' );
			},
			post_id: 1221,
			get title() {
				return translate( 'User Roles' );
			},
			get description() {
				return translate(
					'User roles determine the access level or permissions of a person authorized to use a WordPress.com site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/user-mentions/' );
			},
			post_id: 91788,
			get title() {
				return translate( 'User Mentions' );
			},
			get description() {
				return translate(
					'User mentions are a great way to include other WordPress.com users within your ' +
						'posts and comments.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/adding-users/' );
			},
			post_id: 2160,
			get title() {
				return translate( 'Inviting Contributors, Followers, and Viewers' );
			},
			get description() {
				return translate(
					'Invite contributors, followers, and viewers to collaborate with others and grow your audience!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/followers/' );
			},
			post_id: 5444,
			get title() {
				return translate( 'Your Followers' );
			},
			get description() {
				return translate(
					'When someone follows your site, each time you publish new content on your blog they ' +
						'receive an update in their Reader, via email, or both depending on their settings.'
				);
			},
		},
	],
	plugins: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plugins/' );
			},
			post_id: 2108,
			get title() {
				return translate( 'Using Plugins' );
			},
			get description() {
				return translate(
					'On WordPress.com, we include the most popular plugin functionality within our ' +
						'sites automatically. Additionally, the Pro plan allows you to choose from many ' +
						'thousands of plugins, and install them on your site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plugins/managing-plugins/' );
			},
			post_id: 134818,
			get title() {
				return translate( 'Managing plugins' );
			},
			get description() {
				return translate(
					'After you install a plugin, it will appear in a list at My Sites → Plugins.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plugins/adding-plugins/' );
			},
			post_id: 134719,
			get title() {
				return translate( 'Adding Plugins' );
			},
			get description() {
				return translate(
					'Along with all the tools and features built right into WordPress.com, the Pro plan ' +
						'allows you to install other plugins.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/business-plan/' );
			},
			post_id: 134940,
			get title() {
				return translate( 'Business Plan' );
			},
			get description() {
				return translate(
					"When you want to build a one-of-a-kind website, it's time for WordPress.com Pro: " +
						'upload plugins and themes to create a truly tailored experience for your visitors.'
				);
			},
		},
	],
	'posts-pages': [
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
				);
			},
			post_id: 143180,
			get title() {
				return translate( 'Do I Need a Website, a Blog, or a Website with a Blog?' );
			},
			get description() {
				return translate(
					'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/five-step-website-setup/' );
			},
			post_id: 100856,
			get title() {
				return translate( 'Build Your Website in Five Steps' );
			},
			get description() {
				return translate(
					'You’ve registered a website on WordPress.com. But now what? ' +
						'Learn five steps that will get the framework of your new website all set up, ' +
						'leaving it ready and waiting for your great content'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/pages/landing-pages/' );
			},
			post_id: 124077,
			get title() {
				return translate( 'Landing Pages' );
			},
			get description() {
				return translate(
					'Landing pages are pages with a single purpose: encouraging your visitors to, for example, sign up for ' +
						'a service, buy a product, or join a mailing list.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/' );
			},
			post_id: 84,
			get title() {
				return translate( 'About Blog Posts' );
			},
			get description() {
				return translate(
					'Posts are what make your blog a blog — they’re servings of content that are listed in reverse chronological order.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/post-formats/' );
			},
			post_id: 10382,
			get title() {
				return translate( 'Post Formats' );
			},
			get description() {
				return translate(
					'Learn how to make gallery, video, audio, and other post types pop with post formats. '
				);
			},
		},
	],
	'settings-writing': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/writing-settings/' );
			},
			post_id: 1502,
			get title() {
				return translate( 'Writing Settings' );
			},
			get description() {
				return translate( 'Learn how to manage categories, date format, content types, and more.' );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/categories-vs-tags/' );
			},
			post_id: 2135,
			get title() {
				return translate( 'Categories vs. Tags' );
			},
			get description() {
				return translate( 'Learn the differences between categories and tags.' );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/feeds/' );
			},
			post_id: 3589,
			get title() {
				return translate( 'Feeds' );
			},
			get description() {
				return translate(
					'A feed (often called RSS) is a stream of posts or comments that is updated when new content is published.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/portfolios/' );
			},
			post_id: 84808,
			get title() {
				return translate( 'Portfolios' );
			},
			get description() {
				return translate(
					'To show off your portfolio separate from your blog posts and pages, the Portfolio content type will let you' +
						' manage all your portfolio projects in one place.'
				);
			},
		},
	],
	'settings-discussion': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/discussion-settings/' );
			},
			post_id: 1504,
			get title() {
				return translate( 'Discussion Settings' );
			},
			get description() {
				return translate(
					'The Discussion Settings are used to control how visitors and other blogs interact with your site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/enable-disable-comments-for-future-posts/'
				);
			},
			post_id: 5997,
			get title() {
				return translate( 'Enable and Disable Comments for Future Posts' );
			},
			get description() {
				return translate(
					'You can enable/disable comments on future posts by going into your Discussion settings. '
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comments/' );
			},
			post_id: 113,
			get title() {
				return translate( 'Comments' );
			},
			get description() {
				return translate(
					'Comments are a way for visitors to add feedback to your posts and pages.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/subscriptions-and-newsletters/' );
			},
			post_id: 67810,
			get title() {
				return translate( 'Subscriptions and Newsletters' );
			},
			get description() {
				return translate(
					'Learn how readers can subscribe to your blog to receive email notifications of all of your posts.'
				);
			},
		},
	],
	'settings-traffic': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' );
			},
			post_id: 3307,
			get title() {
				return translate( 'Get More Views and Traffic' );
			},
			get description() {
				return translate(
					'Want more traffic? Here are some tips for attracting more visitors to your site!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/related-posts/' );
			},
			post_id: 1545,
			get title() {
				return translate( 'Related Posts' );
			},
			get description() {
				return translate(
					'The Related Posts feature pulls relevant content from your blog to display at the bottom of your posts.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/site-verification-services/' );
			},
			post_id: 5022,
			get title() {
				return translate( 'Site Verification Services' );
			},
			get description() {
				return translate(
					'Learn how to verify your WordPress.com site for the webmaster tools that many search engines provide.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/amp-accelerated-mobile-pages/' );
			},
			post_id: 122516,
			get title() {
				return translate( 'Accelerated Mobile Pages (AMP)' );
			},
			get description() {
				return translate(
					'Accelerated Mobile Pages (AMP) allows browsers and apps to load your site more quickly on mobile devices. ' +
						'By default, it is enabled for every WordPress.com site.'
				);
			},
		},
	],
	'settings-security': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/security/' );
			},
			post_id: 10977,
			get title() {
				return translate( 'Security' );
			},
			get description() {
				return translate(
					'Learn what we do to help protect your site and your personal data, along with added steps ' +
						'we recommend you take to do the same.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/unwanted-comments/' );
			},
			post_id: 5882,
			get title() {
				return translate( 'Unwanted Comments and Comment Spam' );
			},
			get description() {
				return translate(
					'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/selecting-a-strong-password/' );
			},
			post_id: 35364,
			get title() {
				return translate( 'Selecting A Strong Password' );
			},
			get description() {
				return translate(
					'The weakest point in any security for your online accounts is usually your password. Learn how to select a strong one.'
				);
			},
		},
	],
	settings: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/' );
			},
			post_id: 497,
			get title() {
				return translate( 'Settings' );
			},
			get description() {
				return translate(
					'The Settings menu of your site is where you will configure everything about how the blog works and functions.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/general-settings/' );
			},
			post_id: 1501,
			get title() {
				return translate( 'General Settings' );
			},
			get description() {
				return translate(
					'The General Settings let you control how your site is displayed, such as the ' +
						'title, tagline, language, and visibility.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/site-icons/' );
			},
			post_id: 1327,
			get title() {
				return translate( 'Site Icons' );
			},
			get description() {
				return translate(
					'A Site Icon is a unique icon for your site that is shown in your visitor’s browser tab ' +
						'and other places around WordPress.com.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/five-step-blog-setup/' );
			},
			post_id: 100846,
			get title() {
				return translate( 'Five Steps to Your Great New Blog' );
			},
			get description() {
				return translate(
					'Get ready to publish! Our five-step checklist walks you through all the fundamentals.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
	],
	themes: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/themes/' );
			},
			post_id: 2278,
			get title() {
				return translate( 'Themes: An Overview' );
			},
			get description() {
				return translate(
					'A theme controls the general look and feel of your site including things like ' +
						'page layout, widget locations, and default font.'
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/themes/uploading-setting-up-custom-themes/child-themes/'
				);
			},
			post_id: 134704,
			get title() {
				return translate( 'Child Themes' );
			},
			get description() {
				return translate(
					"The only limit on your site is your vision — if the themes you see don't match that, it's " +
						'time to go beyond them. Learn to use child themes to customize and extend your website.'
				);
			},
		},
	],
	theme: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/themes/' );
			},
			post_id: 134704,
			get title() {
				return translate( 'Themes: An Overview' );
			},
			get description() {
				return translate(
					'A theme controls the general look and feel of your site including things like ' +
						'page layout, widget locations, and default font.'
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/themes/uploading-setting-up-custom-themes/child-themes/'
				);
			},
			get title() {
				return translate( 'Child Themes' );
			},
			post_id: 134704,
			get description() {
				return translate(
					"The only limit on your site is your vision — if the themes you see don't match that, it's " +
						'time to go beyond them. Learn to use child themes to customize and extend your website.'
				);
			},
		},
	],
	plans: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/discover-the-wordpress-com-plans/' );
			},
			post_id: 140323,
			get title() {
				return translate( 'Explore the WordPress.com Plans' );
			},
			get description() {
				return translate(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals."
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plan-features/' );
			},
			post_id: 134698,
			get title() {
				return translate( 'WordPress.com Plans' );
			},
			get description() {
				return translate(
					'Learn about the capabilities and features that the different plans unlock for your site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/auto-renewal/' );
			},
			post_id: 110924,
			get title() {
				return translate( 'Subscriptions for Plans and Domains' );
			},
			get description() {
				return translate(
					'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
						'subscription that renews automatically.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/jetpack-add-ons/' );
			},
			post_id: 115025,
			get title() {
				return translate( 'Jetpack Plans' );
			},
			get description() {
				return translate(
					'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
	],
	'gutenberg-editor': [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/wordpress-editor/' );
			},
			post_id: 147594,
			get title() {
				return translate( 'What are "Blocks"?' );
			},
			get description() {
				return translate(
					'The WordPress Editor uses blocks to transform the way you create content: it turns a single document into a collection of discrete elements with explicit, easy-to-tweak structure.'
				);
			},
		},
		{
			intent: SELL_INTENT,
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/'
				);
			},
			post_id: 175999,
			get title() {
				return translate( 'The Payments Block' );
			},
			get description() {
				return translate(
					"The Payments block is one of WordPress.com's payment blocks that allows you to accept payments for one-time, monthly recurring, or annual payments on your website."
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/xml-rpc/' );
			},
			post_id: 3595,
			get title() {
				return translate( 'Offline Editing' );
			},
			get description() {
				return translate(
					'Learn how to create and edit content for your WordPress.com site even without being connected to the internet!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/adding-users/' );
			},
			post_id: 2160,
			get title() {
				return translate( 'Inviting Contributors, Followers, and Viewers' );
			},
			get description() {
				return translate(
					'Invite contributors, followers, and viewers to collaborate with others and grow your audience!'
				);
			},
		},
	],
	reader: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/reader/' );
			},
			post_id: 32011,
			get title() {
				return translate( 'The Reader: An Overview' );
			},
			get description() {
				return translate(
					'Read posts from all the sites you follow — even ones that aren’t on WordPress.com! ' +
						'Discover great new reads and keep track of your comments and replies in one convenient place.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following/' );
			},
			post_id: 4899,
			get title() {
				return translate( 'Follow Blogs' );
			},
			get description() {
				return translate(
					'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/topics/' );
			},
			post_id: 2166,
			get title() {
				return translate( 'Following Specific Topics in the Reader' );
			},
			get description() {
				return translate(
					'Looking for posts on a specific topic? Besides following entire blogs, you can also follow posts on a specific subject ' +
						'from across WordPress.com. You do this by adding the topic you’re interested in under the Tags heading in the Reader.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/grow-your-community/' );
			},
			post_id: 132190,
			get title() {
				return translate( 'Grow Your Community' );
			},
			get description() {
				return translate(
					'You’ve worked hard on building your site, now it’s time to explore the community and get noticed.'
				);
			},
		},
	],
	help: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/blogging-u/' );
			},
			post_id: 117437,
			get title() {
				return translate( 'Blogging U.' );
			},
			get description() {
				return translate(
					'Blogging U. courses deliver free expert advice, pro tips, and inspiration right to your ' +
						'email inbox. Sign up now!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/help-support-options/' );
			},
			post_id: 149,
			get title() {
				return translate( 'Help! Getting WordPress.com Support' );
			},
			get description() {
				return translate(
					'WordPress.com offers a number of avenues for reaching helpful, individualized support.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/' );
			},
			get title() {
				return translate( 'All Support Articles' );
			},
			get description() {
				return translate( 'Looking to learn more about a feature? Our docs have all the details.' );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://learn.wordpress.com/' );
			},
			get title() {
				return translate( 'Self-guided Online Tutorial' );
			},
			get description() {
				return translate( 'A step-by-step guide to getting familiar with the platform.' );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
	],
	comments: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comments/' );
			},
			post_id: 113,
			get title() {
				return translate( 'Comments' );
			},
			get description() {
				return translate(
					'Comments are a way for visitors to add feedback to your posts and pages.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comment-display-options/' );
			},
			post_id: 5840,
			get title() {
				return translate( 'Comment Display Options' );
			},
			get description() {
				return translate(
					'You can control comment threading, paging, and comment order settings from the ' +
						'Discussion Settings page in your site’s settings.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/unwanted-comments/' );
			},
			post_id: 5882,
			get title() {
				return translate( 'Unwanted Comments and Comment Spam' );
			},
			get description() {
				return translate(
					'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comment-likes/' );
			},
			post_id: 88757,
			get title() {
				return translate( 'Comment Likes' );
			},
			get description() {
				return translate(
					'Comment Likes: how to like others’ comments and control how Comment Likes appear on your site.'
				);
			},
		},
	],
	hosting: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/sftp/' );
			},
			post_id: 159771,
			get title() {
				return translate( 'SFTP on WordPress.com' );
			},
			get description() {
				return translate(
					"Access and edit your website's files directly by using an SFTP client."
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/phpmyadmin-and-mysql/' );
			},
			post_id: 159822,
			get title() {
				return translate( 'phpMyAdmin and MySQL' );
			},
			get description() {
				return translate(
					'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/php-version-switching/' );
			},
			post_id: 160597,
			get title() {
				return translate( 'PHP Version Switching' );
			},
			get description() {
				return translate(
					'Sites on the Pro Plan using custom plugins and/or custom themes now have the option to switch PHP versions.'
				);
			},
		},
	],
	checkout: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plan-features/' );
			},
			post_id: 134698,
			get title() {
				return translate( 'WordPress.com Plans' );
			},
			get description() {
				return translate(
					'Learn about the capabilities and features that the different plans unlock for your site.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/jetpack-add-ons/' );
			},
			post_id: 115025,
			get title() {
				return translate( 'Jetpack Plans' );
			},
			get description() {
				return translate(
					'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Manage Purchases and Refund Policy' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/auto-renewal/' );
			},
			post_id: 110924,
			get title() {
				return translate( 'Subscriptions for Plans and Domains' );
			},
			get description() {
				return translate(
					'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
						'subscription that renews automatically.'
				);
			},
		},
	],
	domains: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/add-email/' );
			},
			post_id: 34087,
			get title() {
				return translate( 'Add Email to your Domain' );
			},
			get description() {
				return translate(
					'Want to use a custom email with your domain, such as info@yourgroovydomain.com? There are multiple ways to add email to your custom domain.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' );
			},
			post_id: 6595,
			get title() {
				return translate( 'Manage Custom DNS' );
			},
			get description() {
				return translate(
					'Custom DNS records are special settings that change how your domain works. They allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider.'
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/move-domain/transfer-domain-registration/'
				);
			},
			post_id: 41298,
			get title() {
				return translate( 'Transfer a Domain to Another Registrar' );
			},
			get description() {
				return translate(
					'This article walks you through transferring your domain registration to another registrar. Your domain will need to be unlocked and privacy removed (if applicable) for the transfer.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domain-mapping-vs-domain-transfer/' );
			},
			post_id: 157655,
			get title() {
				return translate( 'Connect an Existing Domain' );
			},
			get description() {
				return translate(
					'You can connect an existing domain you own that’s registered elsewhere by either mapping or transferring. Domain mapping lets you connect a domain while keeping it registered at the current registrar (where you purchased the domain from). Domain transferring moves the domain to WordPress.com so we become the new registrar.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domains/' );
			},
			post_id: 1988,
			get title() {
				return translate( 'All about domains' );
			},
			get description() {
				return translate(
					'A domain name is an address people use to visit your site. It tells the web browser where to look for your site. Just like a street address, a domain is how people visit your website online. And, like having a sign in front of your store, a custom domain name helps give your site a professional look.'
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return translate( 'Managing Purchases, Renewals, and Cancellations' );
			},
			get description() {
				return translate(
					'Have a question or need to change something about a purchase you have made? Learn how.'
				);
			},
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
			link: 'https://www.youtube.com/watch?v=YVelWG3hf3o',
			get title() {
				return translate( 'Add Social Sharing Buttons to Your Website' );
			},
			get description() {
				return translate(
					'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
						'do with a Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=NcCe0ozmqFM',
			get title() {
				return translate( 'Connect Your Blog to Facebook Using Publicize' );
			},
			get description() {
				return translate(
					'Find out how to share blog posts directly on Facebook from your WordPress.com site, ' +
						'which you can also do on a Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=f44-4TgnWTs',
			get title() {
				return translate( 'Display Your Instagram Feed on Your Website' );
			},
			get description() {
				return translate(
					'Find out how to display your latest Instagram photos right on your WordPress.com site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3rTooGV_mlg',
			get title() {
				return translate( 'Set Up the Social Links Menu' );
			},
			get description() {
				return translate(
					'Find out how to set up a social links menu on your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=gmrOkkqMNlc',
			get title() {
				return translate( 'Embed a Twitter Timeline in your Sidebar' );
			},
			get description() {
				return translate(
					'Find out how to display your Twitter timeline on your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vy-U5saqG9A',
			get title() {
				return translate( 'Set Up a Social Media Icons Widget' );
			},
			get description() {
				return translate(
					'Find out how to set up the social media icons widget on your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=N0GRBFRkzzs',
			get title() {
				return translate( 'Embed a Tweet from Twitter in Your Website' );
			},
			get description() {
				return translate(
					'Find out how to embed a Tweet in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=uVRji6bKJUE',
			get title() {
				return translate( 'Embed an Instagram Photo in Your Website' );
			},
			get description() {
				return translate(
					'Find out how to embed an Instagram photo in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=sKm3Q83JxM0',
			get title() {
				return translate( 'Embed a Facebook Update in Your Website' );
			},
			get description() {
				return translate(
					'Find out how to embed a Facebook update in your content (including posts, pages, and even comments) on your ' +
						'WordPress.com or Jetpack-enabled WordPress website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=SBgNkre_b14',
			get title() {
				return translate( 'Share Blog Posts Directly on Twitter' );
			},
			get description() {
				return translate(
					'Find out how to share blog posts directly on Twitter from your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
	],
	settings: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=0YCZ22k4SfQ',
			get title() {
				return translate( 'Add a Site Logo' );
			},
			get description() {
				return translate( 'Find out how to add a custom logo to your WordPress.com site.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vucZ1uZ2NPo',
			get title() {
				return translate( 'Update Your Website Title and Tagline' );
			},
			get description() {
				return translate(
					'Find out how to update the Title and Tagline of your WordPress.com site, which you can also ' +
						'do on your Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Y6iPsPwYD7g',
			get title() {
				return translate( 'Change Your Privacy Settings' );
			},
			get description() {
				return translate(
					'Find out how to change your website privacy settings on WordPress.com.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bjxKGxW0MRA',
			get title() {
				return translate( 'Add a Site Icon' );
			},
			get description() {
				return translate( 'Find out how to add a site icon on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=z6fCtvLB0wM',
			get title() {
				return translate( 'Create a Multilingual Site' );
			},
			get description() {
				return translate( 'Find out how to create a multilingual site on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=D142Edhcpaw',
			get title() {
				return translate( 'Customize Your Content Options' );
			},
			get description() {
				return translate(
					'Find out how to customize your content options on select WordPress.com themes.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Vyr-g5SEuIA',
			get title() {
				return translate( 'Change Your Language Settings' );
			},
			get description() {
				return translate(
					'Find out how to change your blog or website language and your interface language settings on WordPress.com.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=EUuEuW_LCrc',
			get title() {
				return translate( 'Activate Free Email Forwarding' );
			},
			get description() {
				return translate(
					'Find out how to activate free email forwarding from an address using a custom domain registered through WordPress.com.'
				);
			},
		},
	],
	account: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=aO-6yu3_xWQ',
			get title() {
				return translate( 'Change Your Password' );
			},
			get description() {
				return translate( 'Find out how to change your account password on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=qhsjkqFdDZo',
			get title() {
				return translate( 'Change Your WordPress.com Username' );
			},
			get description() {
				return translate( 'Find out how to change your username on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Tyxu_xT6q1k',
			get title() {
				return translate( 'Change Your WordPress.com Display Name' );
			},
			get description() {
				return translate( 'Find out how to change your display name on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=07Nf8FkjO4o',
			get title() {
				return translate( 'Change Your Account Email Address' );
			},
			get description() {
				return translate( 'Find out how to change your account email address on WordPress.com.' );
			},
		},
	],
	customizer: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=pf_ST7gvY8c',
			get title() {
				return translate( 'Add a Custom Header Image' );
			},
			get description() {
				return translate(
					'Find out how to add a custom header image to your WordPress.com website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=CY20IAtl2Ac',
			get title() {
				return translate( 'Create a Custom Website Menu' );
			},
			get description() {
				return translate(
					'Find out how to create a custom menu on your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=2H_Jsgh2Z3Y',
			get title() {
				return translate( 'Add a Widget' );
			},
			get description() {
				return translate( 'Find out how to add a widget to your WordPress.com website.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=ypFF4ONBfSQ',
			get title() {
				return translate( 'Add a Custom Background' );
			},
			get description() {
				return translate( 'Find out how to add a custom background to your WordPress.com site.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=b8EuJDrNeOA',
			get title() {
				return translate( 'Change Your Site Fonts' );
			},
			get description() {
				return translate(
					'Find out how to change the fonts on your WordPress.com website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=7VPgvxV78Kc',
			get title() {
				return translate( 'Add a Gallery Widget' );
			},
			get description() {
				return translate(
					'Find out how to add an image gallery widget to your WordPress.com website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=oDBuaBLrwF8',
			get title() {
				return translate( 'Use Featured Content' );
			},
			get description() {
				return translate(
					'Find out how to use the Featured Content option on your WordPress.com website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3TqRr21zyiA',
			get title() {
				return translate( 'Add an Image Widget' );
			},
			get description() {
				return translate(
					'Find out how to add an image widget to your WordPress.com website or blog.'
				);
			},
		},
	],
	'posts-pages': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3RPidSCQ0LI',
			get title() {
				return translate( 'Create a Landing Page' );
			},
			get description() {
				return translate(
					'Find out how to create a one-page website or landing page on your WordPress.com site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=4IkFQzl5nXc',
			get title() {
				return translate( 'Set Up a Website in 5 Steps' );
			},
			get description() {
				return translate( 'Find out how to create a website on WordPress.com in five steps.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mta6Y0o7yJk',
			get title() {
				return translate( 'Set Up a Blog in 5 Steps' );
			},
			get description() {
				return translate( 'Find out how to create a blog on WordPress.com in five steps.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Gx7YNX1Wk5U',
			get title() {
				return translate( 'Create a Page' );
			},
			get description() {
				return translate( 'Find out how to create a page on your WordPress.com site.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mCfuh5bCOwM',
			get title() {
				return translate( 'Create a Post' );
			},
			get description() {
				return translate( 'Find out how to create a post on WordPress.com.' );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bEVHg6nopcs',
			get title() {
				return translate( 'Use a Custom Menu in a Widget' );
			},
			get description() {
				return translate(
					'Find out how to use a custom menu in a widget on your WordPress.com or Jetpack-enabled WordPress site.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=nAzdUOlFoBI',
			get title() {
				return translate( 'Configure a Static Homepage' );
			},
			get description() {
				return translate(
					'By default, your new WordPress.com website displays your latest posts. Find out how to create a static homepage instead.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=MPpVeMmDOhk',
			get title() {
				return translate( 'Show Related Posts on Your WordPress Blog' );
			},
			get description() {
				return translate(
					'Find out how to show related posts on your WordPress.com site, which you can also do on a Jetpack-enabled WordPress blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=JVnltCZUKC4',
			get title() {
				return translate( 'Add Testimonials' );
			},
			get description() {
				return translate(
					'Find out how to add testimonials to your WordPress.com website or blog.'
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yH_gapAUGAA',
			get title() {
				return translate( 'Change Your Post or Page Visibility Settings' );
			},
			get description() {
				return translate(
					'Find out how to change your page or post visibility settings WordPress.com.'
				);
			},
		},
	],
	media: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=VjGnEHyqVqQ',
			get title() {
				return translate( 'Add a Photo Gallery' );
			},
			get description() {
				return translate(
					'Find out how to add a photo gallery on your WordPress.com and Jetpack-enabled website.'
				);
			},
		},
	],
	themes: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yOfAuOb68Hc',
			get title() {
				return translate( 'Change Your Website Theme on WordPress.com' );
			},
			get description() {
				return translate( 'Find out how to change your WordPress.com theme.' );
			},
		},
	],
};

const toursForSection = {
	media: [
		{
			type: RESULT_TOUR,
			tour: 'mediaBasicsTour',
			key: 'tour:mediaBasicsTour',
			get title() {
				return translate( 'Learn Media Library Basics' );
			},
			get description() {
				return translate(
					'The Media Library is a useful tool to help you manage, search, and edit your photos, videos, documents, and other media.'
				);
			},
		},
	],
};

export function getContextResults( section, siteIntent ) {
	// Posts and Pages have a common help section
	if ( section === 'posts' || section === 'pages' ) {
		section = 'posts-pages';
	}

	const fallbackLinks = siteIntent === 'write' ? bloggerFallbackLinks : defaultFallbackLinks;
	// make sure editorially to show at most one tour and one video at once
	// `first` is a safe-guard in case that fails
	const video = videosForSection[ section ]?.[ 0 ];
	const tour = toursForSection[ section ]?.[ 0 ];
	let links = contextLinksForSection[ section ] ?? fallbackLinks;

	// If true, still display fallback links in addition (as opposed to instead
	// of) the other context links.
	if ( section === 'home' ) {
		return [ tour, video, ...fallbackLinks, ...links ].filter( Boolean );
	}

	// Remove sell docs if not on a site with the 'sell' intent.
	if ( section === 'gutenberg-editor' && siteIntent !== 'sell' ) {
		links = links.filter( ( link ) => {
			return link.intent !== SELL_INTENT;
		} );
	}

	return [ tour, video, ...links ].filter( Boolean );
}
