import { PLAN_HOSTING_TRIAL_MONTHLY, PlanSlug, isBusinessPlan } from '@automattic/calypso-products';
import { isNewHostedSiteCreationFlow } from '@automattic/onboarding';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';

export const useGetFreeTrialSlugForPlan = ( { flowName }: { flowName: string | null } ) => {
	const shouldDisplayFreeHostingTrialCTA = useSelector( isUserEligibleForFreeHostingTrial );

	const getFreeTrialSlugForPlan = useCallback(
		( planSlug: PlanSlug ) => {
			return shouldDisplayFreeHostingTrialCTA &&
				isNewHostedSiteCreationFlow( flowName ) &&
				isBusinessPlan( planSlug )
				? PLAN_HOSTING_TRIAL_MONTHLY
				: undefined;
		},
		[ flowName, shouldDisplayFreeHostingTrialCTA ]
	);

	return getFreeTrialSlugForPlan;
};
