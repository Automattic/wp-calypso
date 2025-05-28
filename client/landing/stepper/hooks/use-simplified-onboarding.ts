import { useQuery } from './use-query';

export function useSimplifiedOnboarding() {
	const hasPlaygroundId = useQuery().has( 'playground' );

	return [ false, ! hasPlaygroundId ];
}

export async function isSimplifiedOnboarding() {
	const params = new URLSearchParams( window.location.search );
	const hasPlaygroundId = params.has( 'playground' );

	if ( hasPlaygroundId ) {
		return false;
	}

	return true;
}
