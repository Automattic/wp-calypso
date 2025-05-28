import { useQuery } from './use-query';

export function useMvpOnboardingExperiment() {
	const hasPlaygroundId = useQuery().has( 'playground' );

	return [ false, ! hasPlaygroundId ];
}

export async function isMvpOnboardingExperiment() {
	const params = new URLSearchParams( window.location.search );
	const hasPlaygroundId = params.has( 'playground' );

	if ( hasPlaygroundId ) {
		return false;
	}

	return true;
}
