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
 * Looks up site types array for item match and returns a property value
 *
 * @example
 * // Find the site type where `id === 2`, and return the value of `slug`
 * const siteTypeValue = getSiteTypePropertyValue( 'id', 2, 'slug' );
 *
 * @param {string} key A property name of a site types item
 * @param {string|number} value The value of `key` with which to filter items
 * @param {string} property The name of the property whose value you wish to return
 * @param {array} siteTypes (optional) A site type collection
 * @return {(string|int)?} value of `property` or `null` if none is found
 */
export function getSiteTypePropertyValue( key, value, property, siteTypes = getAllSiteTypes() ) {
	const siteTypeProperties = find( siteTypes, { [ key ]: value } );
	return get( siteTypeProperties, property, null );
}

/**
 * Returns a current list of site types that are displayed in the signup site-type step
 * Some (or all) of these site types will also have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 * Do note that id's per site type should not be changed as we add/remove site-types.
 *
 * Please don't modify the IDs for now until we can integrate the /segments API into Calypso.
 *
 * @return {array} current list of site types
 */
export function getAllSiteTypes() {
	return [
		{
			id: 2, // This value must correspond with its sibling in the /segments API results
			slug: 'blog',
			defaultVertical: 'blogging', // used to conduct a vertical search and grab a default vertical for the segment
			label: i18n.translate( 'Blog' ),
			description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
			theme: 'pub/independent-publisher-2',
			designType: 'blog',
			siteTitleLabel: i18n.translate( 'What would you like to call your blog?' ),
			siteTitlePlaceholder: i18n.translate( "E.g., Stevie's blog " ),
			siteTopicHeader: i18n.translate( 'What is your blog about?' ),
			siteTopicLabel: i18n.translate( 'What will your blog be about?' ),
		},
		{
			id: 1, // This value must correspond with its sibling in the /segments API results
			slug: 'business',
			defaultVertical: 'business',
			label: i18n.translate( 'Business' ),
			description: i18n.translate( 'Promote products and services.' ),
			theme: 'pub/professional-business',
			designType: 'page',
			siteTitleLabel: i18n.translate( 'What is the name of your business?' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., Vail Renovations' ),
			siteTopicHeader: i18n.translate( 'What does your business do?' ),
			siteTopicLabel: i18n.translate( 'What type of business do you have?' ),
			customerType: 'business',
		},
		{
			id: 4, // This value must correspond with its sibling in the /segments API results
			slug: 'professional',
			defaultVertical: 'designer',
			label: i18n.translate( 'Professional' ),
			description: i18n.translate( 'Showcase your portfolio and work.' ),
			theme: 'pub/altofocus',
			designType: 'portfolio',
			siteTitleLabel: i18n.translate( 'What is your name?' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., John Appleseed' ),
			siteTopicHeader: i18n.translate( 'What type of work do you do?' ),
			siteTopicLabel: i18n.translate( 'What type of work do you do?' ),
		},
		{
			id: 3, // This value must correspond with its sibling in the /segments API results
			slug: 'online-store',
			defaultVertical: 'business',
			label: i18n.translate( 'Online store' ),
			description: i18n.translate( 'Sell your collection of products online.' ),
			theme: 'pub/dara',
			designType: 'store',
			siteTitleLabel: i18n.translate( 'What is the name of your store?' ),
			siteTitlePlaceholder: i18n.translate( "E.g., Mel's Diner" ),
			siteTopicHeader: i18n.translate( 'What type of products do you sell?' ),
			siteTopicLabel: i18n.translate( 'What type of products do you sell?' ),
			customerType: 'business',
		},
	];
}
