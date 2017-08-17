export function deterministicStringify( source ) {
	if ( source === null ) {
		return 'null';
	}

	// Handle primitive data types:
	// boolean, number, string, undefined
	if ( typeof source !== 'object' ) {
		if ( typeof source === 'undefined' ) {
			return 'undefined';
		}

		if ( typeof source === 'string' ) {
			return `'${ source.toString() }'`;
		}

		return source.toString();
	}

	// arrays are objects too so we have to
	// manually ask if this is _also_ an array
	if ( Array.isArray( source ) ) {
		return source
			.sort()
			.map( deterministicStringify )
			.join( ',' );
	}

	// else return stringified object with
	// keys in alphabetical order
	return Object
		.keys( source )
		.sort()
		.map( key => `${ key }=${ deterministicStringify( source[ key ] ) }` )
		.join( '&' );
}

export default deterministicStringify;
