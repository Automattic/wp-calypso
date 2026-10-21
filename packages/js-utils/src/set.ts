import castPath from './to-path';

const MAX_SAFE_INTEGER = 9007199254740991;
const reIsUint = /^(?:0|[1-9]\d*)$/;

const hasOwn = Object.prototype.hasOwnProperty;

const isObject = ( value: unknown ): boolean =>
	value != null && ( typeof value === 'object' || typeof value === 'function' );

// SameValueZero: like `===` but treats `NaN` as equal to `NaN`.
const eq = ( value: unknown, other: unknown ): boolean =>
	value === other || ( Number.isNaN( value as number ) && Number.isNaN( other as number ) );

// Assigns only when the value actually changes, so setters/proxy traps aren't
// triggered for same-value writes.
const assignValue = (
	object: Record< PropertyKey, unknown >,
	key: PropertyKey,
	value: unknown
): void => {
	const objValue = object[ key ];
	if (
		! ( hasOwn.call( object, key ) && eq( objValue, value ) ) ||
		( value === undefined && ! ( key in object ) )
	) {
		object[ key ] = value;
	}
};

// Whether a path segment is a valid array index (so the intermediate container
// created for it should be an array rather than a plain object).
const isIndex = ( value: PropertyKey ): boolean => {
	const type = typeof value;
	if ( type !== 'number' && ( type === 'symbol' || ! reIsUint.test( value as string ) ) ) {
		return false;
	}
	const number = Number( value );
	return number > -1 && number % 1 === 0 && number < MAX_SAFE_INTEGER;
};

// Converts a path segment to a property key, preserving symbols and mapping
// negative zero to `'-0'`.
const toKey = ( value: PropertyKey ): PropertyKey => {
	if ( typeof value === 'string' || typeof value === 'symbol' ) {
		return value;
	}
	return Object.is( value, -0 ) ? '-0' : String( value );
};

/**
 * Sets the value at `path` of `object`, creating missing intermediate
 * containers (arrays for index-like segments, objects otherwise).
 * `object` is mutated and returned; a non-object `object` is
 * returned unchanged. Assignments to `__proto__`/`constructor`/`prototype` keys
 * are skipped to avoid prototype pollution.
 * @param object The object to modify.
 * @param path   The property path (string with dot/bracket notation, or array of segments).
 * @param value  The value to set.
 * @returns `object`.
 */
const set = < T >( object: T, path: PropertyKey | readonly PropertyKey[], value: unknown ): T => {
	if ( ! isObject( object ) ) {
		return object;
	}

	const segments = castPath( path, object );
	const lastIndex = segments.length - 1;
	let nested = object as Record< PropertyKey, unknown >;

	for ( let index = 0; index <= lastIndex && nested != null; index++ ) {
		const key = toKey( segments[ index ] );
		if ( key === '__proto__' || key === 'constructor' || key === 'prototype' ) {
			return object;
		}

		if ( index === lastIndex ) {
			assignValue( nested, key, value );
		} else {
			let newValue = nested[ key ];
			if ( ! isObject( newValue ) ) {
				newValue = isIndex( segments[ index + 1 ] ) ? [] : {};
			}
			assignValue( nested, key, newValue );
		}

		nested = nested[ key ] as Record< PropertyKey, unknown >;
	}

	return object;
};

export default set;
