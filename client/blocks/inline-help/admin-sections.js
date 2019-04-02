/** @format */
/**
 * External dependencies
 */
import { intersection, memoize, words } from 'lodash';

/**
 * Internal Dependencies
 */

/**
 * Returns admin section items with site-based urls
 *
 * @param {String} siteSlug The current site slug
 * @returns {Array} An array of admin sections with site-specific URLs
 */
const adminSections = memoize( siteSlug => [
	{
		title: 'Add a new domain',
		description: 'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
		link: `/domains/add/${ siteSlug }`,
		icon: 'domains',
	},
	{
		title: 'Manage my domain settings',
		description: 'Manage your domain settings',
		link: `/domains/manage/${ siteSlug }`,
		icon: 'domains',
	},
	{
		title: 'Change my site address',
		description: '',
		link: `/domains/manage/${ siteSlug }`,
		synonyms: [ 'domain' ],
		icon: 'domains',
	},
	{
		title: 'Add a site redirect',
		description: 'Redirect your site to another domain.',
		link: `/domains/add/site-redirect/${ siteSlug }`,
		synonyms: [ 'domain', 'forward' ],
		icon: 'domains',
	},
	{
		title: 'Change my password',
		description: '',
		link: '/me/security',
		synonyms: [ 'update' ],
		icon: 'cog',
	},
	{
		title: "Change my site's theme",
		description: '',
		link: `/themes/${ siteSlug }`,
		synonyms: [ 'switch' ],
		icon: 'customize',
	},
	{
		title: 'Find a plan to suit my site',
		description: '',
		link: `/plans/${ siteSlug }`,
		icon: 'plans',
	},
	{
		title: 'View my site activity',
		description: '',
		link: `/activity-log/${ siteSlug }`,
		icon: 'history',
	},
	{
		title: "View my site's latest statistics",
		description: '',
		link: `/stats/day/${ siteSlug }`,
		synonyms: [ 'analytics' ],
		icon: 'stats-alt',
	},
	{
		title: 'Upload an image, video, audio or document',
		description: '',
		link: `/media/${ siteSlug }`,
		synonyms: [ 'media', 'photo' ],
		icon: 'image',
	},
	{
		title: 'Import content from another site',
		description: '',
		link: `/settings/import/${ siteSlug }`,
		synonyms: [ 'medium', 'blogger', 'wix', 'squarespace' ],
		icon: 'cloud-upload',
	},
	{
		title: 'Earn money from my content and traffic',
		description:
			"By upgrading to the Premium plan, you'll be able to monetize your site through the WordAds program.",
		link: `/earn/${ siteSlug }`,
		synonyms: [ 'monetize', 'wordads', 'premium' ],
		icon: 'money',
	},
	{
		title: "Manage my site's users",
		description: 'Invite new users and edit existing ones.',
		link: `/people/team/${ siteSlug }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		icon: 'user',
	},
	{
		title: 'Invite new users to my site',
		description: '',
		link: `/people/new/${ siteSlug }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		icon: 'user',
	},
	{
		title: "Change my site's timezone",
		description: '',
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'time', 'date' ],
		icon: 'cog',
	},
	{
		title: 'Launch my site',
		description: 'Switch your site from private to public.',
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'private', 'public' ],
		icon: 'cog',
	},
	{
		title: "Delete a site or a site's content",
		description: 'Remove all posts, pages, and media, or delete a site completely.',
		link: `/settings/general/${ siteSlug }`,
		icon: 'cog',
	},
	{
		title: "Change my site's footer text",
		description: 'You can customize your website by changing the footer credit in customizer.',
		link: `/settings/general/${ siteSlug }`,
		synonyms: [ 'remove footer', 'update footer' ],
		icon: 'cog',
	},
	{
		title: "Export my site's content and media library",
		description: 'Export posts, pages and more from your site.',
		link: `/settings/export/${ siteSlug }`,
		synonyms: [ 'xml', 'images', 'migration', 'import', 'download' ],
		icon: 'cog',
	},
	{
		title: 'Manage sharing and social media connections',
		description: 'You can customize your website by changing the footer credit in customizer.',
		link: `/sharing/${ siteSlug }`,
		synonyms: [ 'facebook', 'twitter', 'twitter', 'tumblr', 'eventbrite' ],
		icon: 'share',
	},
	{
		title: 'Add sharing buttons to my site',
		description:
			'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.',
		link: `/sharing/buttons/${ siteSlug }`,
		synonyms: [ 'like', 'reblog' ],
		icon: 'share',
	},
	{
		title: 'Install, manage and search for site plugins',
		description: 'You can customize your website by changing the footer credit in customizer.',
		link: `/plugins/${ siteSlug }`,
		synonyms: [ 'upload' ],
		icon: 'plugins',
	},
	{
		title: 'Approve or remove comments',
		description: '',
		link: `/comments/all/${ siteSlug }`,
		synonyms: [ 'spam', 'discussion', 'moderation', 'moderate' ],
		icon: 'chat',
	},
	{
		title: 'Manage how users can comment on my site',
		link: `/settings/discussion/${ siteSlug }`,
		synonyms: [ 'discussion', 'moderation', 'blacklist' ],
		icon: 'cog',
	},
	{
		title: 'Manage SEO and traffic settings',
		link: `/settings/traffic/${ siteSlug }`,
		synonyms: [ 'analytics', 'related', 'sitemap' ],
		icon: 'cog',
	},
	{
		title: 'Update my profile',
		description: 'Update your name, profile image, and about text.',
		link: `/me`,
		synonyms: [ 'avatar' ],
		icon: 'user',
	},
	{
		title: 'Update my username or email address',
		description: '',
		link: `/me/account`,
		synonyms: [ 'user', 'account' ],
		icon: 'cog',
	},
	{
		title: 'Change the dashboard color scheme',
		description: '',
		link: `/me/account`,
		synonyms: [ 'theme' ],
		icon: 'cog',
	},
	{
		title: 'Switch the interface language',
		description: 'Update the language of the interface you see across WordPress.com as a whole.',
		link: `/me/account`,
		synonyms: [ 'dashboard', 'change', 'language' ],
		icon: 'cog',
	},
	{
		title: 'Close my account permanently',
		description: 'Delete all of your sites, and close your account completely.',
		link: `/me/account/close`,
		synonyms: [ 'delete' ],
		icon: 'cog',
	},
	{
		title: 'Change my privacy settings',
		description: '',
		link: `/me/privacy`,
		synonyms: [ 'security', 'tracking' ],
		icon: 'visible',
	},
	{
		title: 'View my purchase and billing history',
		description: '',
		link: `/me/purchases`,
		synonyms: [ 'purchases', 'invoices', 'pending', 'payment', 'credit card' ],
		icon: 'credit-card',
	},
	{
		title: 'Download the WordPress.com app for my device',
		description: 'Get WordPress apps for all your screens.',
		link: `/me/get-apps`,
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
		.filter(
			item =>
				searchRegex.test( item.title ) || intersection( item.synonyms, searchTermWords ).length
		)
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
