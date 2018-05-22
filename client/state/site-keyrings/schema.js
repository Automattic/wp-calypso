/** @format */
export const siteKeyrings = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		// Keyring Id
		'^\\d+$': {
			type: 'object',
			properties: {
				keyring_id: { type: 'number' },
				service: { type: 'string' },
				external_user_id: { type: [ 'string', 'null' ] },
			},
		},
	},
};
