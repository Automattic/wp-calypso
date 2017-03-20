export const publicizeActionSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'connection_id', 'status' ],
			properties: {
				ID: { type: 'string' },
				connection_id: { type: 'integer' },
				message: { type: 'string' },
				timestamp: { type: 'integer' },
				result: { type: 'object' },
				url: { type: 'string' },
				status: { type: 'string' },
			}
		}
	}
};
