export const publicizeActionsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'connection_id', 'status' ],
			properties: {
				ID: { type: 'string' },
				connection_id: { type: 'integer' },
				message: { type: 'string' },
				share_date: { type: 'integer' },
				result: { type: 'object' },
				url: { type: 'string' },
				status: { type: 'string' },
			},
		},
	},
};
