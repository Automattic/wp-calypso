import config from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import type { DataResponse } from '@automattic/plans-grid-next';

function useRefundPeriodInSignupHeaderBanner( flowName?: string | null ): DataResponse< boolean > {
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_signup_onboarding_emphasize_14d_refund',
		{
			isEligible: flowName === 'onboarding',
		}
	);

	if ( config.isEnabled( 'onboarding/emphasize-refund-period-in-plans-step' ) ) {
		return {
			isLoading: false,
			result: true,
		};
	}

	return {
		isLoading,
		result: experimentAssignment?.variationName === 'treatment',
	};
}

export default useRefundPeriodInSignupHeaderBanner;
