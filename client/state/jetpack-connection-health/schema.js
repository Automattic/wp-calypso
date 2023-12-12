export const requestError = {
	type: [ 'string', 'null' ],
};

export const isLoading = {
	type: 'boolean',
};

export const lastRequestTime = {
	type: 'number',
};

export const connectionHealth = {
	type: 'object',
	properties: {
		is_healthy: {
			type: 'boolean',
		},
		jetpack_connection_problem: {
			type: 'boolean',
		},
		error: {
			type: 'string',
		},
	},
};
export const jetpacConnectionHealth = {
	type: 'object',
	properties: {
		connectionHealth,
		requestError,
		isLoading,
		lastRequestTime,
	},
};

export const schema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': jetpacConnectionHealth,
	},
};
