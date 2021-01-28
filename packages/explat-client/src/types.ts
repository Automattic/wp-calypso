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
}

// ## Abstracting the outside world

export interface FetchExperimentAssignment {
	( { experimentName, anonId }: { experimentName: string; anonId?: string } ): Promise< unknown >;
}

export interface GetAnonId {
	(): Promise< string | null >;
}

export interface LogError {
	( errorMessage: string ): void;
}

export interface Config {
	fetchExperimentAssignment: FetchExperimentAssignment;
	getAnonId: GetAnonId;
	logError: LogError;
	isDevelopmentMode: boolean;
}
