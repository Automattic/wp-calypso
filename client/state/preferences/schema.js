export const remoteValuesSchema = {
	type: [ 'null', 'object' ],
	patternProperties: {
		'^dismissible-card-.+$': {
			type: [ 'boolean', 'object' ],
		},
		'^time-mismatch-warning-\\d+$': {
			type: [ 'boolean', 'number' ],
		},
	},
	properties: {
		'guided-tours-history': {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					tourName: { type: 'string' },
					timestamp: { type: 'number', minimum: 0 },
					finished: { type: 'boolean' },
				},
				required: [ 'tourName', 'timestamp', 'finished' ],
				additionalProperties: false,
			},
		},
		recentSites: {
			type: 'array',
			items: {
				type: 'number',
			},
		},
		mediaScale: {
			type: 'number',
			minimum: 0,
			maximum: 1,
		},
		'upwork-dismissible-banner': {
			type: 'object',
			'^[a-z-]+$': {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						dismissedAt: { type: 'number', minimum: 0 },
						type: { type: 'string', enum: [ 'dismiss' ] },
					},
					required: [ 'dismissedAt', 'type' ],
				},
			},
		},
		'jetpack-review-prompt': {
			type: 'object',
			properties: {
				scan: { $ref: '#/definitions/dismissiblePrompt' },
				restore: { $ref: '#/definitions/dismissiblePrompt' },
			},
		},
		homeQuickLinksToggleStatus: {
			type: 'string',
			enum: [ 'collapsed', 'expanded' ],
		},
		'persistent-counter': {
			type: 'object',
			properties: {
				// counter-name (possibly suffixed with siteId)
				'^[a-z0-9-]+$': {
					type: 'object',
					properties: {
						count: { type: 'number', minimum: 0 },
						lastCountDate: { type: [ 'number', 'null' ] },
					},
				},
			},
		},
	},
	definitions: {
		dismissiblePrompt: {
			type: 'object',
			properties: {
				dismissedAt: { type: [ 'number', 'null' ] },
				dismissedCount: { type: 'number', minimum: 0 },
				reviewed: { type: 'number' },
				validFrom: { type: [ 'number', 'null' ] },
			},
			required: [ 'dismissedAt', 'dismissedCount', 'reviewed', 'validFrom' ],
		},
	},
};
