/** @format */

export const jetpackOnboardingCredentialsSchema = {
	type: 'object',
	additionalProperties: false,
	required: [ 'siteUrl', 'token', 'userEmail' ],
	properties: {
		siteUrl: { type: 'string' },
		token: { type: 'string' },
		userEmail: { type: 'string' },
	},
};

export const jetpackOnboardingSettingsSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		siteTitle: { type: 'string' },
		siteDescription: { type: 'string' },
		siteType: {
			anyOf: [ { type: 'string' }, { type: 'boolean' } ],
		},
		homepageFormat: {
			anyOf: [ { type: 'string' }, { type: 'boolean' } ],
		},
		addContactForm: {
			anyOf: [
				{
					type: 'integer',
					minimum: 0,
				},
				{ type: 'boolean' },
			],
		},
		businessAddress: {
			anyOf: [
				{ type: 'boolean' },
				{
					type: 'object',
					additionalProperties: false,
					properties: {
						name: { type: 'string' },
						street: { type: 'string' },
						city: { type: 'string' },
						state: { type: 'string' },
						zip: { type: 'string' },
						country: { type: 'string' },
					},
				},
			],
		},
		installWooCommerce: { type: 'boolean' },
		stats: { type: 'boolean' },
	},
};
