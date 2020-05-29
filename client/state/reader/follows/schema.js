export const items = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'.+': {
			type: 'object',
			required: [ 'feed_URL', 'URL', 'is_following' ],
			properties: {
				URL: { type: 'string' },
				feed_URL: { type: 'string' },
				is_following: { type: 'boolean' },
				ID: { type: [ 'integer', 'null' ] },
				blog_ID: { type: [ 'integer', 'null' ] },
				feed_ID: { type: [ 'integer', 'null' ] },
				date_subscribed: { type: [ 'integer', 'null' ] },
				delivery_methods: { type: [ 'object', 'null' ] },
				is_owner: { type: [ 'boolean', 'null' ] },
				organization_id: { type: [ 'integer', 'null' ] },
				name: { type: [ 'string', 'null' ] },
				unseen_count: { type: [ 'integer', 'null' ] },
			},
		},
	},
	additionalProperties: false,
};
