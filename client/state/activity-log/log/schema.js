/** @format */
const activityItemSchema = {
	type: 'object',
	required: [
		'activityDate',
		'activityGroup',
		'activityIcon',
		'activityId',
		'activityIsRewindable',
		'activityName',
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
		activityIsDiscarded: { type: 'boolean' },
		activityIsRewindable: { type: 'boolean' },
		activityName: { type: 'string' },
		activityStatus: {
			oneOf: [ { type: 'string' }, { type: 'null' } ],
		},
		activityTargetTs: { type: 'number' },
		activityTitle: { type: 'string' },
		activityTs: { type: 'integer' },
		actorAvatarUrl: { type: 'string' },
		actorName: { type: 'string' },
		actorRemoteId: { type: 'integer' },
		actorRole: { type: 'string' },
		actorType: { type: 'string' },
		actorWpcomId: { type: 'integer' },
		rewindId: { type: [ 'null', 'string' ] },
	},
};

export const logItemsSchema = {
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
		oldestItemTs: {
			type: [ 'null', 'integer' ],
		},
	},
};
