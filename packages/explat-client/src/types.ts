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

import type { IdentityAttribute } from './sdk/types';

export interface FeatureAssignmentBeacon {
	flag_key: string;
	experiment_id: number;
	experiment_variation_id: number;
	hash_attribute: IdentityAttribute;
	hash_value: string;
}

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
	/**
	 * Fetch the public static `/flags` payload. Optional — host wrappers that
	 * predate `getFeatureValue` can omit this and `getFeatureValue` will return
	 * the caller-provided default for every flag.
	 */
	fetchFlagPayload?: () => Promise< unknown >;
	/**
	 * Beacon `POST /assignments/log` for an experiment-rule match. Optional for
	 * the same reason as `fetchFlagPayload`.
	 */
	logFeatureAssignment?: ( body: FeatureAssignmentBeacon ) => Promise< void >;
	/**
	 * Locally-derived attributes (country, language, identity slots, …) used to
	 * evaluate flags. Overlaid by `window.__EXPLAT_RUNTIME__.attributes` when
	 * the private runtime bootstrap is present.
	 */
	getAttributes?: () => Promise< Record< string, string > >;
}
