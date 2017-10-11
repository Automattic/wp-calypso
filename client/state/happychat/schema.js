/** @format */

export const geoLocationSchema = {
	type: [ 'object', 'null' ],
	properties: {
		city: { type: 'string' },
		country_long: { type: 'string' },
		country_short: { type: 'string' },
		region: { type: 'string' },
	},
};
