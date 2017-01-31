
/**
 * Internal dependencies
 */
import {
	getSiteGmtOffset,
	getSiteTimezoneString
} from 'state/selectors';

/**
 * Return the site setting `timezone` according to the timezone_string
 * and the gmt_offset setting values.
 *
 * @param  {Object}  state - Global state tree
 * @param  {Number}  siteId - Site ID
 * @return {?String} site setting timezone
 */
export default function getSiteTimezone( state, siteId ) {
	const timezone_string = getSiteTimezoneString( state, siteId );
	if ( timezone_string ) {
		return timezone_string;
	}

	const gmt_offset = getSiteGmtOffset( state, siteId );

	if ( gmt_offset === null ) {
		return null;
	}

	return `UTC${ ( /\-/.test( gmt_offset ) ? '' : '+' ) }${ gmt_offset }`;
}
