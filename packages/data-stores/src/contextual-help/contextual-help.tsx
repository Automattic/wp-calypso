import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { RESULT_TOUR, RESULT_VIDEO, SELL_INTENT } from './constants';

export type LinksForSection = {
	readonly link: string;
	post_id?: number;
	readonly title: React.ReactChild;
	readonly description?: React.ReactChild;
	readonly intent?: string;
	icon?: string;
};
/**
 * Module variables
 */

/* eslint-disable inclusive-language/use-inclusive-words */
// All usage of the word "master" here refers to the verb (ie. "to learn"), not a synonym of "primary".
export const defaultFallbackLinks = [
	{
		get link() {
			return localizeUrl(
				'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/'
			);
		},
		post_id: 143180,
		get title() {
			return __( 'Do I Need a Website, a Blog, or a Website with a Blog?', __i18n_text_domain__ );
		},
		get description() {
			return __(
				'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.'
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/pro-plan/' );
		},
		post_id: 134940,
		get title() {
			return __( 'Uploading custom plugins and themes', __i18n_text_domain__ );
		},
		get description() {
			return __(
				'Learn more about installing a custom theme or plugin using the Business plan.',
				__i18n_text_domain__
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/domains/' );
		},
		post_id: 1988,
		get title() {
			return __( 'All About Domains', __i18n_text_domain__ );
		},
		get description() {
			return __(
				'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
				__i18n_text_domain__
			);
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/start/' );
		},
		post_id: 81083,
		get title() {
			return __( 'Quick-Start Guide', __i18n_text_domain__ );
		},
		get description() {
			return __(
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
			return __( 'Privacy Settings', __i18n_text_domain__ );
		},
		get description() {
			return __(
				'Limit your site’s visibility or make it completely private.',
				__i18n_text_domain__
			);
		},
	},
];

export const bloggerFallbackLinks: LinksForSection[] = [
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/posts/' );
		},
		get title() {
			return __( 'All about blog posts', __i18n_text_domain__ );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/subscriptions-and-newsletters/' );
		},
		get title() {
			return __( 'Encourage visitors to subscribe to your content', __i18n_text_domain__ );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/publicize/' );
		},
		get title() {
			return __( 'Share your content to social media automatically', __i18n_text_domain__ );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/sharing/' );
		},
		get title() {
			return __( 'Encourage visitors to share your content', __i18n_text_domain__ );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/seo/' );
		},
		get title() {
			return __( 'Learn about how to get noticed by search engines', __i18n_text_domain__ );
		},
	},
	{
		get link() {
			return localizeUrl( 'https://wordpress.com/support/site-verification-services/' );
		},
		get title() {
			return __( 'Verify your site with Google and other services', __i18n_text_domain__ );
		},
	},
];

export const contextLinksForSection: Record< string, LinksForSection | LinksForSection[] > = {
	stats: [
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/stats/' );
			},
			post_id: 4454,
			get title() {
				return __( 'Understanding the Stats Page', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your stats page includes a bunch of nifty graphs, charts, and lists that show you how many ' +
						'visits your site gets, what posts and pages are the most popular ones, and much more. Learn what it all means.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' );
			},
			post_id: 3307,
			get title() {
				return __( 'Getting More Views and Traffic', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Want more traffic? Here are some tips for attracting more visitors to your site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/getting-more-views-and-traffic/' );
			},
			post_id: 132186,
			get title() {
				return __( 'Increase Your Site Traffic', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'One of the most frequent questions our community members ask us — and themselves — ' +
						'is how to get more traffic. Here are a few best practices.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/grow-your-community/' );
			},
			post_id: 132190,
			get title() {
				return __( 'Grow Your Community', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You’ve worked hard on building your site, now it’s time to explore the community and get noticed. Learn how.',
					__i18n_text_domain__
				);
			},
		},
	],
	sharing: [
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/video-tutorials/',
					__i18n_text_domain__
				);
			},
			post_id: 130825,
			get title() {
				return __( 'Integrate and Connect to Social Media', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Start sharing your site and attract more traffic and visitors to your content! ' +
						'Learn to activate and control the social media and sharing options on your website or blog through these videos.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/sharing/' );
			},
			post_id: 7499,
			get title() {
				return __( 'Sharing Your Content', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'At the bottom of each post or page, you can include sharing buttons for your readers ' +
						'to make it easier to share your content.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/instagram/' );
			},
			post_id: 77589,
			get title() {
				return __( 'Using Instagram', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Instagram is a simple way to capture, customize, ' +
						'and share photos and short videos using your smartphone or other mobile device. Learn how to use it with your website!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/twitter/' );
			},
			post_id: 124,
			get title() {
				return __( 'Using Twitter', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Twitter is a service for the exchange of brief messages, commonly ' +
						'called "tweets", between users. Learn how to use it with your website!',
					__i18n_text_domain__
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
				return __( 'Managing Purchases', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
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
				return __( 'Managing Your Profile', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your profile is the information you’d like to be shown along with your ' +
						'name when you publish content or comment on WordPress.com sites.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/gravatars/' );
			},
			post_id: 1338,
			get title() {
				return __( 'Your Profile Picture', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'WordPress.com associates an Avatar with your email address. Gravatar ' +
						'powers the user avatars on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/close-account/' );
			},
			post_id: 138080,
			get title() {
				return __( 'Account Closure', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Need a fresh start? Learn how to close your account.', __i18n_text_domain__ );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/change-your-username/' );
			},
			post_id: 2116,
			get title() {
				return __( 'Change Your Username', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can change both your WordPress.com account username (the name you use to login) ' +
						'and your display name (the name that is seen on your posts and comments). Learn how!',
					__i18n_text_domain__
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
				return __( 'Change Your Username', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can change both your WordPress.com account username (the name you use to login) ' +
						'and your display name (the name that is seen on your posts and comments). Learn how!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-your-account/' );
			},
			post_id: 130826,
			get title() {
				return __( 'Manage Your Account', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn the ins and outs of managing your WordPress.com account and site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-settings/' );
			},
			post_id: 80368,
			get title() {
				return __( 'Edit Your Account Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can review and edit basic account information in Account Settings. ',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/close-account/' );
			},
			post_id: 143899,
			get title() {
				return __( 'Close Your Account', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how to permanently delete your WordPress.com account, and what it means for your website and data.',
					__i18n_text_domain__
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
				return __( 'Two-Step Authentication', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your WordPress.com site is your home on the internet, and you want to keep that home safe. ' +
						'Learn how to add an additional "lock" to your account!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/account-recovery/' );
			},
			post_id: 46365,
			get title() {
				return __( 'Account Recovery', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'At some point, you may run into a situation in which you’ve lost access to your account. Learn how to get back on track!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/passwords/' );
			},
			post_id: 89,
			get title() {
				return __( 'Passwords And How To Use Them', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Passwords are very important to user accounts, and there may come a time when you need to change your password.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/third-party-applications/' );
			},
			post_id: 17288,
			get title() {
				return __( 'Third Party Applications', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'WordPress.com allows you to connect with third-party applications that ' +
						'extend your WordPress.com site in new and cool ways.',
					__i18n_text_domain__
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
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/#automatic-renewal' );
			},
			post_id: 110924,
			get title() {
				return __( 'Subscriptions for Plans and Domains', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your WordPress.com plans and any domains you add to your sites are based ' +
						'on a yearly subscription that renews automatically.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://en.support.wordpress.com/plan-features/' );
			},
			post_id: 140323,
			get title() {
				return __( 'Explore the WordPress.com Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals.",
					__i18n_text_domain__
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
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/#automatic-renewal' );
			},
			post_id: 110924,
			get title() {
				return __( 'Subscriptions for Plans and Domains', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your WordPress.com plans and any domains you add to your sites are based ' +
						'on a yearly subscription that renews automatically.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://en.support.wordpress.com/plan-features/' );
			},
			post_id: 140323,
			get title() {
				return __( 'Explore the WordPress.com Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals.",
					__i18n_text_domain__
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
				return __( 'Notifications', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Notifications help you stay on top of the activity on your site and all the things happening on ' +
						'WordPress.com — learn how to use them.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/email-notifications/' );
			},
			post_id: 9443,
			get title() {
				return __( 'Email Notifications', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'WordPress.com sends email notifications to the email address registered to your account. Learn how to manage them.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following-comments/' );
			},
			post_id: 4576,
			get title() {
				return __( 'Following Comments', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'When you leave a comment, you can automatically get email notifications for other new comments ' +
						"on the same post or page — you'll never be out of the loop.",
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following/' );
			},
			post_id: 4899,
			get title() {
				return __( 'Following Blogs', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.',
					__i18n_text_domain__
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
				return __( 'The Media Library', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Media Library is where you can manage your images, audio, videos, and documents all in one place.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/finding-free-images-and-other-media/',
					__i18n_text_domain__
				);
			},
			post_id: 78425,
			get title() {
				return __( 'Finding Free Images and other Media', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Use free images (and other media) to make your pages and posts more interesting and engaging when on a budget!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/image-block/' );
			},
			post_id: 38830,
			get title() {
				return __( 'Add Media', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Dress up your text-based posts and pages with individual images, image galleries, ' +
						'slideshows, videos, and audio.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/videos/' );
			},
			post_id: 4744,
			get title() {
				return __( 'Including Videos', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Videos are a great way to enhance your site pages and blog posts. Learn how to include them.',
					__i18n_text_domain__
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
				return __( 'User Roles', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'User roles determine the access level or permissions of a person authorized to use a WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/user-mentions/' );
			},
			post_id: 91788,
			get title() {
				return __( 'User Mentions', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'User mentions are a great way to include other WordPress.com users within your ' +
						'posts and comments.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://en.support.wordpress.com/user-roles/' );
			},
			post_id: 2160,
			get title() {
				return __( 'Inviting Contributors, Followers, and Viewers', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Invite contributors, followers, and viewers to collaborate with others and grow your audience!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/followers/' );
			},
			post_id: 5444,
			get title() {
				return __( 'Your Followers', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'When someone follows your site, each time you publish new content on your blog they ' +
						'receive an update in their Reader, via email, or both depending on their settings.',
					__i18n_text_domain__
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
				return __( 'Using Plugins', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'On WordPress.com, we include the most popular plugin functionality within our ' +
						'sites automatically. Additionally, the Business plan allows you to choose from many ' +
						'thousands of plugins, and install them on your site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plugins/#managing-plugins' );
			},
			post_id: 134818,
			get title() {
				return __( 'Managing plugins', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'After you install a plugin, it will appear in a list at My Sites → Plugins.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plugins/#installing-plugins' );
			},
			post_id: 134719,
			get title() {
				return __( 'Adding Plugins', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Along with all the tools and features built right into WordPress.com, the Business plan ' +
						'allows you to install other plugins.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/pro-plan/' );
			},
			post_id: 134940,
			get title() {
				return __( 'Business Plan', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"When you want to build a one-of-a-kind website, it's time for WordPress.com Business: " +
						'upload plugins and themes to create a truly tailored experience for your visitors.',
					__i18n_text_domain__
				);
			},
		},
	],
	'posts-pages': [
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/',
					__i18n_text_domain__
				);
			},
			post_id: 143180,
			get title() {
				return __( 'Do I Need a Website, a Blog, or a Website with a Blog?', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/five-step-website-setup/' );
			},
			post_id: 100856,
			get title() {
				return __( 'Build Your Website in Five Steps', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You’ve registered a website on WordPress.com. But now what? ' +
						'Learn five steps that will get the framework of your new website all set up, ' +
						'leaving it ready and waiting for your great content',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/pages/landing-pages/' );
			},
			post_id: 124077,
			get title() {
				return __( 'Landing Pages', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Landing pages are pages with a single purpose: encouraging your visitors to, for example, sign up for ' +
						'a service, buy a product, or join a mailing list.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/' );
			},
			post_id: 84,
			get title() {
				return __( 'About Blog Posts', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Posts are what make your blog a blog — they’re servings of content that are listed in reverse chronological order.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/post-formats/' );
			},
			post_id: 10382,
			get title() {
				return __( 'Post Formats', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how to make gallery, video, audio, and other post types pop with post formats. ',
					__i18n_text_domain__
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
				return __( 'Writing Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how to manage categories, date format, content types, and more.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/posts/categories-vs-tags/' );
			},
			post_id: 2135,
			get title() {
				return __( 'Categories vs. Tags', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Learn the differences between categories and tags.', __i18n_text_domain__ );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/feeds/' );
			},
			post_id: 3589,
			get title() {
				return __( 'Feeds', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A feed (often called RSS) is a stream of posts or comments that is updated when new content is published.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/portfolios/' );
			},
			post_id: 84808,
			get title() {
				return __( 'Portfolios', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'To show off your portfolio separate from your blog posts and pages, the Portfolio content type will let you' +
						' manage all your portfolio projects in one place.',
					__i18n_text_domain__
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
				return __( 'Discussion Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Discussion Settings are used to control how visitors and other blogs interact with your site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comments/', __i18n_text_domain__ );
			},
			post_id: 5997,
			get title() {
				return __( 'Enable and Disable Comments for Future Posts', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can enable/disable comments on future posts by going into your Discussion settings. ',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comments/' );
			},
			post_id: 113,
			get title() {
				return __( 'Comments', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Comments are a way for visitors to add feedback to your posts and pages.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/subscriptions-and-newsletters/' );
			},
			post_id: 67810,
			get title() {
				return __( 'Subscriptions and Newsletters', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how readers can subscribe to your blog to receive email notifications of all of your posts.',
					__i18n_text_domain__
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
				return __( 'Get More Views and Traffic', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Want more traffic? Here are some tips for attracting more visitors to your site!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/related-posts/' );
			},
			post_id: 1545,
			get title() {
				return __( 'Related Posts', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Related Posts feature pulls relevant content from your blog to display at the bottom of your posts.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/site-verification-services/' );
			},
			post_id: 5022,
			get title() {
				return __( 'Site Verification Services', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how to verify your WordPress.com site for the webmaster tools that many search engines provide.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/amp-accelerated-mobile-pages/' );
			},
			post_id: 122516,
			get title() {
				return __( 'Accelerated Mobile Pages (AMP)', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Accelerated Mobile Pages (AMP) allows browsers and apps to load your site more quickly on mobile devices. ' +
						'By default, it is enabled for every WordPress.com site.',
					__i18n_text_domain__
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
				return __( 'Security', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn what we do to help protect your site and your personal data, along with added steps ' +
						'we recommend you take to do the same.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/comments/#unwanted-comments-and-comment-spam'
				);
			},
			post_id: 5882,
			get title() {
				return __( 'Unwanted Comments and Comment Spam', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/security/#strong-password' );
			},
			post_id: 35364,
			get title() {
				return __( 'Selecting A Strong Password', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The weakest point in any security for your online accounts is usually your password. Learn how to select a strong one.',
					__i18n_text_domain__
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
				return __( 'Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Settings menu of your site is where you will configure everything about how the blog works and functions.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/general-settings/' );
			},
			post_id: 1501,
			get title() {
				return __( 'General Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The General Settings let you control how your site is displayed, such as the ' +
						'title, tagline, language, and visibility.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/site-icons/' );
			},
			post_id: 1327,
			get title() {
				return __( 'Site Icons', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A Site Icon is a unique icon for your site that is shown in your visitor’s browser tab ' +
						'and other places around WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/five-step-blog-setup/' );
			},
			post_id: 100846,
			get title() {
				return __( 'Five Steps to Your Great New Blog', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Get ready to publish! Our five-step checklist walks you through all the fundamentals.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
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
				return __( 'Themes: An Overview', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A theme controls the general look and feel of your site including things like ' +
						'page layout, widget locations, and default font.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/themes/child-themes',
					__i18n_text_domain__
				);
			},
			post_id: 134704,
			get title() {
				return __( 'Child Themes', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"The only limit on your site is your vision — if the themes you see don't match that, it's " +
						'time to go beyond them. Learn to use child themes to customize and extend your website.',
					__i18n_text_domain__
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
				return __( 'Themes: An Overview', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A theme controls the general look and feel of your site including things like ' +
						'page layout, widget locations, and default font.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/themes/child-themes',
					__i18n_text_domain__
				);
			},
			get title() {
				return __( 'Child Themes', __i18n_text_domain__ );
			},
			post_id: 134704,
			get description() {
				return __(
					"The only limit on your site is your vision — if the themes you see don't match that, it's " +
						'time to go beyond them. Learn to use child themes to customize and extend your website.',
					__i18n_text_domain__
				);
			},
		},
	],
	plans: [
		{
			get link() {
				return localizeUrl( 'https://en.support.wordpress.com/plan-features/' );
			},
			post_id: 140323,
			get title() {
				return __( 'Explore the WordPress.com Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals.",
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/plan-features/' );
			},
			post_id: 134698,
			get title() {
				return __( 'WordPress.com Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn about the capabilities and features that the different plans unlock for your site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/#automatic-renewal' );
			},
			post_id: 110924,
			get title() {
				return __( 'Subscriptions for Plans and Domains', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
						'subscription that renews automatically.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/jetpack/' );
			},
			post_id: 115025,
			get title() {
				return __( 'Jetpack Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
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
				return __( 'What are "Blocks"?', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The WordPress Editor uses blocks to transform the way you create content: it turns a single document into a collection of discrete elements with explicit, easy-to-tweak structure.',
					__i18n_text_domain__
				);
			},
		},
		{
			intent: SELL_INTENT,
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/',
					__i18n_text_domain__
				);
			},
			post_id: 175999,
			get title() {
				return __( 'The Payments Block', __i18n_text_domain__ );
			},
			get description() {
				return __(
					"The Payments block is one of WordPress.com's payment blocks that allows you to accept payments for one-time, monthly recurring, or annual payments on your website.",
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/offline-editing/' );
			},
			post_id: 3595,
			get title() {
				return __( 'Offline Editing', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn how to create and edit content for your WordPress.com site even without being connected to the internet!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/user-roles/' );
			},
			post_id: 1221,
			get title() {
				return __( 'Inviting Contributors, Followers, and Viewers', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Invite contributors, followers, and viewers to collaborate with others and grow your audience!',
					__i18n_text_domain__
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
				return __( 'The Reader: An Overview', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Read posts from all the sites you follow — even ones that aren’t on WordPress.com! ' +
						'Discover great new reads and keep track of your comments and replies in one convenient place.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/following/' );
			},
			post_id: 4899,
			get title() {
				return __( 'Follow Blogs', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/topics/' );
			},
			post_id: 2166,
			get title() {
				return __( 'Following Specific Topics in the Reader', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Looking for posts on a specific topic? Besides following entire blogs, you can also follow posts on a specific subject ' +
						'from across WordPress.com. You do this by adding the topic you’re interested in under the Tags heading in the Reader.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/grow-your-community/' );
			},
			post_id: 132190,
			get title() {
				return __( 'Grow Your Community', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You’ve worked hard on building your site, now it’s time to explore the community and get noticed.',
					__i18n_text_domain__
				);
			},
		},
	],
	help: [
		{
			get link() {
				return localizeUrl( 'https://wpcourses.com/' );
			},
			post_id: 117437,
			get title() {
				return __( 'Blogging U.', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Blogging U. courses deliver free expert advice, pro tips, and inspiration right to your ' +
						'email inbox. Sign up now!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/help-support-options/' );
			},
			post_id: 149,
			get title() {
				return __( 'Help! Getting WordPress.com Support', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'WordPress.com offers a number of avenues for reaching helpful, individualized support.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/' );
			},
			get title() {
				return __( 'All Support Articles', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Looking to learn more about a feature? Our docs have all the details.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/learn/' );
			},
			get title() {
				return __( 'Self-guided Online Tutorial', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A step-by-step guide to getting familiar with the platform.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
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
				return __( 'Comments', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Comments are a way for visitors to add feedback to your posts and pages.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/settings/discussion-settings/' );
			},
			post_id: 5840,
			get title() {
				return __( 'Comment Display Options', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can control comment threading, paging, and comment order settings from the ' +
						'Discussion Settings page in your site’s settings.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/comments/#unwanted-comments-and-comment-spam'
				);
			},
			post_id: 5882,
			get title() {
				return __( 'Unwanted Comments and Comment Spam', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/comment-likes/' );
			},
			post_id: 88757,
			get title() {
				return __( 'Comment Likes', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Comment Likes: how to like others’ comments and control how Comment Likes appear on your site.',
					__i18n_text_domain__
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
				return __( 'SFTP on WordPress.com', __i18n_text_domain__ );
			},
			get description() {
				return __( "Access and edit your website's files directly by using an SFTP client." );
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/phpmyadmin-and-mysql/' );
			},
			post_id: 159822,
			get title() {
				return __( 'phpMyAdmin and MySQL', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/php-version-switching/' );
			},
			post_id: 160597,
			get title() {
				return __( 'PHP Version Switching', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Sites on the Business Plan using custom plugins and/or custom themes and any site on the eCommerce Plan, now have the option to switch PHP versions.',
					__i18n_text_domain__
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
				return __( 'WordPress.com Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn about the capabilities and features that the different plans unlock for your site.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/jetpack/' );
			},
			post_id: 115025,
			get title() {
				return __( 'Jetpack Plans', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return __( 'Manage Purchases and Refund Policy', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/#automatic-renewal' );
			},
			post_id: 110924,
			get title() {
				return __( 'Subscriptions for Plans and Domains', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
						'subscription that renews automatically.',
					__i18n_text_domain__
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
				return __( 'Add Email to your Domain', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Want to use a custom email with your domain, such as info@yourgroovydomain.com? There are multiple ways to add email to your custom domain.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' );
			},
			post_id: 6595,
			get title() {
				return __( 'Manage Custom DNS', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Custom DNS records are special settings that change how your domain works. They allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl(
					'https://wordpress.com/support/transfer-domain-registration/',
					__i18n_text_domain__
				);
			},
			post_id: 41298,
			get title() {
				return __( 'Transfer a Domain to Another Registrar', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'This article walks you through transferring your domain registration to another registrar. Your domain will need to be unlocked and privacy removed (if applicable) for the transfer.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domain-connection-vs-domain-transfer/' );
			},
			post_id: 157655,
			get title() {
				return __( 'Connect an Existing Domain', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'You can connect an existing domain you own that’s registered elsewhere by either mapping or transferring. Domain mapping lets you connect a domain while keeping it registered at the current registrar (where you purchased the domain from). Domain transferring moves the domain to WordPress.com so we become the new registrar.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/domains/' );
			},
			post_id: 1988,
			get title() {
				return __( 'All about domains', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'A domain name is an address people use to visit your site. It tells the web browser where to look for your site. Just like a street address, a domain is how people visit your website online. And, like having a sign in front of your store, a custom domain name helps give your site a professional look.',
					__i18n_text_domain__
				);
			},
		},
		{
			get link() {
				return localizeUrl( 'https://wordpress.com/support/manage-purchases/' );
			},
			post_id: 111349,
			get title() {
				return __( 'Managing Purchases, Renewals, and Cancellations', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Have a question or need to change something about a purchase you have made? Learn how.',
					__i18n_text_domain__
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

export const videosForSection = {
	sharing: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=YVelWG3hf3o',
			get title() {
				return __( 'Add Social Sharing Buttons to Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
						'do with a Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=NcCe0ozmqFM',
			get title() {
				return __( 'Connect Your Blog to Facebook Using Publicize', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to share blog posts directly on Facebook from your WordPress.com site, ' +
						'which you can also do on a Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=f44-4TgnWTs',
			get title() {
				return __( 'Display Your Instagram Feed on Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to display your latest Instagram photos right on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3rTooGV_mlg',
			get title() {
				return __( 'Set Up the Social Links Menu', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to set up a social links menu on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=gmrOkkqMNlc',
			get title() {
				return __( 'Embed a Twitter Timeline in your Sidebar', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to display your Twitter timeline on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vy-U5saqG9A',
			get title() {
				return __( 'Set Up a Social Media Icons Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to set up the social media icons widget on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=N0GRBFRkzzs',
			get title() {
				return __( 'Embed a Tweet from Twitter in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed a Tweet in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=uVRji6bKJUE',
			get title() {
				return __( 'Embed an Instagram Photo in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed an Instagram photo in your content (including posts and pages) on your WordPress.com ' +
						'or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=sKm3Q83JxM0',
			get title() {
				return __( 'Embed a Facebook Update in Your Website', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to embed a Facebook update in your content (including posts, pages, and even comments) on your ' +
						'WordPress.com or Jetpack-enabled WordPress website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=SBgNkre_b14',
			get title() {
				return __( 'Share Blog Posts Directly on Twitter', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to share blog posts directly on Twitter from your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
	],
	settings: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=0YCZ22k4SfQ',
			get title() {
				return __( 'Add a Site Logo', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom logo to your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=vucZ1uZ2NPo',
			get title() {
				return __( 'Update Your Website Title and Tagline', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to update the Title and Tagline of your WordPress.com site, which you can also ' +
						'do on your Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Y6iPsPwYD7g',
			get title() {
				return __( 'Change Your Privacy Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your website privacy settings on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bjxKGxW0MRA',
			get title() {
				return __( 'Add a Site Icon', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to add a site icon on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=z6fCtvLB0wM',
			get title() {
				return __( 'Create a Multilingual Site', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a multilingual site on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=D142Edhcpaw',
			get title() {
				return __( 'Customize Your Content Options', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to customize your content options on select WordPress.com themes.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Vyr-g5SEuIA',
			get title() {
				return __( 'Change Your Language Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your blog or website language and your interface language settings on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=EUuEuW_LCrc',
			get title() {
				return __( 'Activate Free Email Forwarding', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to activate free email forwarding from an address using a custom domain registered through WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	account: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=aO-6yu3_xWQ',
			get title() {
				return __( 'Change Your Password', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your account password on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=qhsjkqFdDZo',
			get title() {
				return __( 'Change Your WordPress.com Username', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to change your username on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Tyxu_xT6q1k',
			get title() {
				return __( 'Change Your WordPress.com Display Name', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your display name on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=07Nf8FkjO4o',
			get title() {
				return __( 'Change Your Account Email Address', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your account email address on WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	customizer: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=pf_ST7gvY8c',
			get title() {
				return __( 'Add a Custom Header Image', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom header image to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=CY20IAtl2Ac',
			get title() {
				return __( 'Create a Custom Website Menu', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a custom menu on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=2H_Jsgh2Z3Y',
			get title() {
				return __( 'Add a Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a widget to your WordPress.com website.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=ypFF4ONBfSQ',
			get title() {
				return __( 'Add a Custom Background', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a custom background to your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=b8EuJDrNeOA',
			get title() {
				return __( 'Change Your Site Fonts', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change the fonts on your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=7VPgvxV78Kc',
			get title() {
				return __( 'Add a Gallery Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add an image gallery widget to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=oDBuaBLrwF8',
			get title() {
				return __( 'Use Featured Content', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to use the Featured Content option on your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3TqRr21zyiA',
			get title() {
				return __( 'Add an Image Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add an image widget to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
	],
	'posts-pages': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=3RPidSCQ0LI',
			get title() {
				return __( 'Create a Landing Page', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a one-page website or landing page on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=4IkFQzl5nXc',
			get title() {
				return __( 'Set Up a Website in 5 Steps', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a website on WordPress.com in five steps.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mta6Y0o7yJk',
			get title() {
				return __( 'Set Up a Blog in 5 Steps', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a blog on WordPress.com in five steps.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=Gx7YNX1Wk5U',
			get title() {
				return __( 'Create a Page', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to create a page on your WordPress.com site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=mCfuh5bCOwM',
			get title() {
				return __( 'Create a Post', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to create a post on WordPress.com.', __i18n_text_domain__ );
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=bEVHg6nopcs',
			get title() {
				return __( 'Use a Custom Menu in a Widget', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to use a custom menu in a widget on your WordPress.com or Jetpack-enabled WordPress site.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=nAzdUOlFoBI',
			get title() {
				return __( 'Configure a Static Homepage', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'By default, your new WordPress.com website displays your latest posts. Find out how to create a static homepage instead.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=MPpVeMmDOhk',
			get title() {
				return __( 'Show Related Posts on Your WordPress Blog', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to show related posts on your WordPress.com site, which you can also do on a Jetpack-enabled WordPress blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=JVnltCZUKC4',
			get title() {
				return __( 'Add Testimonials', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add testimonials to your WordPress.com website or blog.',
					__i18n_text_domain__
				);
			},
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yH_gapAUGAA',
			get title() {
				return __( 'Change Your Post or Page Visibility Settings', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to change your page or post visibility settings WordPress.com.',
					__i18n_text_domain__
				);
			},
		},
	],
	media: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=VjGnEHyqVqQ',
			get title() {
				return __( 'Add a Photo Gallery', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'Find out how to add a photo gallery on your WordPress.com and Jetpack-enabled website.',
					__i18n_text_domain__
				);
			},
		},
	],
	themes: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=yOfAuOb68Hc',
			get title() {
				return __( 'Change Your Website Theme on WordPress.com', __i18n_text_domain__ );
			},
			get description() {
				return __( 'Find out how to change your WordPress.com theme.', __i18n_text_domain__ );
			},
		},
	],
};

export const toursForSection = {
	media: [
		{
			type: RESULT_TOUR,
			tour: 'mediaBasicsTour',
			key: 'tour:mediaBasicsTour',
			get title() {
				return __( 'Learn Media Library Basics', __i18n_text_domain__ );
			},
			get description() {
				return __(
					'The Media Library is a useful tool to help you manage, search, and edit your photos, videos, documents, and other media.',
					__i18n_text_domain__
				);
			},
		},
	],
};

type SectionForLinks = keyof typeof contextLinksForSection;
type SectionForVideos = keyof typeof videosForSection;
type SectionForTours = keyof typeof toursForSection & 'posts';
type SectionForPostsAndPages = 'posts' | 'pages';

type Section = SectionForLinks | SectionForVideos | SectionForTours | SectionForPostsAndPages;

export function getContextResults( section: Section, siteIntent: string ) {
	// Posts and Pages have a common help section
	if ( section === 'posts' || section === 'pages' ) {
		section = 'posts-pages';
	}

	const fallbackLinks = siteIntent === 'write' ? bloggerFallbackLinks : defaultFallbackLinks;
	// make sure editorially to show at most one tour and one video at once
	// `first` is a safe-guard in case that fails
	const video = videosForSection[ section as SectionForVideos ]?.[ 0 ];
	const tour = toursForSection[ section as SectionForTours ]?.[ 0 ];
	let links = contextLinksForSection[ section as SectionForLinks ] ?? fallbackLinks;

	// If true, still display fallback links in addition (as opposed to instead
	// of) the other context links.
	if ( section === 'home' && Array.isArray( links ) ) {
		return [ tour, video, ...fallbackLinks, ...links ].filter( Boolean );
	}

	// Remove sell docs if not on a site with the 'sell' intent.
	if ( section === 'gutenberg-editor' && siteIntent !== 'sell' && Array.isArray( links ) ) {
		links = links.filter( ( link ) => {
			return link.intent !== SELL_INTENT;
		} );
	}

	return [ tour, video, ...( links as Array< LinksForSection > ) ].filter( Boolean );
}
