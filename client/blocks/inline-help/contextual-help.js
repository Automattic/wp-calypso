/** @format */
/**
 * External dependencies
 */
import { compact, first, get } from 'lodash';

/**
 * Internal Dependencies
 */
import { RESULT_TOUR, RESULT_VIDEO } from './constants';

/**
 * Module variables
 */
const fallbackLinks = [
	{
		link: 'https://en.support.wordpress.com/business-plan/',
		post_id: 134940,
		title: 'Uploading custom plugins and themes',
		description: 'Learn more about installing a custom theme or plugin using the Business plan.',
	},
	{
		link: 'https://en.support.wordpress.com/all-about-domains/',
		post_id: 41171,
		title: 'All About Domains',
		description: 'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
	},
	{
		link: 'https://en.support.wordpress.com/start/',
		post_id: 81083,
		title: 'Quick-Start Guide',
		description:
			"Use our five-step checklist to get set up and ready to publish, no matter what kind of site you're building.",
	},
	{
		link: 'https://en.support.wordpress.com/settings/privacy-settings/',
		post_id: 1507,
		title: 'Privacy Settings',
		description: 'Limit your site’s visibility or make it completely private.',
	},
];

const contextLinksForSection = {
	stats: [
		{
			link: 'http://en.support.wordpress.com/stats/',
			post_id: 4454,
			title: 'Understanding the Stats Page',
			description:
				'Your stats page includes a bunch of nifty graphs, charts, and lists that show you how many ' +
				'visits your site gets, what posts and pages are the most popular ones, and much more. Learn what it all means.',
		},
		{
			link: 'https://en.support.wordpress.com/getting-more-views-and-traffic/',
			post_id: 3307,
			title: 'Getting More Views and Traffic',
			description:
				'Want more traffic? Here are some tips for attracting more visitors to your site.',
		},
		{
			link: 'https://en.support.wordpress.com/increase-your-site-traffic/',
			post_id: 132186,
			title: 'Increase Your Site Traffic',
			description:
				'One of the most frequent questions our community members ask us — and themselves — ' +
				'is how to get more traffic. Here are a few best practices.',
		},
		{
			link: 'https://en.support.wordpress.com/grow-your-community/',
			post_id: 132190,
			title: 'Grow Your Community',
			description:
				'You’ve worked hard on building your site, now it’s time to explore the community and get noticed. Learn how.',
		},
	],
	sharing: [
		{
			link: 'http://en.support.wordpress.com/video-tutorials/connect-to-social-media/',
			post_id: 130825,
			title: 'Integrate and Connect to Social Media',
			description:
				'Start sharing your site and attract more traffic and visitors to your content! ' +
				'Learn to activate and control the social media and sharing options on your website or blog through these videos.',
		},
		{
			link: 'https://en.support.wordpress.com/sharing/',
			post_id: 7499,
			title: 'Sharing Your Content',
			description:
				'At the bottom of each post or page, you can include sharing buttons for your readers ' +
				'to make it easier to share your content.',
		},
		{
			link: 'https://en.support.wordpress.com/instagram/',
			post_id: 77589,
			title: 'Using Instagram',
			description:
				'Instagram is a simple way to capture, customize, ' +
				'and share photos and short videos using your smartphone or other mobile device. Learn how to use it with your website!',
		},
		{
			link: 'https://en.support.wordpress.com/twitter/',
			post_id: 124,
			title: 'Using Twitter',
			description:
				'Twitter is a service for the exchange of brief messages, commonly ' +
				'called "tweets", between users. Learn how to use it with your website!',
		},
	],
	me: [
		{
			link: 'http://en.support.wordpress.com/manage-my-profile/',
			post_id: 19775,
			title: 'Managing Your Profile',
			description:
				'Your profile is the information you’d like to be shown along with your ' +
				'name when you publish content or comment on WordPress.com sites.',
		},
		{
			link: 'http://en.support.wordpress.com/gravatars/',
			post_id: 1338,
			title: 'Your Profile Picture',
			description:
				'WordPress.com associates an Avatar with your email address. Gravatar ' +
				'powers the user avatars on WordPress.com.',
		},
		{
			link: 'http://en.support.wordpress.com/account-deactivation/',
			post_id: 138080,
			title: 'Account Closure',
			description: 'Need a fresh start? Learn how to close your account.',
		},
		{
			link: 'http://en.support.wordpress.com/change-your-username/',
			post_id: 2116,
			title: 'Change Your Username',
			description:
				'You can change both your WordPress.com account username (the name you use to login) ' +
				'and your display name (the name that is seen on your posts and comments). Learn how!',
		},
	],
	account: [
		{
			link: 'http://en.support.wordpress.com/change-your-username/',
			title: 'Change Your Username',
			description:
				'You can change both your WordPress.com account username (the name you use to login) ' +
				'and your display name (the name that is seen on your posts and comments). Learn how!',
		},
		{
			link: 'http://en.support.wordpress.com/video-tutorials/manage-your-account/',
			post_id: 130826,
			title: 'Manage Your Account',
			description: 'Learn the ins and outs of managing your WordPress.com account and site.',
		},
		{
			link: 'http://en.support.wordpress.com/account-settings/',
			post_id: 80368,
			title: 'Account Settings',
			description: 'You can review and edit basic account information in Account Settings. ',
		},
		{
			link: 'http://en.support.wordpress.com/account-deactivation/',
			title: 'Account Deactivation',
			description: 'Finished with your WordPress.com account? Would you like to shut it down?',
		},
	],
	security: [
		{
			link: 'http://en.support.wordpress.com/security/two-step-authentication/',
			post_id: 58847,
			title: 'Two-Step Authentication',
			description:
				'Your WordPress.com site is your home on the internet, and you want to keep that home safe. ' +
				'Learn how to add an additional "lock" to your account!',
		},
		{
			link: 'http://en.support.wordpress.com/account-recovery/',
			post_id: 46365,
			title: 'Account Recovery',
			description:
				'At some point, you may run into a situation in which you’ve lost access to your account. Learn how to get back on track!',
		},
		{
			link: 'http://en.support.wordpress.com/passwords/',
			post_id: 89,
			title: 'Passwords And How To Use Them',
			description:
				'Passwords are very important to user accounts, and there may come a time when you need to change your password.',
		},
		{
			link: 'http://en.support.wordpress.com/third-party-applications/',
			post_id: 17288,
			title: 'Third Party Applications',
			description:
				'WordPress.com allows you to connect with third-party applications that ' +
				'extend your WordPress.com site in new and cool ways.',
		},
	],
	purchases: [
		{
			link: 'http://en.support.wordpress.com/manage-purchases/',
			post_id: 111349,
			title: 'Manage Purchases',
			description:
				'Have a question or need to change something about a purchase you have made? Learn how.',
		},
		{
			link: 'http://en.support.wordpress.com/auto-renewal/',
			post_id: 110924,
			title: 'Subscriptions for Plans and Domains',
			description:
				'Your WordPress.com plans and any domains you add to your sites are based ' +
				'on a yearly subscription that renews automatically.',
		},
		{
			link: 'http://en.support.wordpress.com/discover-the-wordpress-com-plans/',
			post_id: 140323,
			title: 'Explore the WordPress.com Plans',
			description:
				"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals.",
		},
	],
	'notification-settings': [
		{
			link: 'http://en.support.wordpress.com/notifications/',
			title: 'Notifications',
			description:
				'Notifications help you stay on top of the activity on your site and all the things happening on ' +
				'WordPress.com — learn how to use them.',
		},
		{
			link: 'http://en.support.wordpress.com/email-notifications/',
			post_id: 9443,
			title: 'Email Notifications',
			description:
				'WordPress.com sends email notifications to the email address registered to your account. Learn how to manage them.',
		},
		{
			link: 'http://en.support.wordpress.com/following-comments/',
			post_id: 4576,
			title: 'Following Comments',
			description:
				'When you leave a comment, you can automatically get email notifications for other new comments ' +
				"on the same post or page — you'll never be out of the loop.",
		},
		{
			link: 'http://en.support.wordpress.com/following/',
			post_id: 4899,
			title: 'Following Blogs',
			description:
				'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.',
		},
	],
	media: [
		{
			link: 'http://en.support.wordpress.com/media/',
			post_id: 853,
			title: 'The Media Library',
			description:
				'The Media Library is where you can manage your images, audio, videos, and documents ' +
				'all in one place.',
		},
		{
			link: 'http://en.support.wordpress.com/add-media/finding-free-images-and-other-media/',
			post_id: 78425,
			title: 'Finding Free Images and other Media',
			description:
				'Use free images (and other media) to make your pages and posts more interesting and engaging when on a budget!',
		},
		{
			link: 'http://en.support.wordpress.com/add-media/',
			post_id: 38830,
			title: 'Add Media',
			description:
				'Dress up your text-based posts and pages with individual images, image galleries, ' +
				'slideshows, videos, and audio.',
		},
		{
			link: 'http://en.support.wordpress.com/videos/',
			post_id: 4744,
			title: 'Including Videos',
			description:
				'Videos are a great way to enhance your site pages and blog posts. Learn how to include them.',
		},
	],
	people: [
		{
			link: 'http://en.support.wordpress.com/user-roles/',
			title: 'User Roles',
			description:
				'User roles determine the access level or permissions of a person authorized to use a WordPress.com site.',
		},
		{
			link: 'http://en.support.wordpress.com/user-mentions/',
			post_id: 91788,
			title: 'User Mentions',
			description:
				'User mentions are a great way to include other WordPress.com users within your ' +
				'posts and comments.',
		},
		{
			link: 'http://en.support.wordpress.com/adding-users/',
			post_id: 2160,
			title: 'Inviting Contributors, Followers, and Viewers',
			description:
				'Invite contributors, followers, and viewers to collaborate with others and grow your audience!',
		},
		{
			link: 'http://en.support.wordpress.com/followers/',
			post_id: 5444,
			title: 'Your Followers',
			description:
				'When someone follows your site, each time you publish new content on your blog they ' +
				'receive an update in their Reader, via email, or both depending on their settings.',
		},
	],
	plugins: [
		{
			link: 'http://en.support.wordpress.com/plugins/',
			post_id: 2108,
			title: 'Using Plugins',
			description:
				'On WordPress.com, we include the most popular plugin functionality within our ' +
				'sites automatically. Additionally, the Business plan allows you to choose from many ' +
				'thousands of plugins, and install them on your site.',
		},
		{
			link: 'http://en.support.wordpress.com/plugins/managing-plugins/',
			post_id: 134818,
			title: 'Managing plugins',
			description: 'After you install a plugin, it will appear in a list at My Sites → Plugins.',
		},
		{
			link: 'http://en.support.wordpress.com/plugins/adding-plugins/',
			post_id: 134719,
			title: 'Adding Plugins',
			description:
				'Along with all the tools and features built right into WordPress.com, the Business plan ' +
				'allows you to install other plugins.',
		},
		{
			link: 'http://en.support.wordpress.com/business-plan/',
			title: 'Business Plan',
			description:
				"When you want to build a one-of-a-kind website, it's time for WordPress.com Business: " +
				'upload plugins and themes to create a truly tailored experience for your visitors.',
		},
	],
	'posts-pages': [
		{
			link: 'http://en.support.wordpress.com/five-step-website-setup/',
			post_id: 100856,
			title: 'Build Your Website in Five Steps',
			description:
				'You’ve registered a website on WordPress.com. But now what? ' +
				'Learn five steps that will get the framework of your new website all set up, ' +
				'leaving it ready and waiting for your great content',
		},
		{
			link: 'http://en.support.wordpress.com/pages/landing-pages/',
			post_id: 124077,
			title: 'Landing Pages',
			description:
				'Landing pages are pages with a single purpose: encouraging your visitors to, for example, sign up for ' +
				'a service, buy a product, or join a mailing list.',
		},
		{
			link: 'http://en.support.wordpress.com/posts/',
			post_id: 84,
			title: 'About Blog Posts',
			description:
				'Posts are what make your blog a blog — they’re servings of content that are listed in reverse chronological order.',
		},
		{
			link: 'http://en.support.wordpress.com/posts/post-formats/',
			post_id: 10382,
			title: 'Post Formats',
			description:
				'Learn how to make gallery, video, audio, and other post types pop with post formats. ',
		},
	],
	'settings-writing': [
		{
			link: 'http://en.support.wordpress.com/settings/writing-settings/',
			post_id: 1502,
			title: 'Writing Settings',
			description: 'Learn how to manage categories, date format, content types, and more.',
		},
		{
			link: 'http://en.support.wordpress.com/posts/categories-vs-tags/',
			post_id: 2135,
			title: 'Categories vs. Tags',
			description: 'Learn the differences between categories and tags.',
		},
		{
			link: 'http://en.support.wordpress.com/feeds/',
			post_id: 3589,
			title: 'Feeds',
			description:
				'A feed (often called RSS) is a stream of posts or comments that is updated when new content is published.',
		},
		{
			link: 'http://en.support.wordpress.com/portfolios/',
			post_id: 84808,
			title: 'Portfolios',
			description:
				'To show off your portfolio separate from your blog posts and pages, the Portfolio content type will let you' +
				' manage all your portfolio projects in one place.',
		},
	],
	'settings-discussion': [
		{
			link: 'http://en.support.wordpress.com/settings/discussion-settings/',
			post_id: 1504,
			title: 'Discussion Settings',
			description:
				'The Discussion Settings are used to control how visitors and other blogs interact with your site.',
		},
		{
			link: 'http://en.support.wordpress.com/enable-disable-comments-for-future-posts/',
			post_id: 5997,
			title: 'Enable and Disable Comments for Future Posts',
			description:
				'You can enable/disable comments on future posts by going into your Discussion settings. ',
		},
		{
			link: 'http://en.support.wordpress.com/comments/',
			post_id: 113,
			title: 'Comments',
			description: 'Comments are a way for visitors to add feedback to your posts and pages.',
		},
		{
			link: 'http://en.support.wordpress.com/subscriptions-and-newsletters/',
			post_id: 67810,
			title: 'Subscriptions and Newsletters',
			description:
				'Learn how readers can subscribe to your blog to receive email notifications of all of your posts.',
		},
	],
	'settings-traffic': [
		{
			link: 'http://en.support.wordpress.com/getting-more-views-and-traffic/',
			title: 'Get More Views and Traffic',
			description:
				'Want more traffic? Here are some tips for attracting more visitors to your site!',
		},
		{
			link: 'http://en.support.wordpress.com/related-posts/',
			post_id: 1545,
			title: 'Related Posts',
			description:
				'The Related Posts feature pulls relevant content from your blog to display at the bottom of your posts.',
		},
		{
			link: 'http://en.support.wordpress.com/webmaster-tools/',
			post_id: 5022,
			title: 'Webmaster Tools',
			description:
				'Learn how to verify your WordPress.com site for the webmaster tools that many search engines provide.',
		},
		{
			link: 'http://en.support.wordpress.com/amp-accelerated-mobile-pages/',
			post_id: 122516,
			title: 'Accelerated Mobile Pages (AMP)',
			description:
				'Accelerated Mobile Pages (AMP) allows browsers and apps to load your site more quickly on mobile devices. ' +
				'By default, it is enabled for every WordPress.com site.',
		},
	],
	'settings-security': [
		{
			link: 'http://en.support.wordpress.com/security/',
			post_id: 10977,
			title: 'Security',
			description:
				'Learn what we do to help protect your site and your personal data, along with added steps ' +
				'we recommend you take to do the same.',
		},
		{
			link: 'http://en.support.wordpress.com/unwanted-comments/',
			post_id: 5882,
			title: 'Unwanted Comments and Comment Spam',
			description:
				'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!',
		},
		{
			link: 'http://en.support.wordpress.com/selecting-a-strong-password/',
			post_id: 35364,
			title: 'Selecting A Strong Password',
			description:
				'The weakest point in any security for your online accounts is usually your password. Learn how to select a strong one.',
		},
	],
	settings: [
		{
			link: 'http://en.support.wordpress.com/settings/',
			post_id: 497,
			title: 'Settings',
			description:
				'The Settings menu of your site is where you will configure everything about how the blog works and functions.',
		},
		{
			link: 'http://en.support.wordpress.com/settings/general-settings/',
			post_id: 1501,
			title: 'General Settings',
			description:
				'The General Settings let you control how your site is displayed, such as the ' +
				'title, tagline, language, and visibility.',
		},
		{
			link: 'http://en.support.wordpress.com/site-icons/',
			post_id: 1327,
			title: 'Site Icons',
			description:
				'A Site Icon is a unique icon for your site that is shown in your visitor’s browser tab ' +
				'and other places around WordPress.com.',
		},
		{
			link: 'http://en.support.wordpress.com/five-step-blog-setup/',
			post_id: 100846,
			title: 'Five Steps to Your Great New Blog',
			description:
				'Get ready to publish! Our five-step checklist walks you through all the fundamentals.',
		},
	],
	themes: [
		{
			link: 'http://en.support.wordpress.com/themes/',
			post_id: 2278,
			title: 'Themes: An Overview',
			description:
				'A theme controls the general look and feel of your site including things like ' +
				'page layout, widget locations, and default font.',
		},
		{
			link: 'http://en.support.wordpress.com/themes/mobile-themes/',
			post_id: 4925,
			title: 'Mobile Themes',
			description:
				'When a visitor browses to a WordPress.com site on a mobile device, we show ' +
				'special themes designed to work on small screens focusing on fast load times.',
		},
		{
			link: 'http://en.support.wordpress.com/premium-themes/',
			post_id: 12112,
			title: 'Premium Themes',
			description:
				'On a site with the Premium or Business plan, you can switch to any premium theme at ' +
				'no extra cost, as many times as you’d like.',
		},
		{
			link:
				'http://en.support.wordpress.com/themes/uploading-setting-up-custom-themes/child-themes/',
			title: 'Child Themes',
			description:
				"The only limit on your site is your vision — if the themes you see don't match that, it's " +
				'time to go beyond them. Learn to use child themes to customize and extend your website.',
		},
	],
	theme: [
		{
			link: 'http://en.support.wordpress.com/themes/',
			title: 'Themes: An Overview',
			description:
				'A theme controls the general look and feel of your site including things like ' +
				'page layout, widget locations, and default font.',
		},
		{
			link: 'http://en.support.wordpress.com/themes/mobile-themes/',
			title: 'Mobile Themes',
			description:
				'When a visitor browses to a WordPress.com site on a mobile device, we show ' +
				'special themes designed to work on small screens focusing on fast load times.',
		},
		{
			link: 'http://en.support.wordpress.com/premium-themes/',
			title: 'Premium Themes',
			description:
				'On a site with the Premium or Business plan, you can switch to any premium theme at ' +
				'no extra cost, as many times as you’d like.',
		},
		{
			link:
				'http://en.support.wordpress.com/themes/uploading-setting-up-custom-themes/child-themes/',
			title: 'Child Themes',
			description:
				"The only limit on your site is your vision — if the themes you see don't match that, it's " +
				'time to go beyond them. Learn to use child themes to customize and extend your website.',
		},
	],
	plans: [
		{
			link: 'http://en.support.wordpress.com/discover-the-wordpress-com-plans/',
			title: 'Explore the WordPress.com Plans',
			description:
				"Upgrading your plan unlocks a ton of features! We'll help you pick the best fit for your needs and goals.",
		},
		{
			link: 'http://en.support.wordpress.com/plan-features/',
			post_id: 134698,
			title: 'WordPress.com Plans',
			description:
				'Learn about the capabilities and features that the different plans unlock for your site.',
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
			post_id: 115025,
			title: 'Jetpack Plans',
			description:
				'Learn about the free Jetpack plugin, its benefits, and the useful capabilities and features that a Jetpack plan unlocks.',
		},
	],
	'post-editor': [
		{
			link: 'http://en.support.wordpress.com/editors/',
			post_id: 3347,
			title: 'The Visual Editor and the HTML Editor',
			description:
				'When creating a post or page on your WordPress.com blog, you have two editing modes ' +
				'available to you: the Visual Editor and the HTML Editor.',
		},
		{
			link: 'http://en.support.wordpress.com/visual-editor/',
			post_id: 3644,
			title: 'The Visual Editor',
			description:
				'The visual editor provides a semi-WYSIWYG (What You See is What You Get) content editor that ' +
				'allows you to easily create, edit, and format your content in a view similar to that of a word processor.',
		},
		{
			link: 'http://en.support.wordpress.com/xml-rpc/',
			post_id: 3595,
			title: 'Offline Editing',
			description:
				'Learn how to create and edit content for your WordPress.com site even without being connected to the internet!',
		},
		{
			link: 'http://en.support.wordpress.com/adding-users/',
			title: 'Inviting Contributors, Followers, and Viewers',
			description:
				'Invite contributors, followers, and viewers to collaborate with others and grow your audience!',
		},
	],
	reader: [
		{
			link: 'http://en.support.wordpress.com/reader/',
			post_id: 32011,
			title: 'The Reader: An Overview',
			description:
				'Read posts from all the sites you follow — even ones that aren’t on WordPress.com! ' +
				'Discover great new reads and keep track of your comments and replies in one convenient place.',
		},
		{
			link: 'http://en.support.wordpress.com/following/',
			title: 'Follow Blogs',
			description:
				'When you follow a blog on WordPress.com, new posts from that site will automatically appear in your Reader.',
		},
		{
			link: 'http://en.support.wordpress.com/topics/',
			post_id: 2166,
			title: 'Following Specific Topics in the Reader',
			description:
				'Looking for posts on a specific topic? Besides following entire blogs, you can also follow posts on a specific subject ' +
				'from across WordPress.com. You do this by adding the topic you’re interested in under the Tags heading in the Reader.',
		},
		{
			link: 'http://en.support.wordpress.com/grow-your-community/',
			title: 'Grow Your Community',
			description:
				'You’ve worked hard on building your site, now it’s time to explore the community and get noticed.',
		},
	],
	help: [
		{
			link: 'http://en.support.wordpress.com/blogging-u/',
			post_id: 117437,
			title: 'Blogging U.',
			description:
				'Blogging U. courses deliver free expert advice, pro tips, and inspiration right to your ' +
				'email inbox. Sign up now!',
		},
		{
			link: 'http://en.support.wordpress.com/help-support-options/',
			post_id: 149,
			title: 'Help! Getting WordPress.com Support',
			description:
				'WordPress.com offers a number of avenues for reaching helpful, individualized support.',
		},
		{
			link: 'https://en.support.wordpress.com/',
			title: 'All Support Articles',
			description: 'Looking to learn more about a feature? Our docs have all the details.',
		},
		{
			link: 'https://learn.wordpress.com/',
			title: 'Self-guided Online Tutorial',
			description: 'A step-by-step guide to getting familiar with the platform.',
		},
	],
	comments: [
		{
			link: 'http://en.support.wordpress.com/comments/',
			title: 'Comments',
			description: 'Comments are a way for visitors to add feedback to your posts and pages.',
		},
		{
			link: 'http://en.support.wordpress.com/comment-display-options/',
			post_id: 5840,
			title: 'Comment Display Options',
			description:
				'You can control comment threading, paging, and comment order settings from the ' +
				'Discussion Settings page in your site’s settings.',
		},
		{
			link: 'http://en.support.wordpress.com/unwanted-comments/',
			title: 'Unwanted Comments and Comment Spam',
			description:
				'There are many ways to protect your WordPress.com blogs from unwanted comments. Learn all about them!',
		},
		{
			link: 'http://en.support.wordpress.com/comment-likes/',
			post_id: 88757,
			title: 'Comment Likes',
			description:
				'Comment Likes: how to like others’ comments and control how Comment Likes appear on your site.',
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
			title: 'Add Social Sharing Buttons to Your Website',
			description:
				'Find out how to add social sharing buttons to your WordPress.com site, which you can also ' +
				'do with a Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/NcCe0ozmqFM',
			title: 'Connect Your Blog to Facebook Using Publicize',
			description:
				'Find out how to share blog posts directly on Facebook from your WordPress.com site, ' +
				'which you can also do on a Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/f44-4TgnWTs',
			title: 'Display Your Instagram Feed on Your Website',
			description:
				'Find out how to display your latest Instagram photos right on your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3rTooGV_mlg',
			title: 'Set Up the Social Links Menu',
			description:
				'Find out how to set up a social links menu on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/gmrOkkqMNlc',
			title: 'Embed a Twitter Timeline in your Sidebar',
			description:
				'Find out how to display your Twitter timeline on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/vy-U5saqG9A',
			title: 'Set Up a Social Media Icons Widget',
			description:
				'Find out how to set up the social media icons widget on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/N0GRBFRkzzs',
			title: 'Embed a Tweet from Twitter in Your Website',
			description:
				'Find out how to embed a Tweet in your content (including posts and pages) on your WordPress.com ' +
				'or Jetpack-enabled WordPress website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/uVRji6bKJUE',
			title: 'Embed an Instagram Photo in Your Website',
			description:
				'Find out how to embed an Instagram photo in your content (including posts and pages) on your WordPress.com ' +
				'or Jetpack-enabled WordPress website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/sKm3Q83JxM0',
			title: 'Embed a Facebook Update in Your Website',
			description:
				'Find out how to embed a Facebook update in your content (including posts, pages, and even comments) on your ' +
				'WordPress.com or Jetpack-enabled WordPress website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/SBgNkre_b14',
			title: 'Share Blog Posts Directly on Twitter',
			description:
				'Find out how to share blog posts directly on Twitter from your WordPress.com or Jetpack-enabled WordPress site.',
		},
	],
	settings: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/0YCZ22k4SfQ',
			title: 'Add a Site Logo',
			description: 'Find out how to add a custom logo to your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/vucZ1uZ2NPo',
			title: 'Update Your Website Title and Tagline',
			description:
				'Find out how to update the Title and Tagline of your WordPress.com site, which you can also ' +
				'do on your Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Y6iPsPwYD7g',
			title: 'Change Your Privacy Settings',
			description: 'Find out how to change your website privacy settings on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/bjxKGxW0MRA',
			title: 'Add a Site Icon',
			description: 'Find out how to add a site icon on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/z6fCtvLB0wM',
			title: 'Create a Multilingual Site',
			description: 'Find out how to create a multilingual site on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/D142Edhcpaw',
			title: 'Customize Your Content Options',
			description: 'Find out how to customize your content options on select WordPress.com themes.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Vyr-g5SEuIA',
			title: 'Change Your Language Settings',
			description:
				'Find out how to change your blog or website language and your interface language settings on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/EUuEuW_LCrc',
			title: 'Activate Free Email Forwarding',
			description:
				'Find out how to activate free email forwarding from an address using a custom domain registered through WordPress.com.',
		},
	],
	'post-editor': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/hNg1rrkiAjg',
			title: 'Set a Featured Image for a Post or Page',
			description:
				'Find out how to add a featured image where available on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/dAcEBKXPlyA',
			title: 'Add a Contact Form to Your Website',
			description: 'Find out how to add a contact form to your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/ssfHW5lwFZg',
			title: 'Embed a YouTube Video in Your Website',
			description:
				'Find out how to embed a YouTube video in your content (including posts, pages, and even comments) ' +
				'on your WordPress.com or Jetpack-enabled WordPress website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/_tpcHN6ZtKM',
			title: 'Schedule a Post',
			description: 'Find out how to schedule a post on your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/V8UToJoSf4Q',
			title: 'Add a Simple Payment Button',
			description: 'Find out how to add a payment button to your WordPress.com website.',
		},
	],
	account: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/aO-6yu3_xWQ',
			title: 'Change Your Password',
			description: 'Find out how to change your account password on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/qhsjkqFdDZo',
			title: 'Change Your WordPress.com Username',
			description: 'Find out how to change your username on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Tyxu_xT6q1k',
			title: 'Change Your WordPress.com Display Name',
			description: 'Find out how to change your display name on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/07Nf8FkjO4o',
			title: 'Change Your Account Email Address',
			description: 'Find out how to change your account email address WordPress.com.',
		},
	],
	customizer: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/pf_ST7gvY8c',
			title: 'Add a Custom Header Image',
			description:
				'Find out how to add a custom header image to your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/CY20IAtl2Ac',
			title: 'Create a Custom Website Menu',
			description:
				'Find out how to create a custom menu on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/2H_Jsgh2Z3Y',
			title: 'Add a Widget',
			description: 'Find out how to add a widget to your WordPress.com website.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/ypFF4ONBfSQ',
			title: 'Add a Custom Background',
			description: 'Find out how to add a custom background to your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/b8EuJDrNeOA',
			title: 'Change Your Site Fonts',
			description: 'Find out how to change the fonts on your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/7VPgvxV78Kc',
			title: 'Add a Gallery Widget',
			description:
				'Find out how to add an image gallery widget to your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/oDBuaBLrwF8',
			title: 'Use Featured Content',
			description:
				'Find out how to use the Featured Content option on your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3TqRr21zyiA',
			title: 'Add an Image Widget',
			description: 'Find out how to add an image widget to your WordPress.com website or blog.',
		},
	],
	'posts-pages': [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/3RPidSCQ0LI',
			title: 'Create a Landing Page',
			description:
				'Find out how to create a one-page website or landing page on your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/4IkFQzl5nXc',
			title: 'Set Up a Website in 5 Steps',
			description: 'Find out how to create a website on WordPress.com in five steps.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/mta6Y0o7yJk',
			title: 'Set Up a Blog in 5 Steps',
			description: 'Find out how to create a blog on WordPress.com in five steps.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/Gx7YNX1Wk5U',
			title: 'Create a Page',
			description: 'Find out how to create a page on your WordPress.com site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/mCfuh5bCOwM',
			title: 'Create a Post',
			description: 'Find out how to create a post on WordPress.com.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/bEVHg6nopcs',
			title: 'Use a Custom Menu in a Widget',
			description:
				'Find out how to use a custom menu in a widget on your WordPress.com or Jetpack-enabled WordPress site.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/nAzdUOlFoBI',
			title: 'Configure a Static Homepage',
			description:
				'By default, your new WordPress.com website displays your latest posts. Find out how to create a static homepage instead.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/MPpVeMmDOhk',
			title: 'Show Related Posts on Your WordPress Blog',
			description:
				'Find out how to show related posts on your WordPress.com site, which you can also do on a Jetpack-enabled WordPress blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/JVnltCZUKC4',
			title: 'Add Testimonials',
			description: 'Find out how to add testimonials to your WordPress.com website or blog.',
		},
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/yH_gapAUGAA',
			title: 'Change Your Post or Page Visibility Settings',
			description: 'Find out how to change your page or post visibility settings WordPress.com.',
		},
	],
	media: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/VjGnEHyqVqQ',
			title: 'Add a Photo Gallery',
			description:
				'Find out how to add a photo gallery on your WordPress.com and Jetpack-enabled website.',
		},
	],
	themes: [
		{
			type: RESULT_VIDEO,
			link: 'https://www.youtube.com/embed/yOfAuOb68Hc',
			title: 'Change Your Website Theme on WordPress.com',
			description: 'Find out how to change your WordPress.com theme.',
		},
	],
};

const toursForSection = {
	'post-editor': [
		{
			type: RESULT_TOUR,
			tour: 'simplePaymentsTour',
			key: 'tour:simplePaymentsTour',
			title: 'Collect Payments and Donations',
			description: 'It’s easy to add a button that can collect payments or donations. See how!',
		},
	],
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
	const links = get( contextLinksForSection, section, fallbackLinks );
	return compact( [ tour, video, ...links ] );
}
