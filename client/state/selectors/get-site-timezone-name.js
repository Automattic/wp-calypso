/**
 * Internal dependencies
 */

import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';

import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';

/**
 * Returns either the site's timezone name (eg 'America/Araguaina').
 * if defined, or site's UTC offset ( eg 'UTC-3' ) in that order of preference.
 *
 * @param  {object}  state - Global state tree
 * @param  {number}  siteId - Site ID
 * @returns {?string} site setting timezone
 */
export default function getSiteTimezoneName( state, siteId ) {
	const timezone_string = getSiteTimezoneValue( state, siteId );
	if ( timezone_string ) {
		return timezone_string;
	}

	const gmt_offset = getSiteGmtOffset( state, siteId );

	if ( gmt_offset === null ) {
		return null;
	}

	return `UTC${ /\-/.test( gmt_offset ) ? '' : '+'}${ gmt_offset }`;
}
