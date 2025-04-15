import { useExperiment, loadExperimentAssignment } from 'calypso/lib/explat';
import { useIsPlaygroundEligible, isPlaygroundEligible } from './use-is-playground-eligible';

const MVP_ONBOARDING_EXPERIMENT_NAME = 'calypso_onboarding_mvp_20250414';

export function useMvpOnboardingExperiment( location: { search: string } ) {
	const isPlaygroundEligible = useIsPlaygroundEligible();
	const params = new URLSearchParams( location.search );
	const hasPlaygroundId = params.has( 'playground' );

	const [ isLoading, assignment ] = useExperiment( MVP_ONBOARDING_EXPERIMENT_NAME, {
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

	const assignment = await loadExperimentAssignment( MVP_ONBOARDING_EXPERIMENT_NAME );
	return assignment.variationName === 'treatment';
}
