import { TYPE_BUSINESS, PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { useMemo } from 'react';
import type { UseFreeTrialPlanSlugs } from '@automattic/plans-grid-next/src/hooks/data-store/use-grid-plans';

export const useFreeTrialPlanSlugs: UseFreeTrialPlanSlugs = ( {
	intent,
	eligibleForFreeHostingTrial,
} ) => {
	return useMemo( () => {
		const freeTrialSlugs: ReturnType< UseFreeTrialPlanSlugs > = {};

		if ( intent === 'plans-new-hosted-site' && eligibleForFreeHostingTrial ) {
			freeTrialSlugs[ TYPE_BUSINESS ] = PLAN_HOSTING_TRIAL_MONTHLY;
			// Disable free hosting trials - see pMz3w-k4H-p2#comment-119368
			delete freeTrialSlugs[ TYPE_BUSINESS ];
		}

		return freeTrialSlugs;
	}, [ eligibleForFreeHostingTrial, intent ] );
};
