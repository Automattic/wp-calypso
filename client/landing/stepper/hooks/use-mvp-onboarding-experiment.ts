import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';
import { useQuery } from './use-query';

const HOSTING_ONBOARDING_EXPERIMENT_NAME = 'calypso_signup_onboarding_simplified_hosting_flow_v3';

export function useMvpOnboardingExperiment() {
	const hasPlaygroundId = useQuery().has( 'playground' );

	const [ isLoading, assignment ] = useExperiment( HOSTING_ONBOARDING_EXPERIMENT_NAME, {
		isEligible: ! hasPlaygroundId,
	} );

	return [ isLoading, assignment?.variationName === 'treatment' ];
}

export async function isMvpOnboardingExperiment() {
	const params = new URLSearchParams( window.location.search );
	const hasPlaygroundId = params.has( 'playground' );

	if ( hasPlaygroundId ) {
		return false;
	}

	const assignment = await loadExperimentAssignment( HOSTING_ONBOARDING_EXPERIMENT_NAME );
	return assignment.variationName === 'treatment';
}
