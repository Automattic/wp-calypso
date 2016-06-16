
const boolType = { type: 'boolean' };
const stringType = { type: 'string' };
const numberType = { type: 'number' };

export const settingsSchema = {
	type: 'object',
	properties: {
		enabled: boolType,
		dismissedNotice: boolType,
		dismissedNoticeAt: numberType,
		showingUnblockInstructions: boolType
	},
	additionalProperties: false
};

export const systemSchema = {
	type: 'object',
	properties: {
		apiReady: boolType,
		authorized: boolType,
		authorizationLoaded: boolType,
		blocked: boolType,
		wpcomSubscription: {
			type: 'object',
			properties: {
				lastUpdated: stringType,
				ID: numberType,
				settings: {
					type: 'object',
					additionalProperties: true
				}
			}
		}
	},
	additionalProperties: false
};
