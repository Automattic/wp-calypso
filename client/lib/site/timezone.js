/**
 * External dependencies
 */
import moment, { MomentInput, Moment } from 'moment-timezone';

/**
 * A collection of parameters for applying a site's timezone or UTC offset to
 * a given MomentInput.
 *
 * @typedef OffsetParams
 * @property {string|null} [timezone] Timezone representation to apply.
 * @property {string|number|null} [gmtOffset] Offset to apply if timezone isn't supplied.
 * @property {boolean} [keepLocalTime=false]
 * 		If false (default), apply timezone or gmtOffset to the input without
 * 		modifying the underlying Unix-epoch timestamp, shifting the
 * 		human-readable representation by the appropriate amount; if true,
 * 		apply timezone or gmtOffset to shift the underlying timestamp,
 * 		but keep the human-readable representation the same.
 *
 * 		Example: Applying UTC-6 to 2020-01-01T00:00:00+0000
 * 		- { keepLocalTime: false }	-> 2019-12-31T18:00:00-0600
 * 		- { keepLocalTime: true }	-> 2020-01-01T00:00:00-0600
 */

/**
 * Accepts (optional) timezone and offset and applies one to the provided date, preferring the
 * timezone. If neither are provided, creates a default moment.js object in local timezone.
 *
 * @param  {MomentInput}  input Valid input for moment (string, timestamp, moment.js object)
 *                        to which timezone or offset will be applied.
 * @param  {OffsetParams} params Parameters
 * @returns {Moment}       Moment with timezone applied if provided.
 *                        Moment with gmtOffset applied if no timezone is provided.
 *                        If neither is provided, the original moment is returned.
 */
export function applySiteOffset( input, { timezone, gmtOffset, keepLocalTime = false } ) {
	if ( timezone ) {
		return moment( input ).tz( timezone, keepLocalTime );
	}
	if ( gmtOffset || gmtOffset === 0 ) {
		return moment( input ).utcOffset( gmtOffset, keepLocalTime );
	}
	return moment( input );
}
