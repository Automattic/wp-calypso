/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';
import getSiteDomain from './get-site-domain';

/**
 * Returns a title by which the site can be canonically referenced. Uses the
 * site's name if available, falling back to its domain. Returns null if the
 * site is not known.
 *
 * @param  {object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?string}        Site title
 */
export default function getSiteTitle( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	if ( site.name ) {
		return site.name.trim();
	}

	return getSiteDomain( state, siteId );
}
