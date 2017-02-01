export const itemsSchema = {
	type: 'object',
	properties: {
		number: { type: 'number' },
		teams: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					title: { type: 'string' },
					slug: { type: 'string' },
				}
			}
		}
	}
};

