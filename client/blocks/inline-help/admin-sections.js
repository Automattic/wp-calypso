/** @format */
/**
 * External dependencies
 */
import { intersection, memoize, words } from 'lodash';
import { translate } from 'i18n-calypso';
import { getLocaleSlug } from 'lib/i18n-utils';

/**
 * Internal Dependencies
 */

/**
 * Returns admin section items with site-based urls.
 *
 * @param {String} siteSlug - The current site slug.
 * @returns {Array}           An array of admin sections with site-specific URLs.
 */
const adminSections = memoize( siteSlug => [
	{
		title: translate( 'Add a new domain' ),
		description: translate(
			'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
		),
		link: `/domains/add/${ siteSlug }`,
		synonyms: [ 'domain' ],
		icon: 'domains',
	},
	{
		title: translate( 'Manage my domain settings' ),
		link: `/domains/manage/${ siteSlug }`,
		icon: 'domains',
	},
	{
		title: translate( 'Change my site address' ),
		link: `/domains/manage/${ siteSlug }/edit/${ siteSlug }`,
		synonyms: [ 'domain' ],
		icon: 'domains',
	},
	{
		title: translate( 'Add a site redirect' ),
		description: translate( 'Redirect your site to another domain.' ),
		link: `/domains/add/site-redirect/${ siteSlug }`,
		synonyms: [ 'domain', 'forward' ],
		icon: 'domains',
	},
	{
		title: translate( 'Change my password' ),
		link: '/me/security',
		synonyms: [ 'update' ],
		icon: 'cog',
	},
	{
		title: translate( "Change my site's theme" ),
		link: `/themes/${ siteSlug }`,
		synonyms: [ 'switch', 'design' ],
		icon: 'customize',
	},
	{
		title: translate( "Customize my site's theme" ),
		link: `/customize/${ siteSlug }`,
		synonyms: [ 'color', 'font', 'design', 'css', 'widgets' ],
		icon: 'customize',
	},
	{
		title: translate( 'Find a plan to suit my site' ),
		link: `/plans/${ siteSlug }`,
		synonyms: [ 'upgrade', 'business', 'profressional', 'personal' ],
		icon: 'plans',
	},
	{
		title: translate( 'View my site activity' ),
		link: `/activity-log/${ siteSlug }`,
		icon: 'history',
	},
	{
		title: translate( "View my site's latest statistics" ),
		link: `/stats/day/${ siteSlug }`,
		synonyms: [ 'analytics' ],
		icon: 'stats-alt',
	},
	{
		title: translate( 'Upload an image, video, audio or document' ),
		link: `/media/${ siteSlug }`,
		synonyms: [ 'media', 'photo' ],
		icon: 'image',
	},
	{
		title: translate( 'Import content from another site' ),
		link: `/settings/import/${ siteSlug }`,
		synonyms: [ 'medium', 'blogger', 'wix', 'squarespace' ],
		icon: 'cloud-upload',
	},
	{
		title: translate( 'Earn money from my content and traffic' ),
		description: translate(
			"By upgrading to the Premium plan, you'll be able to monetize your site through the WordAds program."
		),
		link: `/earn/${ siteSlug }`,
		synonyms: [ 'monetize', 'wordads', 'premium' ],
		icon: 'money',
	},
	{
		title: translate( 'Learn how to market my site' ),
		link: `/marketing/tools/${ siteSlug }`,
		synonyms: [ 'marketing', 'brand', 'logo', 'seo', 'tools', 'traffic' ],
		icon: 'speaker',
	},
	{
		title: translate( "Manage my site's users" ),
		description: translate( 'Invite new users and edit existing ones.' ),
		link: `/people/team/${ siteSlug }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		icon: 'user',
	},
	{
		title: translate( 'Invite new users to my site' ),
		link: `/people/new/${ siteSlug }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		icon: 'user',
	},
	{
		title: translate( "Change my site's timezone" ),
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'time', 'date' ],
		icon: 'cog',
	},
	{
		title: translate( 'Launch my site' ),
		description: translate( 'Switch your site from private to public.' ),
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'private', 'public' ],
		icon: 'cog',
	},
	{
		title: translate( "Delete a site or a site's content" ),
		description: translate( 'Remove all posts, pages, and media, or delete a site completely.' ),
		link: `/settings/general/${ siteSlug }`,
		icon: 'cog',
	},
	{
		title: translate( "Change my site's footer text" ),
		description: translate(
			'You can customize your website by changing the footer credit in customizer.'
		),
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'remove footer', 'update footer' ],
		icon: 'cog',
	},
	{
		title: translate( "Export my site's content and media library" ),
		description: translate( 'Export posts, pages and more from your site.' ),
		link: `/settings/export/${ siteSlug }`,
		synonyms: [ 'xml', 'images', 'migration', 'import', 'download' ],
		icon: 'cog',
	},
	{
		title: translate( 'Manage sharing and social media connections' ),
		description: translate(
			'You can customize your website by changing the footer credit in customizer.'
		),
		link: `/sharing/${ siteSlug }`,
		synonyms: [ 'facebook', 'twitter', 'twitter', 'tumblr', 'eventbrite' ],
		icon: 'share',
	},
	{
		title: translate( 'Add sharing buttons to my site' ),
		description: translate(
			'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.'
		),
		link: `/sharing/buttons/${ siteSlug }`,
		synonyms: [ 'like', 'reblog' ],
		icon: 'share',
	},
	{
		title: translate( 'Install, manage and search for site plugins' ),
		description: translate(
			'You can customize your website by changing the footer credit in customizer.'
		),
		link: `/plugins/${ siteSlug }`,
		synonyms: [ 'upload' ],
		icon: 'plugins',
	},
	{
		title: translate( 'Approve or remove comments' ),
		link: `/comments/all/${ siteSlug }`,
		synonyms: [ 'spam', 'discussion', 'moderation', 'moderate' ],
		icon: 'chat',
	},
	{
		title: translate( 'Manage how users can comment on my site' ),
		link: `/settings/discussion/${ siteSlug }`,
		synonyms: [ 'discussion', 'moderation', 'blacklist' ],
		icon: 'cog',
	},
	{
		title: translate( 'Manage SEO and traffic settings' ),
		link: `/settings/traffic/${ siteSlug }`,
		synonyms: [ 'analytics', 'related', 'sitemap' ],
		icon: 'cog',
	},
	{
		title: translate( 'Update my profile' ),
		description: translate( 'Update your name, profile image, and about text.' ),
		link: '/me',
		synonyms: [ 'avatar' ],
		icon: 'user',
	},
	{
		title: translate( 'Update my username or email address' ),
		link: '/me/account',
		synonyms: [ 'user', 'account' ],
		icon: 'cog',
	},
	{
		title: translate( 'Change the dashboard color scheme' ),
		link: '/me/account',
		synonyms: [ 'theme' ],
		icon: 'cog',
	},
	{
		title: translate( 'Switch the interface language' ),
		description: translate(
			'Update the language of the interface you see across WordPress.com as a whole.'
		),
		link: '/me/account',
		synonyms: [ 'dashboard', 'change', 'language' ],
		icon: 'cog',
	},
	{
		title: translate( 'Close my account permanently' ),
		description: translate( 'Delete all of your sites, and close your account completely.' ),
		link: '/me/account/close',
		synonyms: [ 'delete' ],
		icon: 'cog',
	},
	{
		title: translate( 'Change my privacy settings' ),
		link: '/me/privacy',
		synonyms: [ 'security', 'tracking' ],
		icon: 'visible',
	},
	{
		title: translate( 'View my purchase and billing history' ),
		link: '/me/purchases',
		synonyms: [ 'purchases', 'invoices', 'pending', 'payment', 'credit card' ],
		icon: 'credit-card',
	},
	{
		title: translate( 'Download the WordPress.com app for my device' ),
		description: translate( 'Get WordPress apps for all your screens.' ),
		link: '/me/get-apps',
		synonyms: [ 'android', 'iphone', 'mobile', 'desktop', 'phone' ],
		icon: 'my-sites',
	},
] );

/**
 * Returns a filtered site admin collection
 *
 * @param   {String} searchTerm The search term
 * @param   {Array}  collection A collection of site admin objects
 * @param   {Number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
export function filterListBySearchTerm( searchTerm = '', collection = [], limit = 4 ) {
	const searchTermWords = words( searchTerm ).map( word => word.toLowerCase() );

	if ( searchTermWords.length < 1 ) {
		return [];
	}

	const searchRegex = new RegExp(
		// Join a series of look aheads
		// matching full and partial works
		// Example: "Add a dom" => /(?=.*\badd\b)(?=.*\ba\b)(?=.*\bdom).+/gi
		searchTermWords
			.map( ( word, i ) =>
				// if it's the last word, don't look for a end word boundary
				// otherwise
				i + 1 === searchTermWords.length ? `(?=.*\\b${ word })` : `(?=.*\\b${ word }\\b)`
			)
			.join( '' ) + '.+',
		'gi'
	);

	return collection
		.filter( item => {
			if ( searchRegex.test( item.title ) ) {
				return true;
			}
			// Until we get the synonyms translated, just check when the language is `'en'`
			return 'en' === getLocaleSlug()
				? intersection( item.synonyms, searchTermWords ).length > 0
				: false;
		} )
		.map( item => ( { ...item, type: 'internal', key: item.title } ) )
		.slice( 0, limit );
}

/**
 * Returns a filtered site admin collection using the memoized adminSections.
 *
 * @param   {String} searchTerm The search term
 * @param   {String} siteSlug   The current site slug
 * @param   {Number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
export function getAdminSectionsResults( searchTerm = '', siteSlug, limit ) {
	if ( ! searchTerm ) {
		return [];
	}

	return filterListBySearchTerm( searchTerm, adminSections( siteSlug || '' ), limit );
}
