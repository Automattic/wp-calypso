export const itemsSchema = {
	type: 'object',
	description: 'A site\'s themes',
	patternProperties: {
		// Site ID
		'^(wpcom|\\d+)$': {
			description: 'Theme, keyed by ID',
			type: 'object',
			patternProperties: {
				'^\\w+$': {
					title: 'Theme',
					type: 'object',
					properties: {
						id: {
							type: 'string'
						},
						name: {
							type: 'string'
						},
						author: {
							type: 'string'
						},
						screenshot: {
							type: 'string'
						},
						stylesheet: {
							type: 'string'
						},
						demo_uri: {
							type: 'string'
						},
						author_uri: {
							type: 'string'
						},
						price: {
							type: 'string'
						}
					},
					required: [
						'id',
						'name',
						'author',
						'screenshot',
						'stylesheet',
						'demo_uri',
						'author_uri'
					]
				}
			}
		}
	},
	additionalProperties: false
};

export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^(wpcom|\\d+)$': {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					required: [ 'items', 'queries' ],
					properties: {
						items: {
							type: 'object'
						},
						queries: {
							patternProperties: {
								// Query key pairs
								'^\\[.*\\]$': {
									type: 'object',
									required: [ 'itemKeys' ],
									properties: {
										itemKeys: {
											type: 'array'
										},
										found: {
											type: 'number'
										}
									}
								}
							},
							additionalProperties: false
						}
					}
				},
				options: {
					type: 'object',
					required: [ 'itemKey' ],
					properties: {
						itemKey: {
							type: 'string'
						}
					}
				}
			}
		}
	},
	additionalProperties: false
};
