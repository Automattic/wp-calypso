export const previewSchema = {
	description: 'Data for previewing sites, including any customizations',
	type: 'object',
	patternProperties: {
		'^[0-9a-z]+$': {
			type: 'object',
			description: 'Data for previewing a particular site keyed by the site ID',
			required: [
				'previewMarkup',
				'previousCustomizations',
				'customizations',
				'isUnsaved',
			],
			properties: {
				previewMarkup: {
					type: 'string',
					description: 'The raw markup to preview',
				},
				previousCustomizations: {
					type: 'array',
					description: 'Previous values of the customizations property to enable undo',
				},
				customizations: {
					type: [ 'object', 'null' ],
					description: 'A set of customizations by key used to modify the preview',
				},
				isUnsaved: {
					type: [ 'boolean', 'null' ],
					description: 'True if the customizations in the customizations property have not been saved',
				},
			}
		}
	},
	additionalProperties: false
};
