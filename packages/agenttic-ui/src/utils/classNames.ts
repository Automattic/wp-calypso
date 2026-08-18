/**
 * Utility for combining class names, similar to clsx
 * Supports strings, objects, arrays, and conditional classes
 * @param {...any} inputs
 */
export function cn( ...inputs: ClassValue[] ): string {
	return inputs
		.flat()
		.filter( Boolean )
		.map( ( input ) => {
			if ( typeof input === 'string' ) {
				return input;
			}
			if (
				typeof input === 'object' &&
				! Array.isArray( input ) &&
				input !== null
			) {
				return Object.entries( input )
					.filter( ( [ _, value ] ) => value )
					.map( ( [ key ] ) => key )
					.join( ' ' );
			}
			return '';
		} )
		.join( ' ' )
		.trim();
}

type ClassValue =
	| string
	| number
	| null
	| undefined
	| ClassValue[]
	| { [ key: string ]: boolean | null | undefined };
