import {
	PlanSlug,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
	getPlanMultipleTermsVariantSlugs,
	getPlanSlugForTermVariant,
	isMonthly,
	isWpComPlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { UsePricingMetaForGridPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

/**
 * Calculate the maximum discount for each term for a given set of plans
 * @param plans plans considered
 * @param urlFriendlyTerms terms calculated for
 * @param usePricingMetaForGridPlans price calculation hook
 * @returns A map of term to maximum discount
 */
export default function useMaxDiscountsForPlanTerms(
	plans: PlanSlug[],
	urlFriendlyTerms: UrlFriendlyTermType[] = [],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans,
	selectedSiteId?: number | null
): Record< UrlFriendlyTermType, number > {
	const termDefinitionsMapping = urlFriendlyTerms.map( ( urlFriendlyTerm ) => ( {
		urlFriendlyTerm,
		term: URL_FRIENDLY_TERMS_MAPPING[ urlFriendlyTerm ],
	} ) );
	const terms = termDefinitionsMapping.map( ( { term } ) => term );

	const allRelatedPlanSlugs = plans
		.filter( ( planSlug ) => ! isWpcomEnterpriseGridPlan( planSlug ) )
		.map( ( plan ) => getPlanMultipleTermsVariantSlugs( plan, terms ) )
		.flat()
		.filter( Boolean )
		.filter( isWpComPlan ) as PlanSlug[];

	const wpcomMonthlyPlanSlugs = allRelatedPlanSlugs.filter( isMonthly );
	const wpcomNonMonthlyPlans = allRelatedPlanSlugs.filter(
		( planSlug ) => ! isMonthly( planSlug )
	);

	// TODO clk pricing
	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlanSlugs,
		withoutProRatedCredits: true,
		storageAddOns: null,
		selectedSiteId,
		coupon: undefined,
	} );
	// TODO clk pricing
	const nonMonthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomNonMonthlyPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
		selectedSiteId,
		coupon: undefined,
	} );

	const getTermInMonths = ( term: UrlFriendlyTermType ): number => {
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

	const termWiseMaxDiscount: Record< UrlFriendlyTermType, number > = {} as Record<
		UrlFriendlyTermType,
		number
	>;
	termDefinitionsMapping.forEach( ( termMapping ) => {
		const termDiscounts = wpcomMonthlyPlanSlugs.map( ( monthlyPlanSlug ) => {
			const monthlyPlanPricing = monthlyPlansPricing?.[ monthlyPlanSlug ];
			const monthlyPlanCost = monthlyPlanPricing?.originalPrice.full;
			if ( ! monthlyPlanCost ) {
				return 0;
			}

			/**
			 * Calculate the monthly cost of the term price
			 */
			const variantPlanSlug = getPlanSlugForTermVariant( monthlyPlanSlug, termMapping.term ) ?? '';
			const variantPlanPricing = nonMonthlyPlansPricing?.[ variantPlanSlug ];
			const variantTermPrice =
				variantPlanPricing?.discountedPrice?.full || variantPlanPricing?.originalPrice?.full || 0;
			if ( ! variantTermPrice ) {
				return 0;
			}
			const variantTermInMonths = getTermInMonths( termMapping.urlFriendlyTerm );
			const variantTermMonthlyCost = variantTermPrice / variantTermInMonths;

			return Math.floor( ( ( monthlyPlanCost - variantTermMonthlyCost ) * 100 ) / monthlyPlanCost );
		} );
		termWiseMaxDiscount[ termMapping.urlFriendlyTerm ] = termDiscounts.length
			? Math.max( ...termDiscounts )
			: 0;
	} );

	return termWiseMaxDiscount;
}
