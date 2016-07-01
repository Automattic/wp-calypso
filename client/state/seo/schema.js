export const titleFormatSchema = {
	type: 'object',
	required: [ 'frontPage', 'posts', 'pages', 'groups', 'archives' ],
	properties: {
		frontPage: { type: 'string' },
		posts: { type: 'string' },
		pages: { type: 'string' },
		groups: { type: 'string' },
		archives: { type: 'string' }
	}
};
