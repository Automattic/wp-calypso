/** @format */

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

export const geoLocationSchema = {
	type: [ 'object', 'null' ],
	properties: {
		city: { type: 'string' },
		country_long: { type: 'string' },
		country_short: { type: 'string' },
		region: { type: 'string' },
	},
};

export const timelineSchema = {
	type: 'array',
	additionalProperties: false,
	items: eventSchema,
};
