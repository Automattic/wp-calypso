import getSiteOption from './get-site-option';

/**
 * Returns true if the site is a Jetpack site with the specified module active,
 * or false if the module is not active. Returns null if the site is not known
 * or is not a Jetpack site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @param  {string}   slug   Module slug
 * @returns {?boolean}        Whether site has Jetpack module active
 */
export default function isJetpackModuleActive( state, siteId, slug ) {
	const modules = getSiteOption( state, siteId, 'active_modules' );
	return modules?.includes( slug ) ?? null;
}
