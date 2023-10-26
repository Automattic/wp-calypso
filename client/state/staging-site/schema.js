export const status = {
	type: 'string',
};

export const stagingSiteSchema = {
	type: 'object',
	properties: {
		status,
	},
};

export const stagingSite = {
	type: 'object',
	patternProperties: {
		'^\\d+$': stagingSiteSchema,
	},
};
