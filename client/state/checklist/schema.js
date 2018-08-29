/** @format */
export const items = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Site Id
		'^\\d+$': {
			type: 'object',
		},
	},
};

export const checklistNotificationSchema = {
	type: 'boolean',
};
