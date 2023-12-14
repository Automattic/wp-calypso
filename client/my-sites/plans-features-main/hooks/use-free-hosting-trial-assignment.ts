import { isEnabled } from '@automattic/calypso-config';
import { useQueryPreferences } from 'calypso/components/data/query-preferences';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import type { PlansIntent } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export function useFreeHostingTrialAssignment( intent: PlansIntent | undefined ): {
	isLoadingHostingTrialExperiment: boolean;
	isAssignedToHostingTrialExperiment: boolean;
} {
	useQueryPreferences();
	const remotePreferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const campaignAssignment = useSelector( ( state ) =>
		getPreference( state, 'hosting-trial-campaign' )
	);

	const isCampaignFlagValid = remotePreferencesLoaded || !! campaignAssignment; // We don't need to wait for the remote value if the preference is truthy; all valid campaign values will be truthy
	const isForcedToTreatment =
		isEnabled( 'plans/hosting-trial' ) || [ 'reddit' ].includes( campaignAssignment );

	const [ isLoadingHostingTrialExperiment, experimentAssignment ] = useExperiment(
		'wpcom_hosting_business_plan_free_trial_v2',
		{
			isEligible:
				intent === 'plans-new-hosted-site' && isCampaignFlagValid && ! isForcedToTreatment,
		}
	);

	const forceToTreatmentResult = {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: intent === 'plans-new-hosted-site',
	};

	if ( isEnabled( 'plans/hosting-trial' ) ) {
		// Special case for the feature flag. This case would also be handled by the `isForcedToTreatment` case below,
		// but we know we don't need to wait for remote preferences to load.
		return forceToTreatmentResult;
	}

	if ( ! isCampaignFlagValid ) {
		return {
			isLoadingHostingTrialExperiment: true,
			isAssignedToHostingTrialExperiment: false,
		};
	}

	if ( isForcedToTreatment ) {
		return forceToTreatmentResult;
	}

	return {
		isLoadingHostingTrialExperiment,
		isAssignedToHostingTrialExperiment: experimentAssignment?.variationName === 'treatment',
	};
}
