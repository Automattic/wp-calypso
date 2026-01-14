const randomInt = ( lower: number, upper: number ): number =>
	Math.floor( Math.random() * ( upper - lower + 1 ) );

export function shuffleArray< T >( collection: readonly T[] ): T[] {
	let pointer = -1;
	const newArray = [ ...collection ];
	collection.forEach( () => {
		const randomPointer = randomInt( ++pointer, collection.length - 1 );
		const valueAtRandomPointer = newArray[ randomPointer ];
		newArray[ randomPointer ] = newArray[ pointer ];
		newArray[ pointer ] = valueAtRandomPointer;
	} );
	return newArray;
}

export function mostCommonValueInArray< T >( arr: T[] ): T | undefined {
	const map = new Map< T, number >();

	for ( const value of arr ) {
		map.set( value, ( map.get( value ) ?? 0 ) + 1 );
	}

	let result: T | undefined = undefined;
	let max = 0;

	for ( const [ value, count ] of map ) {
		if ( count > max ) {
			max = count;
			result = value;
		}
	}

	return result;
}
