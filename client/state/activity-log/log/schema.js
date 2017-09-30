/** @format */
const activityItemSchema = {
	type: 'object',
	additionalProperties: false,
	required: [
		'activityDate',
		'activityGroup',
		'activityIcon',
		'activityId',
		'activityName',
		'activityTitle',
		'activityTs',
		'actorAvatarUrl',
		'actorName',
		'actorRole',
		'actorType',
	],
	properties: {
		activityDate: { type: 'string' },
		activityGroup: { type: 'string' },
		activityIcon: { type: 'string' },
		activityId: { type: 'string' },
		activityName: { type: 'string' },
		activityStatus: {
			oneOf: [ { type: 'string' }, { type: 'null' } ],
		},
		activityTitle: { type: 'string' },
		activityTs: { type: 'integer' },
		actorAvatarUrl: { type: 'string' },
		actorName: { type: 'string' },
		actorRemoteId: { type: 'integer' },
		actorRole: { type: 'string' },
		actorType: { type: 'string' },
		actorWpcomId: { type: 'integer' },
	},
};

export const logItemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			additionalProperties: false,
			properties: {
				data: {
					type: 'object',
					additionalProperties: false,
					required: [ 'items', 'queries' ],
					properties: {
						items: {
							patternProperties: {
								'^.+$': activityItemSchema,
							},
						},
						queries: {
							type: 'object',
							additionalProperties: false,
							patternProperties: {
								// Query key pairs
								'^\\[.*\\]$': {
									type: 'object',
									additionalProperties: false,
									required: [ 'itemKeys' ],
									properties: {
										itemKeys: {
											type: 'array',
											items: {
												type: 'string',
											},
										},
										found: {
											type: 'integer',
										},
									},
								},
							},
						},
					},
				},
				options: {
					type: 'object',
					additionalProperties: false,
					required: [ 'itemKey' ],
					properties: {
						itemKey: {
							type: 'string',
						},
					},
				},
			},
		},
	},
};
