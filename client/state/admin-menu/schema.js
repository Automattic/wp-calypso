const commonItemPropsSchema = {
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
			icon: { type: 'string' },
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
