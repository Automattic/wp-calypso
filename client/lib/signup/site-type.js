/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Current list of site types that are displayed in the signup site-type step
 * Some (or all) of these site types will also have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 */
export const allSiteTypes = [
	{
		id: 2,
		slug: 'blog',
		label: i18n.translate( 'Blog' ),
		description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
		theme: 'pub/independent-publisher-2',
		designType: 'blog',
		siteTitleLabel: i18n.translate( 'What would you like to call your blog?' ),
		siteTitlePlaceholder: i18n.translate( "E.g., Stevie's blog " ),
		siteTopicHeader: i18n.translate( 'Tell us about your blog' ),
		siteTopicLabel: i18n.translate( 'What will your blog be about?' ),
	},
	{
		id: 1,
		slug: 'business',
		label: i18n.translate( 'Business' ),
		description: i18n.translate( 'Promote products and services.' ),
		theme: 'pub/professional-business',
		designType: 'page',
		siteTitleLabel: i18n.translate( 'What is the name of your business?' ),
		siteTitlePlaceholder: i18n.translate( 'E.g., Vail Renovations' ),
		siteTopicHeader: i18n.translate( 'Tell us about your business' ),
		siteTopicLabel: i18n.translate( 'What type of business do you have?' ),
		customerType: 'business',
	},
	{
		id: 3,
		slug: 'professional',
		label: i18n.translate( 'Professional' ),
		description: i18n.translate( 'Showcase your portfolio and work.' ),
		theme: 'pub/altofocus',
		designType: 'portfolio',
		siteTitleLabel: i18n.translate( 'What is your name?' ),
		siteTitlePlaceholder: i18n.translate( 'E.g., John Appleseed' ),
		siteTopicHeader: i18n.translate( 'Tell us about your website' ),
		siteTopicLabel: i18n.translate( 'What type of work do you do?' ),
	},
	{
		id: 4,
		slug: 'education',
		label: i18n.translate( 'Education' ),
		description: i18n.translate( 'Share school projects and class info.' ),
		theme: 'pub/twentyfifteen',
		designType: 'blog',
		siteTitleLabel: i18n.translate( 'What is the name of your site?' ),
		siteTitlePlaceholder: i18n.translate( 'E.g., My class' ),
		siteTopicHeader: i18n.translate( 'Tell us about your website' ),
		siteTopicLabel: i18n.translate( 'What will your site be about?' ),
	},
	{
		id: 5,
		slug: 'online-store',
		label: i18n.translate( 'Online store' ),
		description: i18n.translate( 'Sell your collection of products online.' ),
		theme: 'pub/dara',
		designType: 'store',
		siteTitleLabel: i18n.translate( 'What is the name of your store?' ),
		siteTitlePlaceholder: i18n.translate( "E.g., Mel's Diner" ),
		siteTopicHeader: i18n.translate( 'Tell us about your website' ),
		siteTopicLabel: i18n.translate( 'What type of products do you sell?' ),
		customerType: 'business',
	},
];

/**
 * Finds in `allSiteTypes` for item match and returns a property value
 *
 * @example
 * // Find the item in `allSiteTypes` where `id === 2`, and return the value of `slug`
 * const siteTypeValue = getSiteTypePropertyValue( 'id', 2, 'slug' );
 *
 * @param {string} key A property name of a site types item
 * @param {string|number} value The value of `key` with which to filter items
 * @param {string} property The name of the property whose value you wish to return
 * @param {array} siteTypes (optional) A site type collection
 * @return {(string|int)?} value of `property` or `null` if none is found
 */
export function getSiteTypePropertyValue( key, value, property, siteTypes = allSiteTypes ) {
	const siteTypeProperties = find( siteTypes, { [ key ]: value } );
	return get( siteTypeProperties, property, null );
}
