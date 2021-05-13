export function shuffleArray< T >( array: Array< T > ): Array< T > {
	const arrayToShuffle = array.slice( 0 );
	// Durstenfeld algorithm https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
	for ( let i = arrayToShuffle.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ arrayToShuffle[ i ], arrayToShuffle[ j ] ] = [ arrayToShuffle[ j ], arrayToShuffle[ i ] ];
	}

	return arrayToShuffle;
}
