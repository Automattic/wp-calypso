import {
	type PlanSlug,
	TERM_ANNUALLY,
	getPlanSlugForTermVariant,
	isMonthly,
	isWpComPlan,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useState } from '@wordpress/element';

export default function useMaxDiscount(
	plans: PlanSlug[],
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase,
	selectedSiteId?: number | null,
	coupon?: string
): number {
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );
	const yearlyVariantPlanSlugs = wpcomMonthlyPlans
		.map( ( planSlug ) => getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY ) )
		.filter( Boolean ) as PlanSlug[];
	const monthlyPlansPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlans,
		withoutPlanUpgradeCredits: true,
		selectedSiteId,
		coupon,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} );
	const yearlyPlansPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlugs,
		withoutPlanUpgradeCredits: true,
		selectedSiteId,
		coupon,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} );

	const discounts = wpcomMonthlyPlans.map( ( planSlug ) => {
		const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );

		if ( ! yearlyVariantPlanSlug ) {
			return 0;
		}

		const monthlyPlanAnnualCost =
			( monthlyPlansPricing?.[ planSlug ]?.originalPrice.full ?? 0 ) * 12;

		if ( ! monthlyPlanAnnualCost ) {
			return 0;
		}

		const yearlyPlanAnnualCost =
			yearlyPlansPricing?.[ yearlyVariantPlanSlug ]?.discountedPrice.full ||
			yearlyPlansPricing?.[ yearlyVariantPlanSlug ]?.originalPrice.full ||
			0;

		return Math.floor(
			( ( monthlyPlanAnnualCost - yearlyPlanAnnualCost ) / ( monthlyPlanAnnualCost || 1 ) ) * 100
		);
	} );
	const currentMaxDiscount = discounts.length ? Math.max( ...discounts ) : 0;

	if ( currentMaxDiscount > 0 && currentMaxDiscount !== maxDiscount ) {
		setMaxDiscount( currentMaxDiscount );
	}

	return currentMaxDiscount || maxDiscount;
}
