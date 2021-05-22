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
		mediaModalGalleryInstructionsDismissed: {
			type: 'boolean',
		},
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
		editorConfirmationDisabledSites: {
			type: 'array',
			items: { type: 'number' },
		},
		colorScheme: {
			type: 'string',
			enum: [
				'aquatic',
				'blue',
				'classic-blue',
				'classic-bright',
				'classic-dark',
				'coffee',
				'contrast',
				'ectoplasm',
				'light',
				'midnight',
				'modern',
				'nightfall',
				'ocean',
				'powder-snow',
				'sakura',
				'sunrise',
				'sunset',
			],
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
				scan: {
					type: 'object',
					properties: {
						'/[0-9]+/': { $ref: '#/definitions/dismissiblePrompt' },
					},
				},
				restore: { $ref: '#/definitions/dismissiblePrompt' },
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
