/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the site setting `gmt_offset` value from the state-tree
 *
 * @param  {Object}  state - Global state tree
 * @param  {Number}  siteId - Site ID
 * @return {?String} site setting timezone
 */
export default function getSiteGmtOffset( state, siteId ) {
	const gmt = get( state.siteSettings.items, [ siteId, 'gmt_offset' ], null );
	return gmt ? Number( gmt ) : gmt;
}
