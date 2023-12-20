export const requestError = {
	type: [ 'string', 'null' ],
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
export const jetpackConnectionHealth = {
	type: 'object',
	additionalProperties: false,
	properties: {
		connectionHealth,
		requestError,
		lastRequestTime,
	},
};

export const schema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': jetpackConnectionHealth,
	},
};
