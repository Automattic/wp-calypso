/** @format */
const themeSchema = {
	title: 'Theme',
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		author: { type: 'string' },
		screenshot: { type: 'string' },
		stylesheet: { type: 'string' },
		demo_uri: { type: 'string' },
		author_uri: { type: 'string' },
		price: {
			type: 'string',
		},
	},
	required: [ 'id', 'name', 'author', 'screenshot' ],
};

export const queriesSchema = {
	type: 'object',
	properties: {
		_timestamp: { type: 'number' },
	},
	patternProperties: {
		// Site ID
		'^(wpcom|wporg|\\d+)$': {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					required: [ 'items', 'queries' ],
					properties: {
						items: {
							description: 'Themes, keyed by ID',
							type: 'object',
							patternProperties: {
								'^\\w+$': themeSchema,
							},
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
		},
	},
	additionalProperties: false,
};

export const activeThemesSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			description: 'Theme ID',
			type: 'string',
		},
	},
};

export const themeRequestErrorsSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^(wpcom|wporg|\\d+)$': {
			type: 'object',
			patternProperties: {
				// Theme ID
				'^\\w+$': {
					type: 'object',
					properties: {
						path: { type: 'string' },
						method: { type: 'string' },
						name: { type: 'string' },
						statusCode: { type: 'number' },
						status: { type: 'number' },
						message: { type: 'string' },
						error: { type: 'string' },
					},
				},
			},
		},
	},
};

export const themeFiltersSchema = {
	type: 'object',
	patternProperties: {
		// Taxonomy ID
		'^[\\w-]+$': {
			title: 'Taxonomy',
			type: 'object',
			patternProperties: {
				// Term (i.e. filter) ID
				'^\\w+$': {
					title: 'Term',
					type: 'object',
					properties: {
						name: { type: 'string' },
						description: { type: 'string' },
					},
				},
			},
			uniqueItems: true,
		},
	},
	additionalProperties: false,
};
