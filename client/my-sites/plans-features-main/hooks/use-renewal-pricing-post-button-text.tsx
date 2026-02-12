import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	type PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { getRenewalPricingText } from '@automattic/plans-grid-next/src/hooks/data-store/get-renewal-pricing-text';
import { useTranslate } from 'i18n-calypso';
import type { Plans as PlansType } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

interface UseRenewalPricingPostButtonTextProps {
	planSlug: PlanSlug;
	pricing?: PlansType.PricingMetaForGridPlan | null;
	isMonthlyPlan?: boolean;
	coupon?: string;
	siteId?: number | null;
	useCheckPlanAvailabilityForPurchase: PlansType.UseCheckPlanAvailabilityForPurchase;
	showBillingDescriptionForIncreasedRenewalPrice?: string | null;
	enableCategorisedFeatures?: boolean;
	reflectStorageSelectionInPlanPrices?: boolean;
}

export default function useRenewalPricingPostButtonText( {
	planSlug,
	pricing,
	isMonthlyPlan,
	coupon,
	siteId,
	useCheckPlanAvailabilityForPurchase,
	showBillingDescriptionForIncreasedRenewalPrice,
	enableCategorisedFeatures,
	reflectStorageSelectionInPlanPrices,
}: UseRenewalPricingPostButtonTextProps ): TranslateResult | null {
	const translate = useTranslate();

	const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );
	const yearlyVariantPricingData = Plans.usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlug ? [ yearlyVariantPlanSlug ] : [],
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		reflectStorageSelectionInPlanPrices,
	} );
	const yearlyVariantPricing = yearlyVariantPlanSlug
		? yearlyVariantPricingData?.[ yearlyVariantPlanSlug ]
		: null;

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

	const { originalPrice, introOffer } = pricing;

	// For monthly plans, show the savings message
	if (
		isMonthlyPlan &&
		originalPrice?.monthly &&
		yearlyVariantPricing &&
		( ! introOffer || introOffer.isOfferComplete )
	) {
		const yearlyVariantMaybeDiscountedPrice = Number.isFinite(
			yearlyVariantPricing.discountedPrice?.monthly
		)
			? yearlyVariantPricing.discountedPrice?.monthly
			: yearlyVariantPricing.introOffer?.rawPrice?.monthly;

		if (
			yearlyVariantMaybeDiscountedPrice &&
			yearlyVariantMaybeDiscountedPrice < originalPrice.monthly
		) {
			return translate( 'Save %(discountRate)s%% by paying annually', {
				args: {
					discountRate: Math.floor(
						( 100 * ( originalPrice.monthly - yearlyVariantMaybeDiscountedPrice ) ) /
							originalPrice.monthly
					),
				},
			} );
		}

		return null;
	}

	return getRenewalPricingText( {
		pricing,
		showBillingDescriptionForIncreasedRenewalPrice,
		translate,
	} );
}
