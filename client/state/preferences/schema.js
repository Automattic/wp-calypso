export const remoteValuesSchema = {
	type: [ 'null', 'object' ],
	patternProperties: {
		'^dismissible-card-.+$': {
			type: 'boolean',
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
		'google-my-business-dismissible-nudge': {
			type: 'object',
			'^[1-9]+$': {
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
				'classic-blue',
				'classic-bright',
				'contrast',
				'g2',
				'midnight',
				'nightfall',
				'ocean',
				'powder-snow',
				'sakura',
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
