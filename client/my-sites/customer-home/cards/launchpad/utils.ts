import { useGoalsFirstCumulativeExperience } from 'calypso/data/experiment/use-goals-first-cumulative-experience';

export function useLaunchpadContext() {
	const [ isLoading, isCumulative ] = useGoalsFirstCumulativeExperience();
	if ( isLoading ) {
		return null;
	}

	return isCumulative ? 'customer-home-treatment-cumulative' : 'customer-home';
}
