export const titleFormatSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'object',
			properties: {
				frontPage: { type: 'string' },
				posts: { type: 'string' },
				pages: { type: 'string' },
				groups: { type: 'string' },
				archives: { type: 'string' }
			}
		}
	}
};
