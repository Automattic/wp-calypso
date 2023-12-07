import {
	PlanSlug,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
	getPlanSlugForTermVariant,
	isMonthly,
	isWpComPlan,
} from '@automattic/calypso-products';
import { UsePricingMetaForGridPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export default function useTermDiscounts(
	plans: PlanSlug[],
	terms: UrlFriendlyTermType[],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans
): Record< UrlFriendlyTermType, number > {
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );

	const pricingInfoRequiredPlans = terms
		.map(
			( term ) =>
				wpcomMonthlyPlans
					.map( ( planSlug ) =>
						getPlanSlugForTermVariant( planSlug, URL_FRIENDLY_TERMS_MAPPING[ term ] )
					)
					.filter( Boolean ) as PlanSlug[]
		)
		.flat();
	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );
	const allPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: pricingInfoRequiredPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );

	const termInMonths = ( term: UrlFriendlyTermType ): number => {
		switch ( term ) {
			case '3yearly':
				return 36;
			case '2yearly':
				return 24;
			case 'yearly':
				return 12;
			case 'monthly':
			default:
				return 1;
		}
	};

	const termViseMaxDiscount: Record< UrlFriendlyTermType, number > = {} as Record<
		UrlFriendlyTermType,
		number
	>;
	terms.forEach( ( urlFriendlyTerm: UrlFriendlyTermType ) => {
		const termDiscounts = wpcomMonthlyPlans.map( ( planSlug ) => {
			const variantPlanSlug = getPlanSlugForTermVariant(
				planSlug,
				URL_FRIENDLY_TERMS_MAPPING[ urlFriendlyTerm as UrlFriendlyTermType ]
			);
			const monthlyPlanSlug = monthlyPlansPricing?.[ planSlug ];
			if ( ! variantPlanSlug ) {
				return 0;
			}

			const monthlyPlanAnnualCost =
				( monthlyPlanSlug?.originalPrice.full ?? 0 ) * termInMonths( urlFriendlyTerm );

			if ( ! monthlyPlanAnnualCost ) {
				return 0;
			}

			const yearlyPlanAnnualCost =
				allPlansPricing?.[ variantPlanSlug ]?.discountedPrice.full ||
				allPlansPricing?.[ variantPlanSlug ]?.originalPrice.full ||
				0;

			return Math.floor(
				( ( monthlyPlanAnnualCost - yearlyPlanAnnualCost ) / ( monthlyPlanAnnualCost || 1 ) ) * 100
			);
		} );
		termViseMaxDiscount[ urlFriendlyTerm ] = termDiscounts.length
			? Math.max( ...termDiscounts )
			: 0;
	} );

	return termViseMaxDiscount;
}
