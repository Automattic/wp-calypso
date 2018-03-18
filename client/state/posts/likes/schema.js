/** @format */
export default {
	type: 'object',
	additionalProperties: false,
	required: [ 'likes', 'iLike', 'found' ],
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
	},
};
