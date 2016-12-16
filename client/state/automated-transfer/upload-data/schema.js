export const upload = {
	title: 'State of file upload',
	description: 'Tracks uploading progress and finish state',
	type: 'object',
	properties: {
		bytesLoaded: {
			title: 'Bytes already uploaded',
			type: 'number',
			minimum: 0,
			'default': 0
		},
		bytesTotal: {
			title: 'Total bytes for upload',
			type: 'number',
			minimum: 0
		}
	},
	required: [
		'bytesLoaded',
		'bytesTotal'
	],
};
