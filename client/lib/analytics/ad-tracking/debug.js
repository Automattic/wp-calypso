export function circularReferenceSafeJSONStringify( json, space ) {
	try {
		let cache = [];
		const str = JSON.stringify(
			json,
			function ( key, value ) {
				if ( typeof value === 'object' && value !== null ) {
					if ( cache.indexOf( value ) !== -1 ) {
						return 'Circular reference';
					}
					cache.push( value );
				}
				return value;
			},
			space
		);
		cache = null;
		return str;
	} catch ( e ) {
		return 'Error: ' + e.message;
	}
}
