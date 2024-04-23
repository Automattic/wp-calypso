import config from '@automattic/calypso-config';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Props {
	flowName?: string | null;
}

function useExperimentForTrailMap( { flowName }: Props ): DataResponse< boolean > {
	return {
		isLoading: false,
		result: config.isEnabled( 'onboarding/trail-map-feature-grid' ) && flowName === 'onboarding',
	};
}

export default useExperimentForTrailMap;
