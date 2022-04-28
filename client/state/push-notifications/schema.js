const boolType = { type: 'boolean' };
const stringType = { type: 'string' };

export const settingsSchema = {
	type: 'object',
	properties: {
		enabled: boolType,
		showingUnblockInstructions: boolType,
	},
	additionalProperties: false,
};

export const systemSchema = {
	type: 'object',
	properties: {
		apiReady: boolType,
		blocked: boolType,
		wpcomSubscription: {
			type: 'object',
			properties: {
				ID: stringType,
				settings: {
					type: 'object',
					additionalProperties: true,
				},
			},
		},
	},
	additionalProperties: false,
};
