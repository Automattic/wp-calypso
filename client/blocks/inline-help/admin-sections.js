/** @format */
/**
 * External dependencies
 */
import { includes, words } from 'lodash';

/**
 * Internal Dependencies
 */

/**
 * Returns admin section items with site-based urls
 *
 * @param {Int} siteId The currentsite id
 * @param {String} siteSlug The current site slug
 * @returns {Array} An array of admin sections with site-specific URLs
 */
const adminSections = ( siteId, siteSlug ) => [
	{
		title: 'Add a domain',
		description: 'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
		link: `/domains/add/${ siteSlug }`,
		sidebarLabel: 'Domains',
	},
	{
		title: 'Domain settings',
		description: 'Manage your domain settings',
		link: `/domains/manage/{site_slug}/edit/${ siteSlug }`,
		sidebarLabel: 'Domains',
	},
	{
		title: 'Change my site address',
		description: '',
		link: `/domains/manage/{site_slug}/edit/${ siteSlug }`,
		synonyms: [ 'domain' ],
		sidebarLabel: 'Domains',
	},
	{
		title: 'Change my password',
		description: '',
		link: '/me/security',
		synonyms: [ 'update' ],
		sidebarLabel: 'Settings',
	},
	{
		title: "Change my site's theme",
		description: '',
		link: `/themes/${ siteSlug }`,
		synonyms: [ 'switch' ],
		sidebarLabel: 'Customize',
	},
	{
		title: 'Show me plans to suit my site',
		description: '',
		link: `/plans/${ siteSlug }`,
		sidebarLabel: 'Plan',
	},
	{
		title: 'View my site activity',
		description: '',
		link: `/activity-log/${ siteSlug }`,
		sidebarLabel: 'Activity',
	},
	{
		title: "View my site's latest statistics",
		description: '',
		link: `/stats/day/${ siteId }`,
		synonyms: [ 'analytics' ],
		sidebarLabel: 'Stats',
	},
	{
		title: 'Upload an image, video, audio or document',
		description: '',
		link: `/stats/day/${ siteId }`,
		synonyms: [ 'media', 'photo' ],
		sidebarLabel: 'Media',
	},
	{
		title: 'Import content from another site',
		description: '',
		link: `/settings/import/${ siteId }`,
		synonyms: [ 'medium', 'blogger', 'wix', 'squarespace' ],
		sidebarLabel: 'Import',
	},
	{
		title: 'Earn money from your content and traffic',
		description:
			"By upgrading to the Premium plan, you'll be able to monetize your site through the WordAds program.",
		link: `/earn/${ siteId }`,
		synonyms: [ 'monetize', 'wordads', 'premium' ],
		sidebarLabel: 'Earn',
	},
	{
		title: "Manage your site's users",
		description: '',
		link: `/people/team/${ siteId }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		sidebarLabel: 'People',
	},
	{
		title: 'Invite new users to your site',
		description: '',
		link: `/people/new/${ siteId }`,
		synonyms: [ 'administrator', 'editor', 'contributor', 'viewer', 'follower' ],
		sidebarLabel: 'People',
	},
	{
		title: "Change your site's timezone",
		description: '',
		link: `/settings/general/${ siteId }`,
		sidebarLabel: 'Settings',
	},
	{
		title: "Change your site's footer text",
		description: 'You can customize your website by changing the footer credit in customizer.',
		link: `/settings/general/${ siteId }`,
		synonyms: [ 'remove footer', 'update footer' ],
		sidebarLabel: 'Settings',
	},
];

/**
 * Returns a filtered site admin collection
 *
 * @param {String} searchTerm The search term
 * @param {Array} collection A collection of site admin objects
 * @returns {Array?} An filtered array
 */
export function filterListBySearchTerm( searchTerm = '', collection ) {
	const searchTermWords = words( searchTerm ).map( word => word.toLowerCase() );

	if ( searchTermWords.length < 1 ) {
		return;
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
		.filter( item => searchRegex.test( item.title ) || includes( item.synonyms, searchTerm ) )
		.map( item => ( { ...item, type: 'internal' } ) );
}

export function getAdminSectionsResults( searchTerm = '', siteId = '', siteSlug = '' ) {
	if ( ! siteSlug || ! searchTerm || ! siteId ) {
		return;
	}

	return filterListBySearchTerm( searchTerm, adminSections( siteId, siteSlug ) );
}
