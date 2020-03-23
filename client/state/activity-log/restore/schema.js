export const restoreProgressSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'restoreId', 'status', 'timestamp' ],
			properties: {
				errorCode: { type: 'string' },
				failureReason: { type: 'string' },
				message: { type: 'string' },
				percent: { type: 'integer' },
				restoreId: { type: 'integer' },
				status: { type: 'string' },
				timestamp: { type: 'integer' },
				rewindId: { type: 'string' },
			},
		},
	},
	additionalProperties: false,
};
