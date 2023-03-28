import { StepperStep } from './internals/types';

const pluginBundleSteps: Record< string, StepperStep[] > = {
	'woo-on-plans': [
		{
			slug: 'checkForWoo',
			component: () => import( './internals/steps-repository/check-for-woo' ),
		},
		{
			slug: 'storeAddress',
			component: () => import( './internals/steps-repository/store-address' ),
		},
		{
			slug: 'businessInfo',
			component: () => import( './internals/steps-repository/business-info' ),
		},
		{ slug: 'wooConfirm', component: () => import( './internals/steps-repository/woo-confirm' ) },
		{ slug: 'wooTransfer', component: () => import( './internals/steps-repository/woo-transfer' ) },
		{
			slug: 'wooInstallPlugins',
			component: () => import( './internals/steps-repository/woo-install-plugins' ),
		},
		{
			slug: 'processing',
			component: () => import( './internals/steps-repository/processing-step' ),
		},
	],
};

export type BundledPlugin = keyof typeof pluginBundleSteps;

export default pluginBundleSteps;
