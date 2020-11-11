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
		'editor-mode': {
			type: 'string',
			enum: [ 'html', 'tinymce' ],
		},
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
		editorAdvancedVisible: {
			type: 'boolean',
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
		'store-dashboardStatsWidgetUnit': {
			type: 'string',
			enum: [ 'day', 'week', 'month' ],
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
	},
};
