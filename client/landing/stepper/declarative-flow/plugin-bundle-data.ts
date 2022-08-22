const pluginBundleSteps = {
	woocommerce: [ 'storeAddress', 'businessInfo', 'wooConfirm', 'processing' ],
};

export type BundledPlugin = keyof typeof pluginBundleSteps;

export default pluginBundleSteps;
