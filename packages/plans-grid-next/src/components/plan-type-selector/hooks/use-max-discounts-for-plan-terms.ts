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
import {
	calculateDiscountPercentage,
	fromPricingMetaForGridPlan,
	getPlanPriceForDuration,
} from '../../../lib/plan-pricing-utils';

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
			return;
		}
		const termDiscounts = lowestTermPlanSlugs.map( ( lowestTermPlanSlug ) => {
			const lowestTermPlanPricing = plansPricing?.[ lowestTermPlanSlug ];
			const lowestTermInfo = lowestTermPlanPricing
				? fromPricingMetaForGridPlan( lowestTermPlanPricing )
				: null;
			if ( ! lowestTermInfo ) {
				return 0;
			}

			const variantPlanSlug =
				getPlanSlugForTermVariant( lowestTermPlanSlug, termMapping.term ) ?? '';
			const variantPlanPricing = plansPricing?.[ variantPlanSlug ];
			const variantInfo = variantPlanPricing
				? fromPricingMetaForGridPlan( variantPlanPricing )
				: null;
			if ( ! variantInfo ) {
				return 0;
			}

			return (
				calculateDiscountPercentage(
					getPlanPriceForDuration( lowestTermInfo, variantInfo.termMonths ),
					getPlanPriceForDuration( variantInfo, variantInfo.termMonths )
				) ?? 0
			);
		} );
		termWiseMaxDiscount[ termMapping.urlFriendlyTerm ] = termDiscounts.length
			? Math.max( ...termDiscounts )
			: 0;
	} );

	return termWiseMaxDiscount;
}
