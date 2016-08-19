/** @ssr-ready **/

export const localValuesSchema = {
	type: 'object',
	properties: {
		mediaModalGalleryInstructionsDismissed: {
			type: 'boolean'
		}
	}
};

export const remoteValuesSchema = {
	type: [ 'null', 'object' ],
	properties: {
		'editor-mode': {
			type: [ 'string', 'null' ],
			'enum': [ null, 'html', 'tinymce' ]
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
	}
};
