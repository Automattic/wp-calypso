
module.exports = {
	// action types
	RECEIVE_TOTAL_POST_VIEWS: 'RECEIVE_TOTAL_POST_VIEWS',

	// Cooldown period between server requests: 30 seconds
	API_CALL_LIMIT_MS: 30000,

	// How long the value in localStorage is "not stale": 5 minutes
	TTL_IN_SECONDS: 300,

	// How variable should the TTL be: +/- 30 seconds
	TTL_FUZZ_IN_SECONDS: 60
};
