export const uniqueBy = ( arr, fn ) =>
	arr.reduce( ( acc, v ) => {
		if ( ! acc.some( ( x ) => fn( v, x ) ) ) acc.push( v );
		return acc;
	}, [] );
