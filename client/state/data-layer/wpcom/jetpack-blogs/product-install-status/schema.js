export default {
	type: 'object',
	properties: {
		akismet_status: { type: 'string' },
		progress: { type: 'integer' },
		vaultpress_status: { type: 'string' },
	},
	required: [ 'akismet_status', 'progress', 'vaultpress_status' ],
	additionalProperties: false,
};
