export const firstViewSchema = {
	type: 'object',
	properties: {
		dismissed: {
			type: 'array',
			items: {
				type: 'string'
			}
		},
		visible: {
			type: 'array',
			items: {
				type: 'string'
			}
		}
	}
};
