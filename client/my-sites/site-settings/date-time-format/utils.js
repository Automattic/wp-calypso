/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import { startsWith } from 'lodash';

/**
 * Adjust the current date and time to the site settings timezone.
 * The timezone can be formatted either as an UTC offset ("UTC+0"),
 * or as a timezone identifier ("Europe/London").
 * In the first case, the date-time must be adjusted by the UTC offset converted in minutes;
 * in the latter, it's enough to use the tz() method provided by Moment.js.
 *
 * @see http://momentjs.com/docs/#/manipulating/utc-offset/
 * @see http://momentjs.com/timezone/docs/#/using-timezones/parsing-in-zone/
 *
 * @param {string} timezoneString A timezone string.
 * @return {Object} The timezone-adjusted Moment.js object of the current date and time.
 */
export function getLocalizedDate( timezoneString ) {
	return startsWith( timezoneString, 'UTC' )
		? moment().utcOffset( timezoneString.substring( 3 ) * 60 ) // E.g. "UTC+5" -> "+5" * 60 -> 300
		: moment.tz( timezoneString );
}
