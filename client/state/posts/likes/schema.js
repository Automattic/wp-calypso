export default {
	type: 'object',
	additionalProperties: false,
	required: [ 'iLike', 'found' ],
	properties: {
		likes: {
			type: 'array',
			description: 'List of post likes',
		},
		iLike: {
			type: 'boolean',
			description: 'Whether the current authenticated user likes the post or not',
		},
		found: {
			type: 'number',
			description: 'The total of post likes',
		},
		lastUpdated: {
			type: 'number',
			description: 'When we last updated the liker info',
		},
	},
};
