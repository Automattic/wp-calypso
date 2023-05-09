export const purchaseFlowSchema = {
	type: 'object',
	required: [ 'product_id' ],
	properties: {
		primaryDomain: { type: 'string' },
		productSlugInstalled: { type: 'string' },
		pluginInstallationStatus: { type: 'string' },
	},
};
