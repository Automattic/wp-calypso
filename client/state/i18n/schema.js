export const i18nPaymentsSchema = {
	type: [ 'object', 'null' ],
	properties: {
		defaults: { type: 'object' }
	},
	additonalProperties: true,
	required: [ 'defaults' ]
};
