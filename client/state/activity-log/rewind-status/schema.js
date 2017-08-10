/** @format */
export const rewindStatusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'active', 'plan', 'isPressable', 'firstBackupDate' ],
			properties: {
				active: { type: 'boolean' },
				plan: { type: 'string' },
				isPressable: { type: 'boolean' },
				firstBackupDate: { type: 'string' },
			},
		},
	},
	additionalProperties: false,
};
