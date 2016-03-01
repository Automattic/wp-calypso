export const itemsSchema = {
	type: 'object',
	patternProperties: {
		//be careful to escape regexes properly
		'^[0-9a-z]+$': {
			type: 'object',
			required: [ 'ID', 'site_ID', 'global_ID' ],
			properties: {
				ID: { type: 'integer' },
				site_ID: { type: 'integer' },
				global_ID: { type: 'string' },
				author: { type: 'object' },
				date: { type: 'string' },
				modified: { type: 'string' },
				title: { type: 'string' },
				URL: { type: 'string' },
				short_URL: { type: 'string' },
				content: { type: 'string' },
				excerpt: { type: 'string' },
				slug: { type: 'string' },
				guid: { type: 'string' },
				status: { type: 'string' },
				sticky: { type: 'boolean' },
				password: { type: 'string' },
				parent: { type: [ 'object', 'boolean' ] },
				type: { type: 'string' },
				discussion: { type: 'object' },
				likes_enabled: { type: 'boolean' },
				sharing_enabled: { type: 'boolean' },
				like_count: { type: 'integer' },
				i_like: { type: 'boolean' },
				is_reblogged: { type: 'boolean' },
				is_following: { type: 'boolean' },
				featured_image: { type: 'string' },
				post_thumbnail: { type: [ 'string', 'null' ] },
				format: { type: 'string' },
				geo: { type: 'boolean' },
				menu_order: { type: 'integer' },
				page_template: { type: 'string' },
				publicize_URLS: { type: 'array' },
				tags: { type: 'object' },
				categories: { type: 'object' },
				attachments: { type: 'object' },
				attachment_count: { type: 'integer' },
				metadata: { type: 'array' },
				meta: { type: 'object' },
				capabilities: { type: 'object' },
				other_URLs: { type: 'object' }
			}
		}
	},
	additionalProperties: false
};
