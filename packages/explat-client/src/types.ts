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

export interface MakeRequest {
	( request: {
		apiNamespace: 'wpcom';
		method: 'GET';
		path: string;
		query: Record< string, string >;
	} ): Promise< any >;
}

export interface GetAnonId {
	(): string;
}

export interface LogError {
	( errorMessage: string ): void;
}
