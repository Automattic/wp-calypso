import { isEnabled } from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';

export function useFreeHostingTrialAssignment(): {
	isLoadingHostingTrialExperiment: boolean;
	isAssignedToHostingTrialExperiment: boolean;
} {
	const [ isLoadingHostingTrialExperiment, experimentAssignment ] = useExperiment(
		'wpcom_hosting_business_plan_free_trial',
		{
			isEligible: ! isEnabled( 'plans/hosting-trial' ),
		}
	);

	if ( isEnabled( 'plans/hosting-trial' ) ) {
		return {
			isLoadingHostingTrialExperiment: false,

			// The plans/hosting-trial flag forces the user to be treated as if they're in the treatment group.
			isAssignedToHostingTrialExperiment: true,
		};
	}

	return {
		isLoadingHostingTrialExperiment,
		isAssignedToHostingTrialExperiment: experimentAssignment?.variationName === 'treatment',
	};
}
