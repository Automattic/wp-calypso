/** @format */
export const geoSchema = {
	type: [ 'object', 'null' ],
	properties: {
		latitude: { type: 'string' },
		longitude: { type: 'string' },
		country_short: { type: 'string' },
		country_long: { type: 'string' },
		region: { type: 'string' },
		city: { type: 'string' },
	},
};
