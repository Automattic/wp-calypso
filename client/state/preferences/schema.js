/** @ssr-ready **/

export const remoteValuesSchema = {
	type: [ 'null', 'object' ],
	patternProperties: {
		'^dismissable-card-.+$': {
			type: 'boolean'
		}
	},
	properties: {
		'editor-mode': {
			type: 'string',
			'enum': [ 'html', 'tinymce' ]
		},
		mediaModalGalleryInstructionsDismissed: {
			type: 'boolean'
		},
		firstViewHistory: {
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
			}
		},
		recentSites: {
			type: 'array',
			items: {
				type: 'number'
			}
		}
	}
};
