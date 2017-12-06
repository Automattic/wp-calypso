/** @format */
export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^\\w+$': {
			type: 'array',
			items: {
				type: 'number',
			},
			minItems: 2,
			maxItems: 2,
		},
	},
	additionalProperties: false,
};

const queryManagerSchema = {
	type: 'object',
	properties: {
		data: {
			type: 'object',
			required: [ 'items', 'queries' ],
			properties: {
				items: {
					type: 'object',
				},
				queries: {
					patternProperties: {
						// Query key pairs
						'^\\[.*\\]$': {
							type: 'object',
							required: [ 'itemKeys' ],
							properties: {
								itemKeys: {
									type: 'array',
								},
								found: {
									type: 'number',
								},
							},
						},
					},
					additionalProperties: false,
				},
			},
		},
		options: {
			type: 'object',
			required: [ 'itemKey' ],
			properties: {
				itemKey: {
					type: 'string',
				},
			},
		},
	},
};

export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': queryManagerSchema,
	},
	additionalProperties: false,
};

export const allSitesQueriesSchema = queryManagerSchema;
