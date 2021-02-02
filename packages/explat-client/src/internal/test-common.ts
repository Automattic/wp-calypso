export const validExperimentAssignment = {
	experimentName: 'experiment_name_a',
	variationName: 'treatment',
	retrievedTimestamp: Date.now(),
	ttl: 60,
};

export const validFallbackExperimentAssignment = {
	experimentName: 'experiment_name_b',
	variationName: null,
	retrievedTimestamp: Date.now(),
	ttl: 60,
	isFallbackExperimentAssignment: true,
};

export const delayedValue = < T >( value: T, delayMilliseconds: number ): Promise< T > =>
	new Promise( ( res ) => setTimeout( () => res( value ), delayMilliseconds ) );
