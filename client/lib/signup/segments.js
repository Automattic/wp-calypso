/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Looks up site segments object array for property match and returns a property value.
 *
 * @param {string} segmentSlug            A property name of a site segment definition
 * @param {Object} siteSegmentDefinitions Object of site type definitions
 * @return {Object?}                      value of `property` or `null` if none is found
 */
export function getSegmentDefinition( segmentSlug, siteSegmentDefinitions = getAllSegmentDefinitions() ) {
	return get( siteSegmentDefinitions, segmentSlug, null );
}

/**
 * Returns complementary properties for current site segments received from the /segments API.
 * We do this because Calypso requires extra information, different copy and so on.
 *
 * The keys should correspond with the slugs in the /segments API collection.
 *
 * @return {Object} Object of site type definitions
 */
export function getAllSegmentDefinitions() {
	return {
		blog: {
			label: i18n.translate( 'Blog' ),
			description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
			theme: 'pub/independent-publisher-2',
			designType: 'blog',
			siteTitleLabel: i18n.translate( 'What would you like to call your blog?' ),
			siteTitlePlaceholder: i18n.translate( "E.g., Stevie's blog " ),
			siteTopicHeader: i18n.translate( 'What is your blog about?' ),
			siteTopicLabel: i18n.translate( 'What will your blog be about?' ),
		},
		business: {
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
		professional: {
			label: i18n.translate( 'Professional' ),
			description: i18n.translate( 'Showcase your portfolio and work.' ),
			theme: 'pub/altofocus',
			designType: 'portfolio',
			siteTitleLabel: i18n.translate( 'What is your name?' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., John Appleseed' ),
			siteTopicHeader: i18n.translate( 'What type of work do you do?' ),
			siteTopicLabel: i18n.translate( 'What type of work do you do?' ),
		},
		'online-store': {
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
	};
}
