/**
 * Convert a string or number to valid reader ID
 *
 * @export
 * @param {string|number} val The value to convert
 * @returns {number|undefined} A valid ID or undefined if we could not convert val
 */
export function toValidId( val ) {
	const valType = typeof val;
	if ( valType === 'string' && /^\d+$/.test( val ) ) {
		const v = Number( val );
		return v === 0 ? undefined : v;
	}
	if ( valType === 'number' ) {
		if ( val === 0 || isNaN( val ) || ! isFinite( val ) || val !== Math.floor( val ) ) {
			return undefined;
		}
		return val;
	}
	return undefined;
}
