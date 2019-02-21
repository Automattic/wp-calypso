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
