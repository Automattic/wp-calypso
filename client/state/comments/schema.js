export const commentsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+-\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					ID: { type: 'integer' },
					URL: { type: 'string' },
					author: {
						type: 'object',
						properties: {
							ID: { type: 'integer' },
							URL: { type: 'string' },
							avatar_URL: { type: 'string' },
							email: { type: 'boolean' },
							first_name: { type: 'string' },
							last_name: { type: 'string' },
							login: { type: 'string' },
							name: { type: 'string' },
							nice_name: { type: 'string' },
							profile_URL: { type: 'string' },
							site_ID: { type: 'integer' }
						}
					},
					content: { type: 'string' },
					date: { type: 'string' },
					i_like: { type: 'boolean' },
					like_count: { type: 'integer' },
					meta: {
						type: 'object',
						properties: {
							links: {
								type: 'object',
								properties: {
									help: { type: 'string' },
									likes: { type: 'string' },
									post: { type: 'string' },
									replies: { type: 'string' },
									self: { type: 'string' },
									site: { type: 'string' }
								}
							}
						},
					},
					parent: {
						oneOf: [
							{ type: 'boolean' },
							{
								type: 'object',
								properties: {
									ID: { type: 'integer' },
									link: { type: 'string' },
									type: { type: 'string' }
								}
							}
						]
					},
					post: {
						type: 'object',
						properties: {
							ID: { type: 'integer' },
							link: { type: 'string' },
							title: { type: 'string' },
							type: { type: 'string' }
						}
					},
					short_URL: { type: 'string' },
					status: { type: 'string' },
					type: { type: 'string' }
				}
			}
		}
	}
};

export const totalCommentsCountSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+-\\d+$': { type: 'number' }
	}
};
