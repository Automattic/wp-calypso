
const boolType = { type: 'boolean' };
const stringType = { type: 'string' };

export const settingsSchema = {
	name: 'settings',
	type: 'object',
	patternProperties: {
		enabled: boolType,
		dismissedNotice: boolType,
		dismissedNoticeAt: stringType,
		showingUnblockInstructions: boolType
	},
	additionalProperties: false
};

export const systemSchema = {
	name: 'system',
	type: 'object',
	patternProperties: {
		apiReady: boolType,
		authorized: boolType,
		authorizationLoaded: boolType,
		blocked: boolType,
		wpcomSubscription: {
			type: 'object',
			patternProperties: {
				lastUpdated: {
					type: 'string'
				}
			}
		}
	},
	additionalProperties: false
};
