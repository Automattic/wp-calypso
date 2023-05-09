const defaultCompare = ( a: any, b: any ): boolean => a === b;

function uniqueBy< T >( arr: T[], fn: ( a: T, b: T ) => boolean = defaultCompare ): T[] {
	return arr.reduce( ( acc, v ) => {
		if ( ! acc.some( ( x: any ) => fn( v, x ) ) ) {
			acc.push( v );
		}
		return acc;
	}, [] as T[] );
}

export default uniqueBy;
