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
