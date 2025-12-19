import {
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	type PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import type { Plans as PlansType } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

interface UseRenewalPricingPostButtonTextProps {
	planSlug: PlanSlug;
	pricing?: PlansType.PricingMetaForGridPlan | null;
	isMonthlyPlan?: boolean;
	coupon?: string;
	siteId?: number | null;
	useCheckPlanAvailabilityForPurchase: PlansType.UseCheckPlanAvailabilityForPurchase;
}

export default function useRenewalPricingPostButtonText( {
	planSlug,
	pricing,
	isMonthlyPlan,
	coupon,
	siteId,
	useCheckPlanAvailabilityForPurchase,
}: UseRenewalPricingPostButtonTextProps ): TranslateResult | null {
	const translate = useTranslate();
	const {
		renewalPricingVariation,
		enableCategorisedFeatures,
		reflectStorageSelectionInPlanPrices,
	} = usePlansGridContext();

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

	// Only show in FeaturesGrid (when enableCategorisedFeatures is true) and when in experiment
	if ( ! renewalPricingVariation || ! enableCategorisedFeatures || ! pricing ) {
		return null;
	}

	const { currencyCode, discountedPrice, originalPrice, billingPeriod, introOffer } = pricing;

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
			: yearlyVariantPricing.originalPrice?.monthly;

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

	// Don't show for free or enterprise plans
	if ( isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	const monthlyPrice = originalPrice?.monthly;
	const currentFullPrice =
		introOffer?.rawPrice?.full || discountedPrice?.full || originalPrice?.full;

	if ( ! monthlyPrice || ! currencyCode || ! currentFullPrice ) {
		return null;
	}

	const formattedMonthlyPrice = formatCurrency( monthlyPrice, currencyCode, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	const formattedFullPrice = formatCurrency( currentFullPrice, currencyCode, {
		stripZeros: true,
		isSmallestUnit: true,
	} );

	// Determine the billing period in months
	let billingMonths = 12; // default to annual

	if ( billingPeriod === PLAN_BIENNIAL_PERIOD ) {
		billingMonths = 24;
	} else if ( billingPeriod === PLAN_TRIENNIAL_PERIOD ) {
		billingMonths = 36;
	} else if ( billingPeriod === PLAN_ANNUAL_PERIOD ) {
		billingMonths = 12;
	}

	// Different text based on variation
	if ( renewalPricingVariation === 'crossed_price' ) {
		return translate( 'Auto-renews at %(price)s per month. Billed every %(months)s months.', {
			args: {
				price: formattedMonthlyPrice,
				months: billingMonths,
			},
			comment:
				'%(price)s is a formatted price like $10, %(months)s is the billing period in months (12, 24, or 36)',
		} );
	} else if ( renewalPricingVariation === 'no_crossed_price' ) {
		return translate(
			'Get %(months)s months for %(fullPrice)s. Auto-renews at %(price)s per month.',
			{
				args: {
					months: billingMonths,
					fullPrice: formattedFullPrice,
					price: formattedMonthlyPrice,
				},
				comment:
					'%(months)s is the billing period (12, 24, or 36), %(fullPrice)s is the current/intro total price like $100, %(price)s is the renewal monthly price like $12',
			}
		);
	}

	return null;
}
