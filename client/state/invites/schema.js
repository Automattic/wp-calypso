const invitesArraySchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			key: { type: 'string' },
			role: { type: 'string' },
			isPending: { type: 'boolean' },
			inviteDate: { type: 'string' },
			acceptedDate: { anyOf: [ { type: 'string' }, { enum: [ null ] } ] },
			user: {
				type: 'object',
				properties: {
					login: { type: 'string' },
					email: { anyOf: [ { type: 'string' }, { enum: [ false ] } ] },
					name: { type: 'string' },
					avatar_URL: { type: 'string' },
				},
				additionalProperties: false,
			},
			invitedBy: {
				type: 'object',
				properties: {
					login: { type: 'string' },
					name: { type: 'string' },
					avatar_URL: { type: 'string' },
				},
				additionalProperties: false,
			},
		},
		additionalProperties: false,
	},
};

export const inviteItemsSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			properties: {
				pending: invitesArraySchema,
				accepted: invitesArraySchema,
			},
			required: [ 'pending', 'accepted' ],
			additionalProperties: false,
		},
	},
};
