import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
import type { CalypsoDispatch } from 'calypso/state/types';

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
		/** Custom steps for the bundle. Empty string if it has not custom steps. */
		customSteps: StepperStep[];
		/** Customize back function only for custom steps of the flow. The default steps have their logic separately. It returns `false` if nothing should be done here. */
		goBack?: ( currentStep: string, navigate: Navigate< StepperStep[] > ) => boolean | void;
		/** Custom end of flow. Notice that it can end earlier depending on the current state. It returns `false` if nothing should be done here. */
		endFlow?: ( {
			intent,
			storeType,
			adminUrl,
			dispatch,
			exitFlow,
		}: {
			intent: string;
			storeType: string;
			adminUrl: string;
			dispatch: CalypsoDispatch;
			exitFlow: ( to: string ) => void;
		} ) => boolean | void;
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
		endFlow: ( { intent, storeType, adminUrl, dispatch, exitFlow } ) => {
			if ( intent === 'sell' && storeType === 'power' ) {
				dispatch( recordTracksEvent( 'calypso_woocommerce_dashboard_redirect' ) );

				return exitFlow( `${ adminUrl }admin.php?page=wc-admin` );
			}

			return false;
		},
		checkForActivePlugins: [ 'woocommerce' ],
	},
	sensei: {
		customSteps: [],
		checkForActivePlugins: [ 'sensei-lms' ],
		endFlow: ( { adminUrl, exitFlow } ) => {
			return exitFlow( `${ adminUrl }admin.php?page=sensei_setup_wizard` );
		},
	},
};

export type BundledPlugin = keyof typeof bundleStepsSettings & string;
