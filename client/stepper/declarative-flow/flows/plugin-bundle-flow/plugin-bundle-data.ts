import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { STEPS } from '../../internals/steps';
import type { StepperStep, Navigate } from '../../internals/types';
import type { CalypsoDispatch } from 'calypso/state/types';

/**
 * First steps that will always run, regardless of the plugin bundle being registered here or not.
 */
export const initialBundleSteps: StepperStep[] = [ STEPS.GET_CURRENT_THEME_SOFTWARE_SETS ];

/**
 * Steps that will run before the custom bundle steps.
 */
export const beforeCustomBundleSteps: StepperStep[] = [ STEPS.CHECK_FOR_PLUGINS ];

/**
 * Steps that will run after the custom bundle steps.
 */
export const afterCustomBundleSteps: StepperStep[] = [
	STEPS.BUNDLE_CONFIRM,
	STEPS.BUNDLE_TRANSFER,
	STEPS.BUNDLE_INSTALL_PLUGINS,
	STEPS.PROCESSING,
	STEPS.ERROR,
];

interface BundleStepsSettings {
	[ key: string ]: {
		/** Custom steps for the bundle. Empty string if it has not custom steps. */
		customSteps: StepperStep[];
		/** Customize back function only for custom steps of the flow. The default steps have their logic separately. It returns `false` if nothing should be done here. */
		goBack?: ( currentStep: string, navigate: Navigate ) => boolean | void;
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
		customSteps: [ STEPS.STORE_ADDRESS, STEPS.BUSINESS_INFO ],
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
