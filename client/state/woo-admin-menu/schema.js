const menus = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'type' ],
		properties: {}, // @todo Should expand on this when the API is finalized.
	},
	additionalProperties: false,
};

export const menusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': menus,
	},
};
