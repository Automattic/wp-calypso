// lodash's largest finite number; ±Infinity coerce to this in `toFinite`.
const MAX_INTEGER = 1.7976931348623157e308;

/**
 * Whether a value is a symbol, including boxed symbols (`Object( Symbol() )`).
 * Uses the object tag so the check is realm-safe, matching lodash `isSymbol`.
 */
const isSymbol = ( value: unknown ): boolean =>
	typeof value === 'symbol' ||
	( typeof value === 'object' &&
		value !== null &&
		Object.prototype.toString.call( value ) === '[object Symbol]' );

/**
 * Coerces a value to a number, matching lodash `toNumber`. Notably, the
 * primitive of an object is derived from `valueOf` only — if `valueOf` returns
 * another object, that result is stringified (rather than falling back to the
 * original object's `toString`, as native `Number` would). Symbols become `NaN`.
 */
const toNumber = ( value: unknown ): number => {
	if ( typeof value === 'number' ) {
		return value;
	}
	if ( isSymbol( value ) ) {
		return NaN;
	}

	let primitive: unknown = value;
	if ( value !== null && typeof value === 'object' ) {
		const valueOf = ( value as { valueOf?: () => unknown } ).valueOf;
		const other = typeof valueOf === 'function' ? valueOf.call( value ) : value;
		primitive = other !== null && typeof other === 'object' ? `${ other }` : other;
	}

	return Number( primitive );
};

/**
 * Coerces a value to a finite number, matching lodash `toFinite`: numeric
 * strings (including binary/octal/hex) are parsed, `±Infinity` clamp to
 * `±MAX_INTEGER`, and everything non-numeric (symbols, objects, `NaN`, etc.)
 * becomes `0` — never throwing. Internal helper; not part of the public API.
 */
const toFinite = ( value: unknown ): number => {
	const number = toNumber( value );

	if ( number === Infinity || number === -Infinity ) {
		return ( number < 0 ? -1 : 1 ) * MAX_INTEGER;
	}

	return Number.isNaN( number ) ? 0 : number;
};

export default toFinite;
