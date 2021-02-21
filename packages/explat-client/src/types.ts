// ## The data structures

export interface ExperimentAssignment {
	/**
	 * The name of the experiment assignment
	 */
	experimentName: string;
	/**
	 * The name of the assigned variation,
	 */
	variationName: string | null;
	/**
	 * The timestamp of when this assignment was retrieved.
	 */
	retrievedTimestamp: number;
	/**
	 * Time to live from when it was retrieved, seconds
	 */
	ttl: number;
	/**
	 * A marker for fallback assignments - when we can't retrieve from the server.
	 */
	isFallbackExperimentAssignment?: boolean;
}

// ## Abstracting the outside world

export interface Config {
	fetchExperimentAssignment: ( {
		experimentName,
		anonId,
	}: {
		experimentName: string;
		anonId: string | null;
	} ) => Promise< unknown >;
	getAnonId: () => Promise< string | null >;
	logError: ( error: Record< string, string > & { message: string } ) => void;
	isDevelopmentMode: boolean;
}
