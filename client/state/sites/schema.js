/** @format */
export const sitesSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'name' ],
			properties: {
				ID: { type: 'number' },
				name: { type: 'string' },
				URL: { type: 'string' },
				jetpack: { type: 'boolean' },
				icon: {
					type: 'object',
					properties: {
						img: { type: 'string' },
						ico: { type: 'string' },
						media_id: { type: 'number' },
					},
				},
				visible: { type: 'boolean' },
				is_private: { type: 'boolean' },
				is_vip: { type: 'boolean' },
				options: { type: 'object' },
				meta: { type: 'object' },
				is_multisite: { type: 'boolean' },
				capabilities: {
					type: 'object',
					patternProperties: {
						'^[a-z_]+$': { type: 'boolean' },
					},
				},
				plan: {
					type: 'object',
					required: [ 'product_id', 'product_slug' ],
					properties: {
						product_id: { type: [ 'number', 'string' ] },
						product_slug: { type: 'string' },
						product_name_short: { type: [ 'string', 'null' ] },
						free_trial: { type: 'boolean' },
						expired: { type: 'boolean' },
						user_is_owner: { type: 'boolean' },
						is_free: { type: 'boolean' },
					},
				},
				single_user_site: { type: 'boolean' },
			},
		},
	},
	additionalProperties: false,
};
