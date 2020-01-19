export const siteVerticalSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		id: {
			type: 'string',
		},
		isUserInput: {
			type: 'boolean',
		},
		name: {
			type: 'string',
		},
		parentId: {
			type: 'string',
		},
		preview: {
			type: 'string',
		},
		slug: {
			type: 'string',
		},
		suggestedTheme: {
			type: 'string',
		},
	},
};
