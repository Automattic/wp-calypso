/** @format */
/**
 * External dependencies
 */
import { compact, first, get } from 'lodash';

/**
 * Module variables
 */
export const RESULT_TOUR = 'tour',
	RESULT_VIDEO = 'video';
const fallbackLinks = [
	{
		link: 'https://en.support.wordpress.com/business-plan/',
		title: 'Uploading custom plugins and themes',
		description: 'Learn more about installing a custom theme or plugin using the Business plan.',
	},
	{
		link: 'https://en.support.wordpress.com/all-about-domains/',
		title: 'All About Domains',
		description: 'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
	},
	{
		link: 'https://en.support.wordpress.com/start/',
		title: 'Get Started',
		description:
			'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.',
	},
	{
		link: 'https://en.support.wordpress.com/settings/privacy-settings/',
		title: 'Privacy Settings',
		description: 'Limit your site’s visibility or make it completely private.',
	},
];

const contextLinksForSection = {
	stats: [
		{
			link: 'http://en.support.wordpress.com/stats/',
			title: 'Stats',
			description:
				'Your stats page includes a bunch of nifty graphs, charts, and lists that show you how many visits your site…',
		},
		{
			link: 'https://en.support.wordpress.com/getting-more-views-and-traffic/',
			title: 'Getting More Views and Traffic',
			description:
				'Want more traffic? Here are some tips for attracting more visitors to your site: Tell people in your social networks…',
		},
		{
			link: 'https://en.support.wordpress.com/increase-your-site-traffic/',
			title: 'Increase Your Site Traffic',
			description:
				'One of the most frequent questions our community members ask us — and themselves — is how to get more…',
		},
		{
			link: 'https://en.support.wordpress.com/grow-your-community/',
			title: 'Grow Your Community',
			description:
				"You've worked hard on building your site, now it's time to explore the community and get noticed. On WordPress.com, we…",
		},
	],
	sharing: [
		{
			link: 'http://en.support.wordpress.com/video-tutorials/connect-to-social-media/',
			title: 'Integrate and Connect to Social Media',
			description:
				'Start sharing your site and attract more traffic and visitors to your content. Learn to activate and control the social…',
		},
		{
			link: 'https://en.support.wordpress.com/sharing/',
			title: 'Sharing',
			description:
				'At the bottom of each post and page you can include sharing buttons for your readers to share your content…',
		},
		{
			link: 'https://en.support.wordpress.com/instagram/',
			title: 'Instagram',
			description:
				'Instagram is a simple way to capture, customize, ' +
				'and share photos and short videos using your smartphone or other mobile device…',
		},
		{
			link: 'https://en.support.wordpress.com/twitter/',
			title: 'Twitter',
			description:
				'Twitter is a service for the exchange of brief messages, commonly ' +
				'called "tweets", between users. You can integrate your site…',
		},
	],
	me: [
		{
			link: 'http://en.support.wordpress.com/manage-my-profile/',
			title: 'Manage My Profile',
			description:
				"Your profile is the information you'd like to be shown along with your " +
				'name when you comment on WordPress.com sites. You can...',
		},
		{
			link: 'http://en.support.wordpress.com/gravatars/',
			title: 'The Gravatar – Your Profile Picture',
			description:
				'WordPress.com associates an Avatar with your email address. Gravatar ' +
				'powers the user avatars on WordPress.com. Your WordPress.com and Gravatar ' +
				'accounts are linked automatically. Once you configure...',
		},
		{
			link: 'http://en.support.wordpress.com/account-deactivation/',
			title: 'Account Deactivation',
			description:
				'If you are finished with your WordPress.com account and would like to shut it down, please follow the steps outlined...',
		},
		{
			link: 'http://en.support.wordpress.com/change-your-username/',
			title: 'Change Your Username',
			description:
				'You can change both your WordPress.com account username (the name you use to login) and your display name (the name...',
		},
	],
	account: [
		{
			link: 'http://en.support.wordpress.com/change-your-username/',
			title: 'Change Your Username',
			description:
				'You can change both your WordPress.com account username (the name you use to login) and your display name (the name...',
		},
		{
			link: 'http://en.support.wordpress.com/video-tutorials/manage-your-account/',
			title: 'Manage Your Account',
			description:
				'Learn the ins and outs of managing your WordPress.com account and site. Learn how to change your account password and...',
		},
		{
			link: 'http://en.support.wordpress.com/account-settings/',
			title: 'Account Settings',
			description:
				'You can review and edit basic account information in Account Settings. ' +
				'To go to Account Settings, click on your Gravatar in...',
		},
		{
			link: 'http://en.support.wordpress.com/account-deactivation/',
			title: 'Account Deactivation',
			description:
				'If you are finished with your WordPress.com account and would like to shut it down, please follow the steps outlined...',
		},
	],
	security: [
		{
			link: 'http://en.support.wordpress.com/security/two-step-authentication/',
			title: 'Two Step Authentication',
			description:
				"Your WordPress.com site is your home on the internet, and you want to keep that home safe. Hopefully, you've already...",
		},
		{
			link: 'http://en.support.wordpress.com/account-recovery/',
			title: 'Account Recovery',
			description:
				'At some point, you may run into a situation in which you’ve lost access to your account. We want to...',
		},
		{
			link: 'http://en.support.wordpress.com/passwords/',
			title: 'Passwords',
			description:
				'Passwords are very important to user accounts, and there may come a time when you need to change your password.',
		},
		{
			link: 'http://en.support.wordpress.com/third-party-applications/',
			title: 'Third Party Applications',
			description:
				'WordPress.com allows you to connect with third-party applications that ' +
				'extend your WordPress.com site in new and cool ways. This is...',
		},
	],
	purchases: [
		{
			link: 'http://en.support.wordpress.com/manage-purchases/',
			title: 'Manage Purchases',
			description:
				'You can manage all of your WordPress.com purchases by navigating to the ' +
				'Me section of WordPress.com and then choosing the...',
		},
		{
			link: 'http://en.support.wordpress.com/auto-renewal/',
			title: 'Subscriptions for Plans and Domains',
			description:
				'Your WordPress.com plans and any domains you add to your sites are based ' +
				'on a yearly subscription that renews automatically.',
		},
		{
			link: 'http://en.support.wordpress.com/discover-the-wordpress-com-plans/',
			title: 'Discover the WordPress.com Plans',
			description:
				'Thank you for building your site on WordPress.com! Upgrading to a plan unlocks a ton of features.',
		},
	],
	'notification-settings': [
		{
			link:
				'Stuff happens all the time on WordPress.com. You’re blogging, commenting, ' +
				'liking, and following like never before. Every hour a record...',
			title: 'Notifications',
			description: 'http://en.support.wordpress.com/notifications/',
		},
		{
			link: 'http://en.support.wordpress.com/email-notifications/',
			title: 'Email Notifications',
			description:
				'Notifications from WordPress.com will be sent to the email address registered ' +
				'to your WordPress.com account. To update your email address,...',
		},
		{
			link: 'http://en.support.wordpress.com/following-comments/',
			title: 'Following Comments',
			description:
				'When you leave a comment on a WordPress.com blog, you can choose to automatically ' +
				'receive email updates about other comments...',
		},
		{
			link: 'http://en.support.wordpress.com/following/',
			title: 'Following Blogs',
			description:
				'When you follow a blog on WordPress.com, the new posts from that site will appear in your Reader, where you...',
		},
	],
	media: [
		{
			link: 'http://en.support.wordpress.com/media/',
			title: 'Media Library',
			description:
				'The Media Library is where you can manage your images, audio, videos, and documents ' +
				'all in one place. Navigating to the Media...',
		},
		{
			link: 'http://en.support.wordpress.com/add-media/finding-free-images-and-other-media/',
			title: 'Finding Free Images and other Media',
			description:
				"What do we mean by 'free media'? While much content on the internet is subject to copyright laws, there are...",
		},
		{
			link: 'http://en.support.wordpress.com/add-media/',
			title: 'Add Media',
			description:
				'Dress up your text-based posts and pages with individual images, image galleries, ' +
				'slideshows, videos, and audio. Add Single Media Items (Uploading Images, Video,...',
		},
		{
			link: 'http://en.support.wordpress.com/videos/',
			title: 'Videos',
			description:
				'Videos are a great way to enhance your blog posts. We use videos all the time on the WordPress.com News...',
		},
	],
	people: [
		{
			link:
				'User roles determine the access level or permissions of a person authorized ' +
				'(invited by an Administrator) to use a WordPress.com...',
			title: 'User Roles',
			description: 'http://en.support.wordpress.com/user-roles/',
		},
		{
			link: 'http://en.support.wordpress.com/user-mentions/',
			title: 'User Mentions',
			description:
				'User mentions are a great way to include other WordPress.com users within your ' +
				'posts and comments, and ensure that they...',
		},
		{
			link: 'http://en.support.wordpress.com/adding-users/',
			title: 'Inviting Contributors, Followers, and Viewers',
			description:
				"On WordPress.com, you are able to add users to your website by sending invitations. To send an invitation, you'll want...",
		},
		{
			link: 'http://en.support.wordpress.com/followers/',
			title: 'My Followers',
			description:
				'When someone follows your site, each time you publish new content on your blog they receive an update in their...',
		},
	],
	plugins: [
		{
			link: 'http://en.support.wordpress.com/plugins/',
			title: 'Plugins',
			description:
				'On WordPress.com, we include the most popular plugin functionality within our ' +
				'sites automatically. Additionally, the Business plan allows you to...',
		},
		{
			link: 'http://en.support.wordpress.com/plugins/managing-plugins/',
			title: 'Managing plugins',
			description:
				'After you install a plugin, it will appear in a list at My Sites → Plugins. This list will display any...',
		},
		{
			link: 'http://en.support.wordpress.com/plugins/adding-plugins/',
			title: 'Adding plugins',
			description:
				'Installing and using plugins In addition to built-in plugin functionality, WordPress.com ' +
				'Business allows you to install other plugins. With many thousands...',
		},
		{
			link: 'http://en.support.wordpress.com/business-plan/',
			title: 'Business Plan',
			description:
				'WordPress.com provides users with a great experience out of the box. From superb SEO to social media sharing to custom...',
		},
	],
	'posts-pages': [
		{
			link: 'http://en.support.wordpress.com/five-step-website-setup/',
			title: 'Build Your Website in Five Steps',
			description:
				"Great, you've registered a website on wordpress.com. Now what? Whether you're building " +
				'a small business website or a personal...',
		},
		{
			link: 'http://en.support.wordpress.com/pages/landing-pages/',
			title: 'Landing Pages',
			description:
				'Landing pages are pages with a single purpose: encouraging your visitors to sign up for ' +
				'a service, buy a product, or...',
		},
		{
			link: 'http://en.support.wordpress.com/posts/',
			title: 'Posts',
			description:
				'Posts are what make your blog a blog — they’re servings of content that are listed in reverse chronological order on...',
		},
		{
			link: 'http://en.support.wordpress.com/posts/post-formats/',
			title: 'Post Formats',
			description:
				'Learn how to make gallery, video, audio, and other post types pop with post formats. ' +
				'If your theme supports post formats, you...',
		},
	],
	'settings-writing': [
		{
			link: 'http://en.support.wordpress.com/settings/writing-settings/',
			title: '"Writing Settings',
			description:
				'To change these settings, go to My Sites → Settings → Writing. Manage Categories and Tags Open the Categories or Tags...',
		},
		{
			link: 'http://en.support.wordpress.com/posts/categories-vs-tags/',
			title: 'Categories vs. Tags',
			description:
				'Once upon a time, WordPress.com only provided a Category option. Categories allowed ' +
				'for a broad grouping of post topics, but...',
		},
		{
			link: 'http://en.support.wordpress.com/feeds/',
			title: 'Feeds',
			description:
				'A feed (often called RSS) is a stream of posts or comments that is updated when new content is published. This...',
		},
		{
			link: 'http://en.support.wordpress.com/portfolios/',
			title: 'Portfolios',
			description:
				"If you're hoping to use your WordPress.com site to show off your portfolio separate " +
				'from your blog posts and pages, the...',
		},
	],
	'settings-discussion': [
		{
			link: 'http://en.support.wordpress.com/settings/discussion-settings/',
			title: 'Discussion Settings',
			description:
				'The Discussion Settings are used to control how visitors and other blogs interact ' +
				"with your site. To change your site's...",
		},
		{
			link: 'http://en.support.wordpress.com/enable-disable-comments-for-future-posts/',
			title: 'Enable and Disable Comments for Future Posts',
			description:
				'You can enable/disable comments on future posts by going into your Discussion settings. ' +
				'If you have more than one site, go...',
		},
		{
			link: 'http://en.support.wordpress.com/comments/',
			title: 'Comments',
			description:
				'Comments are a way for visitors to add feedback to your posts and pages. If you choose to enable comments...',
		},
		{
			link: 'http://en.support.wordpress.com/subscriptions-and-newsletters/',
			title: 'Subscriptions and Newsletters',
			description:
				'This article explains how readers can subscribe to your blog to receive email notifications of all of your posts.  On...',
		},
	],
	'settings-traffic': [
		{
			link: 'http://en.support.wordpress.com/getting-more-views-and-traffic/',
			title: 'Getting More Views and Traffic',
			description:
				'Want more traffic? Here are some tips for attracting more visitors to your site: Tell people in your social networks...',
		},
		{
			link: 'http://en.support.wordpress.com/related-posts/',
			title: 'Related Posts',
			description:
				'The Related Posts feature pulls relevant content from your blog to display at the bottom of your posts.',
		},
		{
			link: 'http://en.support.wordpress.com/webmaster-tools/',
			title: 'Webmaster Tools',
			description:
				'WordPress.com provides you with built-in stats that give you lots of information ' +
				"about your traffic, but if you're a stats junkie and...",
		},
		{
			link: 'http://en.support.wordpress.com/amp-accelerated-mobile-pages/',
			title: 'AMP (Accelerated Mobile Pages)',
			description:
				'AMP (Accelerated Mobile Pages) is an open-source framework that allows browsers ' +
				"and apps to load your site's blog posts quickly...",
		},
	],
	'settings-security': [
		{
			link: 'http://en.support.wordpress.com/security/',
			title: 'Security',
			description:
				'The security of your site and your personal data is always a priority. This page describes what we do to...',
		},
		{
			link: 'http://en.support.wordpress.com/unwanted-comments/',
			title: 'Unwanted Comments and Comment Spam',
			description:
				'There are many ways to protect your WordPress.com blogs from unwanted comments: ' +
				'WordPress.com blogs are protected by the Akismet comment...',
		},
		{
			link: 'http://en.support.wordpress.com/selecting-a-strong-password/',
			title: 'Selecting a Strong Password',
			description:
				'The weakest point in any security for your online accounts is usually your password. At WordPress.com, we go to great...',
		},
	],
	settings: [
		{
			link: 'http://en.support.wordpress.com/settings/',
			title: 'Settings',
			description:
				'The Settings menu of your site is where you will configure everything about how the blog works and functions. You...',
		},
		{
			link: 'http://en.support.wordpress.com/settings/general-settings/',
			title: 'General Settings',
			description:
				'The General Settings let you control how your site is displayed, such as the ' +
				'title, tagline, language, and visibility. To change...',
		},
		{
			link: 'http://en.support.wordpress.com/site-icons/',
			title: 'Site Icons',
			description: '',
		},
		{
			link: 'http://en.support.wordpress.com/five-step-blog-setup/',
			title: 'Set Up Your Blog in Five Steps',
			description:
				"Congrats, you've registered your blog -- maybe you've even published your first " +
				'post! Run through these five steps to make...',
		},
	],
	themes: [
		{
			link: 'http://en.support.wordpress.com/themes/',
			title: 'Themes',
			description:
				'A theme controls the general look and feel of your site including things like ' +
				'page layout, widget locations, and default font...',
		},
		{
			link: 'http://en.support.wordpress.com/themes/mobile-themes/',
			title: 'Mobile Themes',
			description:
				'When a visitor browses to a WordPress.com blog on a mobile device, we show ' +
				'special themes designed to work on small screens focusing on fast load times.',
		},
		{
			link: 'http://en.support.wordpress.com/premium-themes/',
			title: 'Premium Themes',
			description:
				'Purchasing a Premium Theme On a site with the Premium or Business plan, you can switch to any premium theme...',
		},
		{
			link:
				'http://en.support.wordpress.com/themes/uploading-setting-up-custom-themes/child-themes/',
			title: 'Child Themes',
			description:
				"WordPress.com Business enables you to make many changes to your theme's appearance " +
				'using custom CSS and to build upon its...',
		},
	],
	theme: [
		{
			link: 'http://en.support.wordpress.com/themes/',
			title: 'Themes',
			description:
				'A theme controls the general look and feel of your site including things like page ' +
				'layout, widget locations, and default font...',
		},
		{
			link: 'http://en.support.wordpress.com/themes/mobile-themes/',
			title: 'Mobile Themes',
			description:
				'When a visitor browses to a WordPress.com blog on a mobile device, we show special ' +
				'themes designed to work on small screens focusing on fast load times.',
		},
		{
			link: 'http://en.support.wordpress.com/premium-themes/',
			title: 'Premium Themes',
			description:
				'Purchasing a Premium Theme On a site with the Premium or Business plan, you can switch to any premium theme...',
		},
		{
			link:
				'http://en.support.wordpress.com/themes/uploading-setting-up-custom-themes/child-themes/',
			title: 'Child Themes',
			description:
				"WordPress.com Business enables you to make many changes to your theme's appearance " +
				'using custom CSS and to build upon its...',
		},
	],
	plans: [
		{
			link: 'http://en.support.wordpress.com/discover-the-wordpress-com-plans/',
			title: 'Discover the WordPress.com Plans',
			description:
				'Thank you for building your site on WordPress.com! Upgrading to a plan unlocks a ton of features...',
		},
		{
			link: 'http://en.support.wordpress.com/plan-features/',
			title: 'WordPress.com Plans',
			description:
				'All WordPress.com sites are packed with awesome features, and if you would like to take yours to the next level, ...',
		},
		{
			link: 'http://en.support.wordpress.com/auto-renewal/',
			title: 'Subscriptions for Plans and Domains',
			description:
				'Your WordPress.com plans and any domains you add to your sites are based on a yearly ' +
				'subscription that renews automatically.',
		},
		{
			link: 'http://en.support.wordpress.com/jetpack-add-ons/',
			title: 'Jetpack Plans',
			description:
				'What is Jetpack and do I need it? Jetpack is a feature-rich plugin for self-hosted WordPress sites. If your site...',
		},
	],
	'post-editor': [
		{
			link: 'http://en.support.wordpress.com/editors/',
			title: 'Editors',
			description:
				'When creating a post or page on your WordPress.com blog, you have two editing modes available to you. Visual Editor...',
		},
		{
			link: 'http://en.support.wordpress.com/visual-editor/',
			title: 'Visual Editor',
			description:
				'The visual editor provides a semi-WYSIWYG (What You See is What You Get) content editor that allows you to easily...',
		},
		{
			link: 'http://en.support.wordpress.com/xml-rpc/',
			title: 'Offline Editing',
			description:
				'There are several desktop applications which you can use to write and publish ' +
				'content for your WordPress.com blog, even without...',
		},
		{
			link: 'http://en.support.wordpress.com/adding-users/',
			title: 'Inviting Contributors, Followers, and Viewers',
			description:
				"On WordPress.com, you are able to add users to your website by sending invitations. To send an invitation, you'll want...",
		},
	],
	reader: [
		{
			link: 'http://en.support.wordpress.com/reader/',
			title: 'Reader',
			description:
				'Read posts from all the sites you follow (even the ones that aren’t on WordPress.com), find great new reads, and keep...',
		},
		{
			link: 'http://en.support.wordpress.com/following/',
			title: 'Following Blogs',
			description:
				'When you follow a blog on WordPress.com, the new posts from that site will appear in your Reader, where you...',
		},
		{
			link: 'http://en.support.wordpress.com/topics/',
			title: 'Tags in the Reader',
			description:
				'Looking for posts on a specific topic? Besides following entire blogs, you can also follow posts on a specific subject...',
		},
		{
			link: 'http://en.support.wordpress.com/grow-your-community/',
			title: 'Grow Your Community',
			description:
				"You've worked hard on building your site, now it's time to explore the community and get noticed. On WordPress.com, we...",
		},
	],
	help: [
		{
			link: 'http://en.support.wordpress.com/blogging-u/',
			title: 'Blogging U.',
			description:
				'Blogging U. courses deliver expert advice, pro tips, and inspiration right to your ' +
				'email inbox. Reach your own creative goals...',
		},
		{
			link: 'http://en.support.wordpress.com/help-support-options/',
			title: 'Help! Getting WordPress.com Support',
			description:
				'WordPress.com offers a number of avenues for reaching helpful, individualized support, ' +
				'but sometimes it can be difficult to determine the...',
		},
		{
			link: 'https://en.support.wordpress.com/',
			title: 'All support articles',
			description: 'Looking to learn more about a feature? Our docs have all the details.',
		},
		{
			link: 'https://learn.wordpress.com/',
			title: 'Self-guided online tutorial',
			description: 'A step-by-step guide to getting familiar with the platform.',
		},
	],
	comments: [
		{
			link: 'http://en.support.wordpress.com/comments/',
			title: 'Comments',
			description:
				'Comments are a way for visitors to add feedback to your posts and pages. If you choose to enable comments...',
		},
		{
			link: 'http://en.support.wordpress.com/comment-display-options/',
			title: 'Comment Display Options',
			description:
				'You can control comment threading, paging, and comment order settings from the ' +
				"Discussion Settings page in your site's settings. Threaded Comments...",
		},
		{
			link: 'http://en.support.wordpress.com/unwanted-comments/',
			title: 'Unwanted Comments and Comment Spam',
			description:
				'There are many ways to protect your WordPress.com blogs from unwanted comments: ' +
				'WordPress.com blogs are protected by the Akismet comment...',
		},
		{
			link: 'http://en.support.wordpress.com/comment-likes/',
			title: 'Comment Likes',
			description:
				"Comment Likes: how to like others' comments and control how Comment Likes " +
				'appear on your site. The Comment Like button is an...',
		},
	],
};

const videosForSection = {
	sharing: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/watch?v=YVelWG3hf3o',
			title: 'Add Social Sharing Buttons to Your Website',
			description:
				'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
				'do with a Jetpack-enabled WordPress site. Our step-by-step video will walk you through it, ' +
				"and it's easier than you'd think!",
		},
	],
};
const toursForSection = {
	media: [
		{
			type: RESULT_TOUR,
			tour: 'mediaBasicsTour',
			key: 'tour:mediaBasicsTour',
			title: 'Learn Media Library Basics',
			description:
				'The Media Library is a useful tool to help you manage, search, and edit your photos, videos, documents, and other media.',
		},
	],
};

export function getContextResults( section ) {
	// make sure editorially to show at most one tour and one video at once
	// `first` is a safe-guard in case that fails
	const video = first( get( videosForSection, section ) );
	const tour = first( get( toursForSection, section ) );
	const links = get( contextLinksForSection, section ) || fallbackLinks;
	return compact( [ tour, video, ...links ] );
}
