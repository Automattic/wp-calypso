/**
 * Checks if the provided value is a plain object.
 *
 * Plain objects are objects that are either:
 * - created by the `Object` constructor, or
 * - with a `[[Prototype]]` of `null`.
 *
 * @param {*} value Value to check.
 * @returns {boolean} True when value is considered a plain object.
 */
export default function isPlainObject( value: unknown ) {
	if ( typeof value !== 'object' || value === null ) {
		return false;
	}

	if ( Object.getPrototypeOf( value ) === null ) {
		return true;
	}

	return (
		value.constructor === Object && Object.prototype.toString.call( value ) === '[object Object]'
	);
}
