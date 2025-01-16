export function circularReferenceSafeJSONStringify( json, space ) {
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
}
