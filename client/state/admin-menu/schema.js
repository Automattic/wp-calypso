const commonItemPropsSchema = {
	icon: { type: 'string' },
	slug: { type: 'string' },
	title: { type: 'string' },
	type: { type: 'string' },
	url: { type: 'string' },
};

const menuItemsSite = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'type' ],
		properties: {
			...commonItemPropsSchema,
			children: {
				type: 'array',
				items: {
					type: 'object',
					required: [ 'type', 'parent' ],
					properties: {
						...commonItemPropsSchema,
						parent: { type: 'string' },
					},
				},
			},
		},
	},
	additionalProperties: false,
};

export const menusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': menuItemsSite,
	},
};
