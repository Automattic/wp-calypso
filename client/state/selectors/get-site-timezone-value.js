/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/site-settings/init';

/**
 * Returns the site's timezone value, in the format of 'America/Araguaina.'
 * See also: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @param  {object}  state - Global state tree
 * @param  {number}  siteId - Site ID
 * @returns {?string} site setting timezone
 */
export default function getSiteTimezoneValue( state, siteId ) {
	const timezone = get( state.siteSettings.items, [ siteId, 'timezone_string' ], null );
	return timezone && timezone.length ? timezone : null;
}
