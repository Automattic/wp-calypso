export const USER_SETTING_KEY = 'calypso_preferences';
export const DEFAULT_PREFERENCES = {
	'editor-mode': {
		schema: { 'enum': [ null, 'html', 'tinymce' ] },
		'default': null
	},
	firstViewHistory: {
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					view: { type: 'string' },
					timestamp: { type: 'number', minimum: 0 },
					disabled: { type: 'boolean' }
				},
				required: [ 'view', 'timestamp', 'disabled' ],
			},
		},
		'default': [],
	},
	mediaModalGalleryInstructionsDismissed: {
		schema: { type: 'boolean' },
		'default': false
	},
	mediaModalGalleryInstructionsDismissedForSession: {
		schema: null, //We only want to store this preference for current session. mediaModalGalleryInstructionsDismissed is the version stored in api and localStorage
		'default': false
	},
	'guided-tours-history': {
		schema: {
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
		'default': [],
	},
};
