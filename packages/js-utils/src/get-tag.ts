const nativeObjectToString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const symToStringTag = Symbol.toStringTag;

/**
 * Reads a value's internal tag while ignoring a spoofed `Symbol.toStringTag`, by
 * temporarily unsetting the symbol before calling `Object.prototype.toString`,
 * so a value can't masquerade as another type.
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

/**
 * Returns a value's `Object.prototype.toString` tag (e.g. `'[object Map]'`),
 * resisting a spoofed `Symbol.toStringTag` so an object can't masquerade as
 * another built-in type. `Object()` boxing keeps the `in` check safe for
 * primitives.
 * @param value The value to read the tag of.
 * @returns The internal `[object …]` tag string.
 */
const getTag = ( value: unknown ): string =>
	symToStringTag in Object( value )
		? getRawTag( value as Record< symbol, unknown > )
		: nativeObjectToString.call( value );

export default getTag;
