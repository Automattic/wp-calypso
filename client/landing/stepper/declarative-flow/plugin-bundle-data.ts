const pluginBundleSteps = {
	'woo-on-plans': [
		'storeAddress',
		'businessInfo',
		'wooConfirm',
		'wooTransfer',
		'wooInstallPlugins',
		'processing',
	],
};

export type BundledPlugin = keyof typeof pluginBundleSteps;

export default pluginBundleSteps;
