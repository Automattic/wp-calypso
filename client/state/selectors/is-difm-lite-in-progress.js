import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if site is marked as a DIFM In Progress site, false if the site is a regular site,
 * or null if the site is unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site is marked as a DIFM In Progress site
 */
export default function isDIFMLiteInProgress( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}

	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return site.options?.is_difm_lite_in_progress ?? false;
}
