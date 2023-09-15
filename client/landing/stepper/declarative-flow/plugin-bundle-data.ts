import BusinessInfo from './internals/steps-repository/business-info';
import CheckForWoo from './internals/steps-repository/check-for-woo';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep from './internals/steps-repository/processing-step';
import StoreAddress from './internals/steps-repository/store-address';
import WooConfirm from './internals/steps-repository/woo-confirm';
import WooInstallPlugins from './internals/steps-repository/woo-install-plugins';
import WooTransfer from './internals/steps-repository/woo-transfer';
import { StepperStep } from './internals/types';

const pluginBundleSteps: Record< string, StepperStep[] > = {
	'woo-on-plans': [
		{ slug: 'checkForWoo', component: CheckForWoo },
		{ slug: 'storeAddress', component: StoreAddress },
		{ slug: 'businessInfo', component: BusinessInfo },
		{ slug: 'wooConfirm', component: WooConfirm },
		{ slug: 'wooTransfer', component: WooTransfer },
		{ slug: 'wooInstallPlugins', component: WooInstallPlugins },
		{ slug: 'processing', component: ProcessingStep },
		{ slug: 'error', component: ErrorStep },
	],
};

export type BundledPlugin = keyof typeof pluginBundleSteps;

export default pluginBundleSteps;
