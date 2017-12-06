/** @format */

export const revisionsDiffSchema = {
	description: 'The difference between post revisions',
	type: 'object',

	patternProperties: {
		'^\\d+$': {
			type: 'object',
			description: 'Diff data for the given site',
			patternProperties: {
				'^\\d+:\\d+$': {
					type: 'object',
					description: 'Diff data for the `from:to` composite combo',
					patternProperties: {
						diff: {
							type: 'object',
						},
						from_revision_id: {
							type: 'integer',
						},
						to_revision_id: {
							type: 'integer',
						},
					},
				},
			},
		},
	},

	additionalProperties: false,
};
