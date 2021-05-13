export const itemsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9]+$': {
			type: 'object',
			required: [ 'ID' ],
			properties: {
				ID: { type: 'integer' },
				title: { type: 'string' },
				slug: { type: 'string' },
				description: { type: 'string' },
				owner: { type: 'string' },
				is_owner: { type: 'boolean' },
				is_public: { type: 'boolean' },
			},
		},
	},
	additionalProperties: false,
};

export const subscriptionsSchema = {
	type: 'array',
};

export const updatedListsSchema = {
	type: 'array',
};

export const errorsSchema = {
	type: 'object',
};
