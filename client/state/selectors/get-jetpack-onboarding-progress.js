/** @format */

/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { isJetpackOnboardingStepCompleted } from 'state/selectors';

export default function getJetpackOnboardingProgress( state, siteId, steps ) {
	return reduce(
		steps,
		( result, stepName ) => {
			result[ stepName ] = isJetpackOnboardingStepCompleted( state, siteId, stepName );
			return result;
		},
		{}
	);
}
