export const items = {
	type: 'object',
	additionalProperties: true,
	properties: {
		designType: { type: 'string' },
		segment: { type: 'integer' },
		tasks: { type: 'object' },
		verticals: { type: 'array' },
	},
};
