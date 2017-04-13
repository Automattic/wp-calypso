export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			properties: {
				jp_version: { type: 'string' },
				plugins: { type: 'number' },
				themes: { type: 'number' },
				total: { type: 'number' },
				translations: { type: 'number' },
				wordress: { type: 'number' },
				wp_version: { type: 'string' }
			}
		}
	}
};
