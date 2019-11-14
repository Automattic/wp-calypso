/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */
import isJetpackOnboardingStepCompleted from 'state/selectors/is-jetpack-onboarding-step-completed';

/**
 * Returns the Jetpack onboarding progress of a site for the specified steps.
 *
 * @param  {Object}   state   Global state tree.
 * @param  {Integer}  siteId  Unconnected site ID.
 * @param  {Array}    steps   Array of steps to retrieve onboarding progress for.
 * @return {Object}           An object containing all steps and whether each of them has been completed.
 */
export default function getJetpackOnboardingCompletedSteps( state, siteId, steps ) {
	return reduce(
		steps,
		( result, stepName ) => {
			result[ stepName ] = isJetpackOnboardingStepCompleted( state, siteId, stepName );
			return result;
		},
		{}
	);
}
