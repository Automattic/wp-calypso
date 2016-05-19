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
				name: { type: 'string' },
				URL: { type: 'string' },
				feed_URL: { type: 'string' },
				is_following: { type: 'boolean' },
				subscribers_count: { type: 'integer' },
				meta: { type: 'object' }
			}
		}
	},
	additionalProperties: false
};
