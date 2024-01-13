import {
	PlanSlug,
	TERM_ANNUALLY,
	getPlanSlugForTermVariant,
	isMonthly,
	isWpComPlan,
} from '@automattic/calypso-products';
import { useState } from '@wordpress/element';
import { UseCheckPlanAvailabilityForPurchase } from 'calypso/my-sites/plans-features-main/hooks/data-store/use-pricing-meta-for-grid-plans';
import { UsePricingMetaForGridPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export default function useMaxDiscount(
	plans: PlanSlug[],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans,
	useCheckPlanAvailabilityForPurchase: UseCheckPlanAvailabilityForPurchase,
	selectedSiteId?: number | null
): number {
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );
	const yearlyVariantPlanSlugs = wpcomMonthlyPlans
		.map( ( planSlug ) => getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY ) )
		.filter( Boolean ) as PlanSlug[];

	// TODO clk pricing
	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlans,
		withoutProRatedCredits: true,
		selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} );
	// TODO clk pricing
	const yearlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlugs,
		withoutProRatedCredits: true,
		selectedSiteId,
		coupon: undefined,
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
