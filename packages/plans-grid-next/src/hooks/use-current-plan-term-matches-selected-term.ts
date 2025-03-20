import {
	getTermDuration,
	URL_FRIENDLY_TERMS_MAPPING,
	PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { SupportedUrlFriendlyTermType } from '../types';

interface Props {
	currentSitePlanSlug: PlanSlug | null | undefined;
	intervalType: string;
	siteId: number | null | undefined;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
}

/**
 * Detemines whether the current plan's billing term matches the selected billing term.
 */
export function useCurrentPlanTermMatchesSelectedTerm( {
	currentSitePlanSlug,
	intervalType,
	siteId,
	useCheckPlanAvailabilityForPurchase,
}: Props ) {
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: currentSitePlanSlug ? [ currentSitePlanSlug ] : [],
		siteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );
	const selectedPlanTerm =
		URL_FRIENDLY_TERMS_MAPPING[ intervalType as SupportedUrlFriendlyTermType ];
	const selectedPlanTermDuration = getTermDuration( selectedPlanTerm );
	const currentPlanTermDuration =
		currentSitePlanSlug && pricingMeta?.[ currentSitePlanSlug ]?.billingPeriod;

	return currentPlanTermDuration === selectedPlanTermDuration;
}
