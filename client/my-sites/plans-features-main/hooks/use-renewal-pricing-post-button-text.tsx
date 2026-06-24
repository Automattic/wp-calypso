import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	type PlanSlug,
} from '@automattic/calypso-products';
import { getRenewalPricingText } from '@automattic/plans-grid-next/src/hooks/data-store/get-renewal-pricing-text';
import { useTranslate } from 'i18n-calypso';
import type { Plans as PlansType } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

interface UseRenewalPricingPostButtonTextProps {
	planSlug: PlanSlug;
	pricing?: PlansType.PricingMetaForGridPlan | null;
	showBillingDescriptionForIncreasedRenewalPrice?: string | null;
	enableCategorisedFeatures?: boolean;
}

export default function useRenewalPricingPostButtonText( {
	planSlug,
	pricing,
	showBillingDescriptionForIncreasedRenewalPrice,
	enableCategorisedFeatures,
}: UseRenewalPricingPostButtonTextProps ): TranslateResult | null {
	const translate = useTranslate();

	if (
		! showBillingDescriptionForIncreasedRenewalPrice ||
		! enableCategorisedFeatures ||
		! pricing
	) {
		return null;
	}

	// Don't show for free or enterprise plans
	if ( isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	return getRenewalPricingText( {
		pricing,
		showBillingDescriptionForIncreasedRenewalPrice,
		translate,
	} );
}
