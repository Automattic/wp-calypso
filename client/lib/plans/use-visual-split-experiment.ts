import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const EXPERIMENT_NAME = 'calypso_plans_page_visual_separation_2025_09';

/**
 * This hook is used to determine if the visual split feature is enabled for a given flow.
 * It should NOT be used within components, only at top level pages.
 *
 * Returns [isLoading, variationName] where variationName can be:
 * - 'control' - existing experience (feature flag disabled)
 * - 'default_websitebuilder' - new visual split experience (feature flag enabled)
 * - future variations can be added here
 */
export const useIsVisualSplitEnabled = ( flowName: string ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const [ isLoading, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: flowName === ONBOARDING_FLOW && isLoggedIn,
	} );

	if ( flowName === ONBOARDING_FLOW ) {
		/**
		 * If the user is not eligible, we'll treat them as if they were in the
		 * holdout/control group so we can provide the existing experience.
		 *
		 * This fallback is necessary because experimentAssignment returns null when the user
		 * is not eligible, and we're using this hook within steps that are used by other flows.
		 */
		const variationName = experimentAssignment?.variationName ?? 'control';

		return [ isLoading, variationName ];
	}

	return [ false, 'control' ];
};
