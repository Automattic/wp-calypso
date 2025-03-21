import {
	getPlanSlugForTermVariant,
	PlanSlug,
	TERMS_LIST,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import {
	HiddenPlans,
	PlansIntent,
	usePlansFromTypes,
	usePlanTypesWithIntent,
} from '@automattic/plans-grid-next';
import { useExperiment } from 'calypso/lib/explat';
import useCheckPlanAvailabilityForPurchase from './use-check-plan-availability-for-purchase';

const useIsAnyGridPlanDiscounted = ( {
	hiddenPlans,
	intent,
	isSubdomainNotGenerated,
	selectedPlan,
	term,
	displayedIntervals,
	coupon,
	siteId,
}: {
	hiddenPlans?: HiddenPlans;
	intent?: PlansIntent;
	isSubdomainNotGenerated?: boolean;
	selectedPlan?: PlanSlug;
	term: ( typeof TERMS_LIST )[ number ];
	displayedIntervals: UrlFriendlyTermType[];
	coupon?: string;
	siteId?: number | null;
} ) => {
	const availablePlanSlugs = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent,
			selectedPlan,
			siteId,
			hiddenPlans,
			isSubdomainNotGenerated,
		} ),
		term,
		intent,
	} );
	const planSlugsForAllDisplayedIntervals = availablePlanSlugs.flatMap(
		( planSlug ) =>
			displayedIntervals
				.map( ( term ) =>
					getPlanSlugForTermVariant( planSlug, URL_FRIENDLY_TERMS_MAPPING[ term ] )
				)
				.filter( ( planSlug ) => planSlug !== undefined ) as PlanSlug[]
	);
	const pricingForAllDisplayedIntervals = Plans.usePricingMetaForGridPlans( {
		planSlugs: planSlugsForAllDisplayedIntervals,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		reflectStorageSelectionInPlanPrices: true,
	} );
	const isAnyGridPlanDiscounted = Object.values( pricingForAllDisplayedIntervals ?? {} ).reduce(
		( isDiscounted, { discountedPrice, introOffer } ) => {
			const hasDiscount =
				'number' === typeof discountedPrice.monthly ||
				( introOffer && ! introOffer.isOfferComplete );
			return isDiscounted || !! hasDiscount;
		},
		false
	);

	return isAnyGridPlanDiscounted;
};

const useEligibilityForTermSavingsPriceDisplay = ( {
	hiddenPlans,
	intent,
	isSubdomainNotGenerated,
	selectedPlan,
	term,
	displayedIntervals,
	coupon,
	siteId,
}: {
	hiddenPlans?: HiddenPlans;
	intent?: PlansIntent;
	isSubdomainNotGenerated?: boolean;
	selectedPlan?: PlanSlug;
	term: ( typeof TERMS_LIST )[ number ];
	displayedIntervals: UrlFriendlyTermType[];
	coupon?: string;
	siteId?: number | null;
} ) => {
	const isAnyGridPlanDiscounted = useIsAnyGridPlanDiscounted( {
		hiddenPlans,
		intent,
		isSubdomainNotGenerated,
		selectedPlan,
		term,
		displayedIntervals,
		coupon,
		siteId,
	} );

	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_plans_page_emphasize_longer_term_savings_20250320',
		{
			isEligible: ! isAnyGridPlanDiscounted,
		}
	);

	return {
		isEligibleForTermSavingsPriceDisplay: experimentAssignment?.variationName === 'treatment',
		isLoading,
	};
};

export default useEligibilityForTermSavingsPriceDisplay;
