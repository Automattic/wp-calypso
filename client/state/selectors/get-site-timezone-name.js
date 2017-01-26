
/**
 * Internal dependencies
 */
import {
	getSiteGmtOffset,
	getSiteTimezoneValue
} from 'state/selectors';

/**
 * Returns either the site's timezone name (eg 'America/Araguaina').
 * if defined, or site's UTC offset ( eg 'UTC-3' ) in that order of preference.
 *
 * @param  {Object}  state - Global state tree
 * @param  {Number}  siteId - Site ID
 * @return {?String} site setting timezone
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

	return `UTC${ ( /\-/.test( gmt_offset ) ? '' : '+' ) }${ gmt_offset }`;
}
