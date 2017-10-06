/** @format */
export const restoreProgressSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'restoreId', 'status', 'timestamp' ],
			properties: {
				errorCode: { type: 'string' },
				failureReason: { type: 'string' },
				freshness: { type: 'integer' },
				message: { type: 'string' },
				percent: { type: 'integer' },
				restoreId: { type: 'integer' },
				status: { type: 'string' },
				timestamp: { type: 'integer' },
			},
		},
	},
	additionalProperties: false,
};
