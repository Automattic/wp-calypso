import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const isDomainSearchV2Enabled = config.isEnabled( 'domains/ui-redesign' );

const EXPERIMENT_NAME = 'calypso_signup_onboarding_domain_search_redesign_202508_v2';

/**
 * This hook is used to determine if the domain search redesign is enabled for a given flow.
 * It should NOT be used within components, only at top level pages.
 */
export const useIsDomainSearchV2Enabled = ( flowName: string ) => {
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

		return [ isLoading, variationName === 'treatment' ];
	}

	return [ false, isDomainSearchV2Enabled ];
};
