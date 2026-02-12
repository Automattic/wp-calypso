export const omit = < T extends object, K extends [ ...( keyof T )[] ] >(
	obj: T,
	keys: K
): {
	[ K2 in Exclude< keyof T, K[ number ] > ]: T[ K2 ];
} => {
	const ret = {} as {
		[ K in keyof typeof obj ]: ( typeof obj )[ K ];
	};
	let key: keyof typeof obj;
	for ( key in obj ) {
		if ( ! keys.includes( key ) ) {
			ret[ key ] = obj[ key ];
		}
	}
	return ret;
};
