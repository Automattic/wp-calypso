export const purchaseFlowSchema = {
	type: 'object',
	required: [ 'product_id' ],
	properties: {
		primaryDomain: { type: 'string' },
		productSlugInstalled: { type: 'string' },
		productGroupSlug: { type: 'string' },
		siteTransferStatus: { type: 'string' },
		reasonForSiteTransferStatus: { type: 'string' },
		pluginInstallationStatus: { type: 'string' },
		reasonForPluginInstallationStatus: { type: 'string' },
		isPluginInstalledAlongWithTransfer: { type: 'boolean' },
	},
};
