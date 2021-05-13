export const eventSchema = {
	type: 'object',
	additionalProperties: false,
	required: [ 'id', 'source', 'message', 'timestamp', 'user_id', 'type' ],
	properties: {
		id: { type: 'string' },
		source: { type: 'string' },
		message: { type: 'string' },
		name: { type: 'string' },
		image: { type: 'string' },
		timestamp: { type: [ 'number', 'string' ] },
		user_id: { type: [ 'number', 'string' ] },
		type: { type: 'string' },
		links: { type: 'array' },
	},
};

export const timelineSchema = {
	type: 'array',
	additionalProperties: false,
	items: eventSchema,
};
