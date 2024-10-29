const SESSION_STORAGE_KEY = 'goals-step-seed';

let localSeed: string | null = null;

const getSeed = () => {
	const existingSeed = sessionStorage.getItem( SESSION_STORAGE_KEY ) ?? localSeed;

	if ( existingSeed ) {
		return parseInt( existingSeed, 10 );
	}

	const seed = Math.floor( Math.random() * 100 );

	try {
		sessionStorage.setItem( SESSION_STORAGE_KEY, seed.toString() );
	} catch {
		localSeed = seed.toString();
	}

	return seed;
};

export const shuffleArray = < T >( array: T[] ): T[] => {
	let seed = getSeed();

	const seededRandom = () => {
		const x = Math.sin( ++seed ) * 10000;

		return x - Math.floor( x );
	};

	return array
		.map( ( value ) => ( { value, sort: seededRandom() } ) )
		.sort( ( a, b ) => a.sort - b.sort )
		.map( ( { value } ) => value );
};
