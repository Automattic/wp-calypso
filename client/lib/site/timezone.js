/**
 * External dependencies
 */
import moment, { MomentInput, Moment } from 'moment-timezone';

/**
 * @typedef OffsetParams
 * @property {?string} timezone  Timezone representation to apply.
 * @property {?string|number} gmtOffset Offset to apply if timezone isn't supplied.
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
export function applySiteOffset( input, { timezone, gmtOffset } ) {
	if ( timezone ) {
		return moment.tz( input, timezone );
	}
	if ( gmtOffset ) {
		return moment( input ).utcOffset( gmtOffset );
	}
	return moment( input );
}
