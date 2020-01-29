export const lastUpdate = {
	type: 'number',
	minimum: 0,
};

export const eligibilityHolds = {
	type: 'array',
	items: { type: 'string' },
};

export const eligibilityWarnings = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			description: { type: 'string' },
			supportUrl: { type: 'string' },
		},
	},
};

export const eligibility = {
	type: 'object',
	properties: {
		lastUpdate,
		eligibilityHolds,
		eligibilityWarnings,
	},
};
