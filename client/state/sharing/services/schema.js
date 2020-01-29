export const itemSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[a-z_]+$': {
			type: 'object',
			required: [
				'ID',
				'connect_URL',
				'description',
				'genericon',
				'icon',
				'jetpack_support',
				'label',
				'multiple_external_user_ID_support',
				'external_users_only',
				'type',
			],
			properties: {
				ID: { type: 'string' },
				connect_URL: { type: 'string' },
				description: { type: 'string' },
				genericon: { type: 'object' },
				icon: { type: 'string' },
				jetpack_module_required: { type: 'string' },
				jetpack_support: { type: 'boolean' },
				label: { type: 'string' },
				multiple_external_user_ID_support: { type: 'boolean' },
				external_users_only: { type: 'boolean' },
				type: { type: 'string' },
			},
		},
	},
};
