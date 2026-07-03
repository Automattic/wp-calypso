import isSymbol from './is-symbol';

// Property-path parsing. A string is tokenized into path segments (dot,
// bracket, and quoted-bracket notation), except a string that is a literal key
// of the object is used whole rather than split — path casting is
// object-dependent. Internal helper; not part of the public API.
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName =
	/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;

const isKey = ( value: unknown, object: unknown ): boolean => {
	if ( Array.isArray( value ) ) {
		return false;
	}
	const type = typeof value;
	if ( type === 'number' || type === 'boolean' || value == null || isSymbol( value ) ) {
		return true;
	}
	return (
		reIsPlainProp.test( value as string ) ||
		! reIsDeepProp.test( value as string ) ||
		( object != null && ( value as string ) in Object( object ) )
	);
};

const stringToPath = ( string: string ): string[] => {
	const result: string[] = [];
	if ( string.charCodeAt( 0 ) === 46 /* . */ ) {
		result.push( '' );
	}
	string.replace( rePropName, ( match, number, quote, substring ) => {
		result.push( quote ? substring.replace( reEscapeChar, '$1' ) : number || match );
		return match;
	} );
	return result;
};

/**
 * Casts `value` to a property-path array, resolving a string against `object`
 * (an existing literal key is used whole).
 */
const castPath = (
	value: PropertyKey | readonly PropertyKey[],
	object: unknown
): readonly PropertyKey[] => {
	if ( Array.isArray( value ) ) {
		return value;
	}
	// Narrowing: `Array.isArray` does not exclude a readonly array, so cast.
	const key = value as PropertyKey;
	return isKey( key, object ) ? [ key ] : stringToPath( String( key ) );
};

export default castPath;
