/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the site's timezone value, in the format of 'America/Araguaina.'
 * See also: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @param  {Object}  state - Global state tree
 * @param  {Number}  siteId - Site ID
 * @return {?String} site setting timezone
 */
export default function getSiteTimezoneValue( state, siteId ) {
	const timezone = get( state.siteSettings.items, [ siteId, 'timezone_string' ], null );
	return timezone && timezone.length ? timezone : null;
}
