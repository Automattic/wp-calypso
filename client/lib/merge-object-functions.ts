export const mergeObjectFunctions = < T extends Record< string, ( ...args: any[] ) => void > >(
	left: T,
	right: T
): T => {
	const newObj: Record< string, ( ...args: any[] ) => void > = {};

	const allKeys = [ ...new Set( [ ...Object.keys( left ), ...Object.keys( right ) ] ) ];

	allKeys.forEach( ( key ) => {
		newObj[ key ] = ( ...args: any[] ) => {
			left[ key ]?.( ...args );
			right[ key ]?.( ...args );
		};
	} );

	return newObj as T;
};
