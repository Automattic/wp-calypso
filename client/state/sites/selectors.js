/** @ssr-ready **/

/**
 * External dependencies
 */
import map from 'lodash/map';
import filter from 'lodash/filter';
import some from 'lodash/some';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns a site object by its ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site object
 */
export function getSite( state, siteId ) {
	return state.sites.items[ siteId ] || null;
}

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 *
 * @param  {Object}   state Global state tree
 * @return {Number[]}       WordPress.com site IDs with collisions
 */
export const getSiteCollisions = createSelector(
	( state ) => {
		return map( filter( state.sites.items, ( wpcomSite ) => {
			const wpcomSiteUrlSansProtocol = wpcomSite.URL.replace( /^https?:\/\//, '' );
			return ! wpcomSite.jetpack && some( state.sites.items, ( jetpackSite ) => {
				return (
					jetpackSite.jetpack &&
					wpcomSiteUrlSansProtocol === jetpackSite.URL.replace( /^https?:\/\//, '' )
				);
			} );
		} ), 'ID' );
	},
	( state ) => state.sites.items
);

/**
 * Returns true if a collision exists for the specified WordPress.com site ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether collision exists
 */
export function isSiteConflicting( state, siteId ) {
	return includes( getSiteCollisions( state ), siteId );
}

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is a Jetpack site
 */
export function isJetpackSite( state, siteId ) {
	const site = getSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return site.jetpack;
}

/**
 * Returns the slug for a site, or null if the site is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        Site slug
 */
export function getSiteSlug( state, siteId ) {
	const site = getSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	if ( ( site.options && site.options.is_redirect ) || isSiteConflicting( state, siteId ) ) {
		return site.options.unmapped_url.replace( /^https?:\/\//, '' );
	}

	return site.URL.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
}

/**
 * Returns true if we are requesting all sites.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export function isRequestingSites( state ) {
	return !! state.sites.fetchingItems.all;
}

/**
 * Returns true if an url is already in the current site list
 * @param {Object}	state Global state tree
 * @return {Boolean}
 */
export function isUrlInSites( state, url ) {
	for ( let siteId in state.sites.items ) {
		const site = state.sites.items[ siteId ];
		const siteUrlSansProtocol = site.URL.replace( /^https?:\/\//, '' );
		const urlSansProtocol = url.replace( /^https?:\/\//, '' );
		if ( siteUrlSansProtocol === urlSansProtocol ) {
			return true;
		}
	}
	return false;
}
