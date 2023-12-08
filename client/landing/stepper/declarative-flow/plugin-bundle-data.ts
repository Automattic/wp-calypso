import BundleConfirm from './internals/steps-repository/bundle-confirm';
import BundleInstallPlugins from './internals/steps-repository/bundle-install-plugins';
import BundleTransfer from './internals/steps-repository/bundle-transfer';
import BusinessInfo from './internals/steps-repository/business-info';
import CheckForPlugins from './internals/steps-repository/check-for-plugins';
import ErrorStep from './internals/steps-repository/error-step';
import GetCurrentThemeSoftwareSets from './internals/steps-repository/get-current-theme-software-sets';
import ProcessingStep from './internals/steps-repository/processing-step';
import StoreAddress from './internals/steps-repository/store-address';
import type { StepperStep, Navigate } from './internals/types';

/**
 * First steps that will always run, regardless of the plugin bundle being registered here or not.
 */
export const initialBundleSteps: StepperStep[] = [
	{
		slug: 'getCurrentThemeSoftwareSets',
		component: GetCurrentThemeSoftwareSets,
	},
];

/**
 * Steps that will run before the custom bundle steps.
 */
export const beforeCustomBundleSteps: StepperStep[] = [
	{ slug: 'checkForPlugins', component: CheckForPlugins },
];

/**
 * Steps that will run after the custom bundle steps.
 */
export const afterCustomBundleSteps: StepperStep[] = [
	{ slug: 'bundleConfirm', component: BundleConfirm },
	{ slug: 'bundleTransfer', component: BundleTransfer },
	{ slug: 'bundleInstallPlugins', component: BundleInstallPlugins },
	{ slug: 'processing', component: ProcessingStep },
	{ slug: 'error', component: ErrorStep },
];

interface BundleStepsSettings {
	[ key: string ]: {
		customSteps: StepperStep[];
		goBack: ( currentStep: string, navigate: Navigate< StepperStep[] > ) => boolean | void;
		checkForActivePlugins: string[];
	};
}

/**
 * Steps settings for each plugin bundle.
 */
export const bundleStepsSettings: BundleStepsSettings = {
	'woo-on-plans': {
		customSteps: [
			{ slug: 'storeAddress', component: StoreAddress },
			{ slug: 'businessInfo', component: BusinessInfo },
		],
		/** It needs to be customized only for custom steps of the flow. The default steps have their logic already. */
		goBack: ( currentStep, navigate ) => {
			switch ( currentStep ) {
				case 'businessInfo':
					return navigate( 'storeAddress' );

				case 'bundleConfirm':
					return navigate( 'businessInfo' );

				default:
					return false;
			}
		},
		checkForActivePlugins: [ 'woocommerce' ],
	},
};

export type BundledPlugin = keyof typeof bundleStepsSettings;
