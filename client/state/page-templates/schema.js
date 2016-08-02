export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				required: [ 'label', 'file' ],
				properties: {
					label: { type: 'string' },
					file: { type: 'string' }
				}
			}
		}
	}
};
