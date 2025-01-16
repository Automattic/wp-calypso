export function circularReferenceSafeJSONStringify( json, space ) {
	function removeCircularRefs( input ) {
		let i = 0;

		return function ( key, value ) {
			if ( i !== 0 && typeof input === 'object' && typeof value === 'object' && input === value ) {
				return '[Circular reference]';
			}

			++i;

			return value;
		};
	}
	return JSON.stringify( json, removeCircularRefs( json ), space );
}
