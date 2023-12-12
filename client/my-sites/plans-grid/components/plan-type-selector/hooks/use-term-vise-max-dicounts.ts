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

export default function useMaxDiscountsForPlanTerms(
	plans: PlanSlug[],
	urlFriendlyTerms: UrlFriendlyTermType[] = [],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans
): Record< UrlFriendlyTermType, number > {
	const termDefinitionsMapping = urlFriendlyTerms.map( ( urlFriendlyTerm ) => ( {
		urlFriendlyTerm,
		term: URL_FRIENDLY_TERMS_MAPPING[ urlFriendlyTerm ],
	} ) );
	const terms = termDefinitionsMapping.map( ( { term } ) => term );
	if ( terms.length !== urlFriendlyTerms.length ) {
		throw new Error( 'Invalid term passed in:' + JSON.stringify( urlFriendlyTerms ) );
	}

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

	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlanSlugs,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );
	const nonMonthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomNonMonthlyPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
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
			const variantPlanSlug = getPlanSlugForTermVariant( monthlyPlanSlug, termMapping.term );
			if ( ! variantPlanSlug ) {
				return 0;
			}

			const monthlyPlanPricing = monthlyPlansPricing?.[ monthlyPlanSlug ];
			const variantPlanPricing = nonMonthlyPlansPricing?.[ variantPlanSlug ];

			const monthlyPlanCost = monthlyPlanPricing?.originalPrice.full;

			if ( ! monthlyPlanCost || ! variantPlanPricing ) {
				return 0;
			}

			const variantTermPrice =
				variantPlanPricing.discountedPrice.full || variantPlanPricing.originalPrice.full || 0;
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
