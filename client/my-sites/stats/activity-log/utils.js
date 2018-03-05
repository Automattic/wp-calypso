/** @format */
/**
 * External dependencies
 */
import { moment as momentLib } from 'i18n-calypso';

/**
 * @typedef OffsetParams
 * @property {?string} timezone  Timezone representation to apply.
 * @property {?string} gmtOffset Offset to apply if timezone isn't supplied.
 * @property {object}  moment    Moment object to which timezone or offset will be applied.
 */

/**
 * Accepts nullable timezone and offset and applies one to the provided moment, preferring the
 * timezone. If neither are provided, return the moment unchanged.
 *
 * @param  {OffsetParams} params Parameters
 * @return {Object}       Moment with timezone applied if provided.
 *                        Moment with gmtOffset applied if no timezone is provided.
 *                        If neither is provided, the original moment is returned.
 */
export function adjustMoment( { timezone, gmtOffset, moment } ) {
	if ( timezone ) {
		return moment.tz( timezone );
	}
	if ( gmtOffset ) {
		return moment.utcOffset( gmtOffset );
	}
	return moment;
}

/**
 * Accepts an object which contains a string date representation and optionally timezone or offset.
 * Returns a moment object which is the result of parsing the string adjusted for the timezone
 * or offset, in that order and if provided.
 *
 * @param  {string}  _.startDate Date string representing start of the month (YYYY-MM-DD).
 * @param  {?string} _.timezone  Timezone representation to apply.
 * @param  {?string} _.gmtOffset Offset to apply if timezone isn't supplied.
 * @return {Object}              Start of period moment, adjusted according to timezone or gmtOffset if provided.
 */
export function getStartMoment( { gmtOffset, startDate, timezone } ) {
	if ( timezone ) {
		if ( ! startDate ) {
			return momentLib().tz( timezone );
		}

		return momentLib.tz( startDate, timezone );
	}

	if ( null !== gmtOffset ) {
		return momentLib
			.utc( startDate )
			.subtract( gmtOffset, 'hours' )
			.utcOffset( gmtOffset );
	}

	return momentLib.utc( startDate );
}

/**
 * Accepts an object which contains a string date representation and optionally timezone or offset.
 * Returns an object which is Activity Log query based on the inputs.
 *
 * @param  {string}  _.startDate Date string representing start of the month (YYYY-MM-DD).
 * @param  {?string} _.timezone  Timezone representation to apply.
 * @param  {?string} _.gmtOffset Offset to apply if timezone isn't supplied.
 * @return {Object}              Start of period moment, adjusted according to timezone or gmtOffset if provided.
 */
export function getActivityLogQuery( { gmtOffset, startDate, timezone } ) {
	const startMoment = getStartMoment( { gmtOffset, startDate, timezone } );
	return {
		dateEnd: startMoment
			.clone()
			.endOf( 'month' )
			.valueOf(),
		dateStart: startMoment
			.clone()
			.startOf( 'month' )
			.valueOf(),
		number: 1000,
	};
}
