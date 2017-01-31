/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the site setting `timezone_string` value from the state-tree
 *
 * @param  {Object}  state - Global state tree
 * @param  {Number}  siteId - Site ID
 * @return {?String} site setting timezone
 */
export default function getSiteTimezoneString( state, siteId ) {
	const timezone = get( state.siteSettings.items, [ siteId, 'timezone_string' ], null );
	return timezone && timezone.length ? timezone : null;
}
