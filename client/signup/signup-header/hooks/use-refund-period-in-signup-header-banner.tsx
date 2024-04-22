import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

interface Props {
	flowName?: string | null;
	stepName?: string | null;
}

function useRefundPeriodInSignupHeaderBanner( {
	flowName,
	stepName,
}: Props ): DataResponse< boolean > {
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_emphasize_14d_refund',
		{
			isEligible: flowName === 'onboarding' && stepName === 'plans',
		}
	);

	return {
		isLoading,
		result: experimentAssignment?.variationName === 'treatment',
	};
}

export default useRefundPeriodInSignupHeaderBanner;
