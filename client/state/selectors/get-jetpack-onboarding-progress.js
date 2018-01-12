/** @format */

/**
 * External dependencies
 */
import { reduce, values } from 'lodash';

/**
 * Internal dependencies
 */
import { isJetpackOnboardingStepCompleted } from 'state/selectors';
import { JETPACK_ONBOARDING_STEPS as STEPS } from 'jetpack-onboarding/constants';

export default function getJetpackOnboardingProgress( state, siteId, steps ) {
	if ( ! steps ) {
		steps = values( STEPS );
	}

	return reduce(
		steps,
		( result, stepName ) => {
			result[ stepName ] = isJetpackOnboardingStepCompleted( state, siteId, stepName );
			return result;
		},
		{}
	);
}
