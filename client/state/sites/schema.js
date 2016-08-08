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
				description: { type: 'string' },
				URL: { type: 'string' },
				jetpack: { type: 'boolean' },
				post_count: { type: 'number' },
				subscribers_count: { type: 'number' },
				lang: { type: 'string' },
				icon: {
					type: 'object',
					properties: {
						img: { type: 'string' },
						ico: { type: 'string' }
					}
				},
				logo: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						sizes: { type: [ 'array', 'object' ] },
						url: { type: 'string' }
					}
				},
				visible: { type: 'boolean' },
				is_private: { type: 'boolean' },
				is_following: { type: 'boolean' },
				options: { type: 'object' },
				meta: { type: 'object' },
				user_can_manage: { type: 'boolean' },
				is_vip: { type: 'boolean' },
				is_multisite: { type: 'boolean' },
				capabilities: {
					type: 'object',
					patternProperties: {
						'^[a-z_]+$': { type: 'boolean' }
					}
				},
				plan: {
					type: 'object',
					required: [ 'product_id', 'product_slug', 'expired' ],
					properties: {
						product_id: { type: 'number' },
						product_slug: { type: 'string' },
						product_name_short: { type: 'string' },
						free_trial: { type: 'boolean' },
						expired: { type: 'boolean' }
					}
				},
				single_user_site: { type: 'boolean' }
			}
		}
	},
	additionalProperties: false
};
