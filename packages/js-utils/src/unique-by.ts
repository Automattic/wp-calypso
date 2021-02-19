const defaultCompare = ( a: any, b: any ): boolean => a === b;

function uniqueBy( arr: any[], fn = defaultCompare ) {
	return arr.reduce( ( acc, v ) => {
		if ( ! acc.some( ( x: any ) => fn( v, x ) ) ) acc.push( v );
		return acc;
	}, [] );
}

export default uniqueBy;
