
export const firstViewSchema = {
	type: 'object',
	properties: {
		disabled: {
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
