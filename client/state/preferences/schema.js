/** @format */
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
		firstViewHistory: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					view: { type: 'string' },
					timestamp: { type: 'number', minimum: 0 },
					disabled: { type: 'boolean' },
				},
				required: [ 'view', 'timestamp', 'disabled' ],
			},
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
			enum: [ 'default', 'light', 'dark' ],
		},
		'store-dashboardStatsWidgetUnit': {
			type: 'string',
			enum: [ 'day', 'week', 'month' ],
		},
	},
};
