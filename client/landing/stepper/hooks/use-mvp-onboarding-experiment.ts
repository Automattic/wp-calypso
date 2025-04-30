import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';
import { useIsPlaygroundEligible, isPlaygroundEligible } from './use-is-playground-eligible';
import { useQuery } from './use-query';

const HOSTING_ONBOARDING_EXPERIMENT_NAME = 'calypso_signup_onboarding_simplified_hosting_flow_v2';

export function useMvpOnboardingExperiment() {
	const isPlaygroundEligible = useIsPlaygroundEligible();
	const hasPlaygroundId = useQuery().has( 'playground' );

	const [ isLoading, assignment ] = useExperiment( HOSTING_ONBOARDING_EXPERIMENT_NAME, {
		isEligible: ! isPlaygroundEligible || ! hasPlaygroundId,
	} );

	return [ isLoading, assignment?.variationName === 'treatment' ];
}

export async function isMvpOnboardingExperiment() {
	if ( isPlaygroundEligible() ) {
		const params = new URLSearchParams( window.location.search );
		const hasPlaygroundId = params.has( 'playground' );

		if ( hasPlaygroundId ) {
			return false;
		}
	}

	const assignment = await loadExperimentAssignment( HOSTING_ONBOARDING_EXPERIMENT_NAME );
	return assignment.variationName === 'treatment';
}
