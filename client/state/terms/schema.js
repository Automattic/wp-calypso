export const queriesSchema = {
	type: 'object',
	patternProperties: {
		// Site ID
		'^\\d+$': {
			type: 'object',
			patternProperties: {
				// Taxonomy
				'^[A-Za-z0-9-_]+$': {
					type: 'object',
					properties: {
						// Query Manager
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
		}
	},
	additionalProperties: false
};
