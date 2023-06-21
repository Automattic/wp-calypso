export const geoLocationSchema = {
	type: [ 'object', 'null' ],
	properties: {
		city: { type: 'string' },
		country_long: { type: 'string' },
		country_short: { type: 'string' },
		region: { type: 'string' },
	},
};

export const isEligibleSchema = {
	type: [ 'boolean', 'null' ],
};

export const availabilitySchema = {
	type: [ 'object', 'null' ],
	properties: {
		precancellation: { type: 'boolean' },
		presale: { type: 'boolean' },
	},
};

export const supportLevelSchema = {
	type: [ 'string', 'null' ],
};
