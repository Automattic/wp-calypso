/**
 * Returns true if site is a staging site. and false otherwise.
 *
 * We use the "sites" state property here, as this is fetched early, and before
 * the current site stettings
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}  Whether site is a staging site or not
 */
export default function isStagingSite( state, siteId ) {
	return state?.sites?.items[ siteId ]?.is_wpcom_staging_site ?? false;
}
