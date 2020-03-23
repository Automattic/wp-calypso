export const itemsSchema = {
	type: [ 'array', 'null' ],
	additionalProperties: false,
	items: {
		type: 'string',
	},
};
