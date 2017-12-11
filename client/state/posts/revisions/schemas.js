/** @format */

export const revisionsDiffSchema = {
	description: 'The difference between post revisions',
	type: 'object',

	patternProperties: {
		'^\\d+$': {
			type: 'object',
			description: 'Diff data for the given site',
			patternProperties: {
				'^\\d+$': {
					type: 'object',
					description: 'Diff data for the given post',
					patternProperties: {
						revisions: {
							type: 'array',
							description: 'Known revisions for the given post',
						},
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
		},
	},

	additionalProperties: false,
};
