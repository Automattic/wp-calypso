const times = < T >( n: number, iteratee: ( index: number ) => T ): T[] =>
	Array.from( { length: n }, ( _, index ) => iteratee( index ) );

export default times;
