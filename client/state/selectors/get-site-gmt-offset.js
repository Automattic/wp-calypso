/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/site-settings/init';

/**
 * Returns the site's UTC offset as a number.
 *
 * @param  {object}  state - Global state tree
 * @param  {number}  siteId - Site ID
 * @returns {?number} site UTC offset
 */
export default function getSiteGmtOffset( state, siteId ) {
	const gmt = get( state.siteSettings.items, [ siteId, 'gmt_offset' ], null );
	return gmt ? Number( gmt ) : gmt;
}
