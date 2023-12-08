import {
	PlanSlug,
	TERM_ANNUALLY,
	getPlanSlugForTermVariant,
	isMonthly,
	isWpComPlan,
} from '@automattic/calypso-products';
import { useState } from '@wordpress/element';
import { UsePricingMetaForGridPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export default function useMaxDiscount(
	plans: PlanSlug[],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans
): number {
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );
	const yearlyVariantPlanSlugs = wpcomMonthlyPlans
		.map( ( planSlug ) => getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY ) )
		.filter( Boolean ) as PlanSlug[];

	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );
	const yearlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlugs,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );

	const discounts = wpcomMonthlyPlans.map( ( planSlug ) => {
		const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );
		const monthlyPlanSlug = monthlyPlansPricing?.[ planSlug ];
		if ( ! yearlyVariantPlanSlug ) {
			return 0;
		}

		const monthlyPlanAnnualCost = ( monthlyPlanSlug?.originalPrice.full ?? 0 ) * 12;

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
