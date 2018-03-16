/** @format */

export default {
	additionalProperties: false,
	required: [ 'data', 'options' ],
	type: 'object',
	properties: {
		data: {
			additionalProperties: false,
			type: 'object',
			properties: {
				items: { type: 'object' },
				queries: {
					additionalProperties: false,
					type: 'object',
					patternProperties: {
						// Stringified query objects are the keys
						'^\\[.*\\]$': {
							required: [ 'itemKeys' ],
							type: 'object',
							properties: {
								itemKeys: {
									type: 'array',
									items: { type: 'string' },
								},
								found: {
									type: 'integer',
								},
							},
						},
					},
				},
			},
		},
		options: {
			additionalProperties: true,
			required: [ 'itemKey' ],
			type: 'object',
			properties: {
				itemKey: { type: 'string' },
			},
		},
	},
};
