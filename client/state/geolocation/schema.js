export const geolocationSchema = {
	type: 'object',
	properties: {
		latitude: { type: 'string' },
		longitude: { type: 'string' },
		countryShort: { type: 'string' },
		countryLong: { type: 'string' },
		region: { type: 'string' },
		city: { type: 'string' }
	},
	additionalProperties: false
};
