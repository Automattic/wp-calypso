const requestError = {
	type: [ 'string', 'null' ],
};

const lastRequestTime = {
	type: [ 'number', 'null' ],
};

const connectionHealth = {
	type: 'object',
	properties: {
		jetpack_connection_problem: {
			type: 'boolean',
		},
		error: {
			type: 'string',
		},
	},
};
const jetpackConnectionHealth = {
	type: 'object',
	additionalProperties: false,
	properties: {
		connectionHealth,
		requestError,
		lastRequestTime,
	},
	required: [ 'connectionHealth', 'lastRequestTime' ],
};

export const schema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': jetpackConnectionHealth,
	},
};
