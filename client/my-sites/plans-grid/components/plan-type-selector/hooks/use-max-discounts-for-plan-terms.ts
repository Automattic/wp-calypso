import {
	PlanSlug,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
	getBillingMonthsForTerm,
	getPlan,
	getPlanMultipleTermsVariantSlugs,
	getPlanSlugForTermVariant,
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

	const lowestTerm = terms.reduce( ( currentLowestTerm, term ) => {
		return getBillingMonthsForTerm( currentLowestTerm ) <= getBillingMonthsForTerm( term )
			? currentLowestTerm
			: term;
	}, terms[ 0 ] );
	const lowestTermInMonths = getBillingMonthsForTerm( lowestTerm );

	const lowestTermPlanSlugs = allRelatedPlanSlugs.filter(
		( planSlug ) => getPlan( planSlug )?.term === lowestTerm
	);

	// TODO clk pricing
	const plansPricing = usePricingMetaForGridPlans( {
		planSlugs: allRelatedPlanSlugs,
		withoutProRatedCredits: true,
		storageAddOns: null,
		selectedSiteId,
		coupon: undefined,
	} );

	const termWiseMaxDiscount: Record< UrlFriendlyTermType, number > = {} as Record<
		UrlFriendlyTermType,
		number
	>;
	termDefinitionsMapping.forEach( ( termMapping ) => {
		if ( termMapping.term === lowestTerm ) {
			return 0;
		}
		const termDiscounts = lowestTermPlanSlugs.map( ( lowestTermPlanSlug ) => {
			const lowestTermPlanPricing = plansPricing?.[ lowestTermPlanSlug ];
			const lowestTermPlanCost = lowestTermPlanPricing?.originalPrice.full;
			if ( ! lowestTermPlanCost ) {
				return 0;
			}
			const lowestTermMonthlyCost = lowestTermPlanCost / lowestTermInMonths;

			/**
			 * Calculate the monthly cost of the term price
			 */
			const variantPlanSlug =
				getPlanSlugForTermVariant( lowestTermPlanSlug, termMapping.term ) ?? '';
			const variantPlanPricing = plansPricing?.[ variantPlanSlug ];
			const variantTermPrice =
				variantPlanPricing?.discountedPrice?.full || variantPlanPricing?.originalPrice?.full || 0;
			if ( ! variantTermPrice ) {
				return 0;
			}
			const variantTermInMonths = getBillingMonthsForTerm(
				URL_FRIENDLY_TERMS_MAPPING[ termMapping.urlFriendlyTerm ]
			);
			const variantTermMonthlyCost = variantTermPrice / variantTermInMonths;

			return Math.floor(
				( ( lowestTermMonthlyCost - variantTermMonthlyCost ) * 100 ) / lowestTermMonthlyCost
			);
		} );
		termWiseMaxDiscount[ termMapping.urlFriendlyTerm ] = termDiscounts.length
			? Math.max( ...termDiscounts )
			: 0;
	} );

	return termWiseMaxDiscount;
}
