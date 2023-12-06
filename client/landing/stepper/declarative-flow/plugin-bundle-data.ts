import BundleConfirm from './internals/steps-repository/bundle-confirm';
import BundleTransfer from './internals/steps-repository/bundle-transfer';
import BusinessInfo from './internals/steps-repository/business-info';
import CheckForPlugins from './internals/steps-repository/check-for-plugins';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep from './internals/steps-repository/processing-step';
import StoreAddress from './internals/steps-repository/store-address';
import WooInstallPlugins from './internals/steps-repository/woo-install-plugins';
import { StepperStep } from './internals/types';

const pluginBundleSteps: Record< string, StepperStep[] > = {
	'woo-on-plans': [
		{ slug: 'checkForPlugins', component: CheckForPlugins },
		{ slug: 'storeAddress', component: StoreAddress },
		{ slug: 'businessInfo', component: BusinessInfo },
		{ slug: 'bundleConfirm', component: BundleConfirm },
		{ slug: 'bundleTransfer', component: BundleTransfer },
		{ slug: 'wooInstallPlugins', component: WooInstallPlugins },
		{ slug: 'processing', component: ProcessingStep },
		{ slug: 'error', component: ErrorStep },
	],
};

export type BundledPlugin = keyof typeof pluginBundleSteps;

export default pluginBundleSteps;
