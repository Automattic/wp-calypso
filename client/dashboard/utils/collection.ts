const randomInt = ( lower: number, upper: number ): number =>
	Math.floor( Math.random() * ( upper - lower + 1 ) );

export function shuffleArray( collection: string[] ) {
	const newArray = collection;
	let pointer = -1;
	collection.forEach( () => {
		const randomPointer = randomInt( ++pointer, collection.length );
		const valueAtRandomPointer = newArray[ randomPointer ];
		newArray[ randomPointer ] = newArray[ pointer ];
		newArray[ pointer ] = valueAtRandomPointer;
	} );
	return newArray;
}
