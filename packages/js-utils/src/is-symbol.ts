/**
 * Whether a value is a symbol, including boxed symbols (`Object( Symbol() )`).
 * Uses the object tag so the check is realm-safe.
 * Internal helper; not part of the public API.
 */
const isSymbol = ( value: unknown ): boolean =>
	typeof value === 'symbol' ||
	( typeof value === 'object' &&
		value !== null &&
		Object.prototype.toString.call( value ) === '[object Symbol]' );

export default isSymbol;
