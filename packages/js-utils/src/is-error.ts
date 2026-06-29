const nativeObjectToString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const funcToString = Function.prototype.toString;
const objectCtorString = funcToString.call( Object );
const symToStringTag = Symbol.toStringTag;

/**
 * Reads a value's internal tag while ignoring a spoofed `Symbol.toStringTag`, by
 * temporarily unsetting the symbol before calling `Object.prototype.toString`.
 * Mirrors lodash's `getRawTag` so a value can't masquerade as another type.
 */
const getRawTag = ( value: Record< symbol, unknown > ): string => {
	const isOwn = hasOwnProperty.call( value, symToStringTag );
	const tag = value[ symToStringTag ];
	let unmasked = false;

	try {
		value[ symToStringTag ] = undefined;
		unmasked = true;
	} catch {
		// The value can't be mutated (e.g. frozen); fall back to its current tag.
	}

	const result = nativeObjectToString.call( value );

	if ( unmasked ) {
		if ( isOwn ) {
			value[ symToStringTag ] = tag;
		} else {
			delete value[ symToStringTag ];
		}
	}
	return result;
};

const getTag = ( value: object ): string =>
	symToStringTag in value
		? getRawTag( value as Record< symbol, unknown > )
		: nativeObjectToString.call( value );

// Mirrors lodash's `isPlainObject`, including its constructor-string check so
// cross-realm plain objects (e.g. from another iframe) are still recognized as
// plain rather than mistaken for `Error`-like objects.
const isPlainObject = ( value: object ): boolean => {
	if ( getTag( value ) !== '[object Object]' ) {
		return false;
	}
	const proto = Object.getPrototypeOf( value );
	if ( proto === null ) {
		return true;
	}
	const Ctor = hasOwnProperty.call( proto, 'constructor' ) && proto.constructor;
	return (
		typeof Ctor === 'function' &&
		Ctor instanceof Ctor &&
		funcToString.call( Ctor ) === objectCtorString
	);
};

/**
 * Checks whether a value is an `Error` (or `Error`-like) object, matching
 * lodash's `isError`. Unlike a bare `value instanceof Error`, this also detects
 * `DOMException`s and cross-realm errors (e.g. an `Error` from another iframe),
 * resists a spoofed `Symbol.toStringTag`, and still returns `false` for plain
 * objects.
 * @param value The value to check.
 * @returns `true` if the value is an error, otherwise `false`.
 */
const isError = ( value: unknown ): value is Error => {
	if ( value === null || typeof value !== 'object' ) {
		return false;
	}
	const tag = getTag( value );
	return (
		tag === '[object Error]' ||
		tag === '[object DOMException]' ||
		( typeof ( value as Error ).message === 'string' &&
			typeof ( value as Error ).name === 'string' &&
			! isPlainObject( value ) )
	);
};

export default isError;
