import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_rsm_better_checkout';
const QUERY_PARAM = 'rsm_better_checkout';

export function useRsmBetterCheckoutExperiment(): boolean {
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME );
	const searchParams = new URLSearchParams( window.location.search );
	if ( searchParams.get( QUERY_PARAM ) === '1' ) {
		return true;
	}
	return assignment?.variationName === 'treatment';
}
