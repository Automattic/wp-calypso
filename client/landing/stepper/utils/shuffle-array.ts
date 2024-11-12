class SeedManager {
	private localSeed: string | null = null;
	static SESSION_STORAGE_KEY = 'goals-step-seed';

	/**
	 * Clears the cached seed. DO NOT USE - only for testing purposes.
	 * @internal
	 */
	clearSeed() {
		this.localSeed = null;
		sessionStorage.removeItem( SeedManager.SESSION_STORAGE_KEY );
	}

	getSeed(): number {
		const existingSeed =
			this.localSeed ?? sessionStorage.getItem( SeedManager.SESSION_STORAGE_KEY );

		if ( existingSeed ) {
			return parseInt( existingSeed, 10 );
		}

		const seed = Math.floor( Math.random() * 100 );

		try {
			sessionStorage.setItem( SeedManager.SESSION_STORAGE_KEY, seed.toString() );
		} catch {
		} finally {
			this.localSeed = seed.toString();
		}

		return seed;
	}
}

/**
 * A singleton instance of the SeedManager. This is only exported for testing purposes.
 * @internal
 */
export const seedManager = new SeedManager();

export const shuffleArray = < T >( array: T[] ): T[] => {
	let value = seedManager.getSeed();

	const seededRandom = () => {
		value = ( value * 9301 + 49297 ) % 233280;
		return value / 233280;
	};

	return array
		.map( ( value ) => ( { value, sort: seededRandom() } ) )
		.sort( ( a, b ) => a.sort - b.sort )
		.map( ( { value } ) => value );
};
