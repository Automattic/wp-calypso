export const itemsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9a-z]+$': {
			type: 'object',
			required: [ 'feed_ID', 'blog_ID' ],
			properties: {
				feed_ID: { type: 'integer' },
				blog_ID: { type: 'integer' },
				name: { type: [ 'string', 'null' ] },
				URL: { type: [ 'string', 'null' ] },
				feed_URL: { type: [ 'string', 'null' ] },
				is_following: { type: [ 'boolean', 'null' ] },
				subscribers_count: { type: [ 'integer', 'null' ] },
				description: { type: [ 'string', 'null' ] },
				last_update: { type: [ 'string', 'null' ] },
				image: { type: [ 'string', 'null' ] },
				organization_id: { type: [ 'integer', 'null' ] },
				unseen_count: { type: [ 'integer', 'null' ] },
			},
		},
	},
	additionalProperties: false,
};
