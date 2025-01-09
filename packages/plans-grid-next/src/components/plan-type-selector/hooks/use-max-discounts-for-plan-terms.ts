import {
	type PlanSlug,
	URL_FRIENDLY_TERMS_MAPPING,
	type UrlFriendlyTermType,
	getBillingMonthsForTerm,
	getPlan,
	getPlanMultipleTermsVariantSlugs,
	getPlanSlugForTermVariant,
	isWpComPlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';

/**
 * Calculate the maximum discount for each term for a given set of plans
 * @param plans plans considered
 * @param urlFriendlyTerms terms calculated for
 * @returns A map of term to maximum discount
 */
export default function useMaxDiscountsForPlanTerms(
	plans: PlanSlug[],
	urlFriendlyTerms: UrlFriendlyTermType[] = [],
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase,
	siteId?: number | null
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

	const plansPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: allRelatedPlanSlugs,
		siteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
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
