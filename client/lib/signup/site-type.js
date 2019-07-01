/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */

const getSiteTypePropertyDefaults = propertyKey =>
	get(
		{
			// General copy
			siteMockupHelpTipCopy: i18n.translate(
				"Scroll down to see how your site will look. You can customize it with your own text and photos when we're done with the setup basics."
			),
			siteMockupHelpTipCopyBottom: i18n.translate( 'Scroll back up to continue.' ),
			siteMockupTitleFallback: i18n.translate( 'Your New Website' ),
			// Site title step
			siteTitleLabel: i18n.translate( 'Give your site a name' ),
			siteTitleSubheader: i18n.translate(
				'This will appear at the top of your site and can be changed at anytime.'
			),
			siteTitlePlaceholder: i18n.translate( 'default siteTitlePlaceholder' ),
			// Site topic step
			siteTopicHeader: i18n.translate( 'What is your site about?' ),
			siteTopicLabel: i18n.translate( 'What is your site about?' ),
			siteTopicSubheader: i18n.translate(
				"We'll add relevant content to your site to help you get started."
			),
			siteTopicInputPlaceholder: i18n.translate( 'Enter a topic or choose one from below.' ),
			// Domains step
			domainsStepHeader: i18n.translate( 'Give your site an address' ),
			domainsStepSubheader: i18n.translate(
				'Enter a keyword that describes your site to get started.'
			),
			// Site styles step
			siteStyleSubheader: i18n.translate(
				'This will help you get started with a theme you might like. You can change it later.'
			),
		},
		propertyKey,
		null
	);

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

	return get( siteTypeProperties, property ) || getSiteTypePropertyDefaults( property );
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
			theme: 'pub/modern-business',
			designType: 'blog',
			siteTitleLabel: i18n.translate( "Tell us your blog's name" ),
			siteTitlePlaceholder: i18n.translate( "E.g., Stevie's blog " ),
			siteTitleSubheader: i18n.translate(
				'This will appear at the top of your blog and can be changed at anytime.'
			),
			siteTopicHeader: i18n.translate( 'What is your blog about?' ),
			siteTopicLabel: i18n.translate( 'What will your blog be about?' ),
			siteTopicSubheader: i18n.translate(
				"We'll add relevant content to your blog to help you get started."
			),
			siteMockupHelpTipCopy: i18n.translate(
				'Scroll down to see your blog. Once you complete setup you’ll be able to customize it further.'
			),
			siteMockupTitleFallback: i18n.translate( 'Your New Blog' ),
			domainsStepHeader: i18n.translate( 'Give your blog an address' ),
			domainsStepSubheader: i18n.translate(
				"Enter your blog's name or some keywords that describe it to get started."
			),
		},
		{
			id: 1, // This value must correspond with its sibling in the /segments API results
			slug: 'business',
			defaultVertical: 'business',
			label: i18n.translate( 'Business' ),
			description: i18n.translate( 'Promote products and services.' ),
			theme: 'pub/modern-business',
			designType: 'page',
			siteTitleLabel: i18n.translate( 'Tell us your business’s name' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., Vail Renovations' ),
			siteTopicHeader: i18n.translate( 'What does your business do?' ),
			siteTopicLabel: i18n.translate( 'What type of business do you have?' ),
			domainsStepSubheader: i18n.translate(
				"Enter your business's name or some keywords that describe it to get started."
			),
			customerType: 'business',
		},
		{
			id: 4, // This value must correspond with its sibling in the /segments API results
			slug: 'professional',
			defaultVertical: 'designer',
			label: i18n.translate( 'Professional' ),
			description: i18n.translate( 'Showcase your portfolio and work.' ),
			theme: 'pub/modern-business',
			designType: 'portfolio',
			siteTitleLabel: i18n.translate( 'What is your name?' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., John Appleseed' ),
			siteTopicHeader: i18n.translate( 'What type of work do you do?' ),
			siteTopicLabel: i18n.translate( 'What type of work do you do?' ),
			siteTopicInputPlaceholder: i18n.translate( 'Enter your job title or choose one from below.' ),
			domainsStepSubheader: i18n.translate(
				'Enter your name or some keywords that describe yourself to get started.'
			),
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
			// TODO: Re-enable "Purchase required" badge, but hide for Jetpack onboarding.
			// purchaseRequired: true,
		},
	];
}
