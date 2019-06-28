/** @format **/
/**
 * Exernal dependencies
 */
import i18n from 'i18n-calypso';
import { find, invert } from 'lodash';

/**
 * Internal dependencies
 */

const CONTEXT_WPCOM = 'CONTEXT_WPCOM';
const CONTEXT_JETPACK = 'CONTEXT_JETPACK';
const SITE_TYPE_BUSINESS = 'business';
const SITE_TYPE_BLOG = 'blog';
const SITE_TYPE_STORE = 'online-store';
const SITE_TYPE_PROFESSIONAL = 'professional';

// These ids _must_ correspond with their siblings in the /segments API results.
const siteTypeIds = {
	[ SITE_TYPE_BUSINESS ]: 1,
	[ SITE_TYPE_BLOG ]: 2,
	[ SITE_TYPE_STORE ]: 3,
	[ SITE_TYPE_PROFESSIONAL ]: 4,
};

export const getSiteTypeSlug = id => invert( siteTypeIds )[ id ] || null;

export const getSiteTypeId = slug => siteTypeIds[ slug ] || null;

const siteTypePropDefaults = {
	// Attributes.
	defaultVertical: 'business',
	label: '',
	description: '',
	theme: 'pub/modern-business',
	designType: '',
	customerType: null,
	purchaseRequired: false,
	// General copy.
	siteMockupHelpTipCopy: i18n.translate(
		"Scroll down to see how your site will look. You can customize it with your own text and photos when we're done with the setup basics."
	),
	siteMockupHelpTipCopyBottom: i18n.translate( 'Scroll back up to continue.' ),
	siteMockupTitleFallback: i18n.translate( 'Your New Website' ),
	// Site title step.
	siteTitleLabel: i18n.translate( 'Give your site a name' ),
	siteTitleSubheader: i18n.translate(
		'This will appear at the top of your site and can be changed at anytime.'
	),
	siteTitlePlaceholder: i18n.translate( 'default siteTitlePlaceholder' ),
	// Site topic step.
	siteTopicHeader: i18n.translate( 'What is your site about?' ),
	siteTopicLabel: i18n.translate( 'What is your site about?' ),
	siteTopicSubheader: i18n.translate(
		"We'll add relevant content to your site to help you get started."
	),
	siteTopicInputPlaceholder: i18n.translate( 'Enter a topic or choose one from below.' ),
	// Domains step.
	domainsStepHeader: i18n.translate( 'Give your site an address' ),
	domainsStepSubheader: i18n.translate(
		'Enter a keyword that describes your site to get started.'
	),
};

const createSiteType = ( slug, properties ) => {
	const id = getSiteTypeId( slug );
	return Object.assign( {}, siteTypePropDefaults, properties, { slug, id } );
};

/**
 * Returns a current list of site types that are displayed in the signup site-type step
 * Some (or all) of these site types will also have landing pages.
 * A user who comes in via a landing page will not see the Site Topic dropdown.
 * Do note that id's per site type should not be changed as we add/remove site-types.
 *
 * Please don't modify the IDs for now until we can integrate the /segments API into Calypso.
 *
 * @param {string} context of `CONTEXT_WPCOM` or `CONTEXT_JETPACK`
 * @return {array} current list of site types
 */
function getAllSiteTypes( context ) {
	return [
		createSiteType( SITE_TYPE_BLOG, {
			defaultVertical: 'blogging', // used to conduct a vertical search and grab a default vertical for the segment
			label: i18n.translate( 'Blog' ),
			description: i18n.translate( 'Share and discuss ideas, updates, or creations.' ),
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
		} ),
		createSiteType( SITE_TYPE_BUSINESS, {
			label: i18n.translate( 'Business' ),
			description: i18n.translate( 'Promote products and services.' ),
			designType: 'page',
			siteTitleLabel: i18n.translate( 'Tell us your business’s name' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., Vail Renovations' ),
			siteTopicHeader: i18n.translate( 'What does your business do?' ),
			siteTopicLabel: i18n.translate( 'What type of business do you have?' ),
			domainsStepSubheader: i18n.translate(
				"Enter your business's name or some keywords that describe it to get started."
			),
			customerType: 'business',
		} ),
		createSiteType( SITE_TYPE_PROFESSIONAL, {
			defaultVertical: 'designer',
			label: i18n.translate( 'Professional' ),
			description: i18n.translate( 'Showcase your portfolio and work.' ),
			designType: 'portfolio',
			siteTitleLabel: i18n.translate( 'What is your name?' ),
			siteTitlePlaceholder: i18n.translate( 'E.g., John Appleseed' ),
			siteTopicHeader: i18n.translate( 'What type of work do you do?' ),
			siteTopicLabel: i18n.translate( 'What type of work do you do?' ),
			siteTopicInputPlaceholder: i18n.translate( 'Enter your job title or choose one from below.' ),
			domainsStepSubheader: i18n.translate(
				'Enter your name or some keywords that describe yourself to get started.'
			),
		} ),
		createSiteType( SITE_TYPE_STORE, {
			label: i18n.translate( 'Online store' ),
			description: i18n.translate( 'Sell your collection of products online.' ),
			theme: 'pub/dara',
			designType: 'store',
			siteTitleLabel: i18n.translate( 'What is the name of your store?' ),
			siteTitlePlaceholder: i18n.translate( "E.g., Mel's Diner" ),
			siteTopicHeader: i18n.translate( 'What type of products do you sell?' ),
			siteTopicLabel: i18n.translate( 'What type of products do you sell?' ),
			customerType: 'business',
			purchaseRequired: context === CONTEXT_WPCOM,
		} ),
	];
}

/**
 * Returns site types configuration used for WordPress.com signup
 *
 * @return {array} List of WordPress.com site types
 */
export const getWpcomSiteTypes = () => getAllSiteTypes( CONTEXT_WPCOM );

/**
 * Returns site types configuration used for Jetpack onboarding
 *
 * @return {array} List of Jetpack site types
 */
export const getJetpackSiteTypes = () => getAllSiteTypes( CONTEXT_JETPACK );

const getSiteTypeProp = ( siteTypes, slug, prop ) => {
	const siteType = find( siteTypes, { slug } ) || {};
	return siteType[ prop ];
};

export const getWpcomSiteTypeProp = ( slug, prop ) =>
	getSiteTypeProp( getWpcomSiteTypes(), slug, prop );

export const getJetpackSiteTypeProp = ( slug, prop ) =>
	getSiteTypeProp( getJetpackSiteTypes(), slug, prop );
