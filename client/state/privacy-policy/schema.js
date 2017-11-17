/** @format */

export const privacyPolicySchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^[a-z/_-]+$': {
			type: 'object',
			required: [ 'id', 'created', 'modified' ],
			created: {
				type: 'string',
				description: 'Creation date of the document.',
			},
			content: {
				type: 'string',
			},
			id: {
				type: 'string',
			},
			modified: {
				type: 'string',
				description: 'Modification date of the document.',
			},
			notification_period: {
				type: 'object',
				required: [ 'from', 'to' ],
				from: {
					type: 'string',
					description: 'Start date of the notification period (ISO 8601 format)',
				},
				to: {
					type: 'string',
					description: 'End date of the notification period (ISO 8601 format)',
				},
			},
			raw_content: {
				type: 'string',
			},
			title: {
				type: 'string',
			},
		},
	},
};
