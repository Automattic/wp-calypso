import { isEnabled } from '@automattic/calypso-config';
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
import useLongerPlanTermDefaultExperiment from './experiments/use-longer-plan-term-default-experiment';
import useCheckPlanAvailabilityForPurchase from './use-check-plan-availability-for-purchase';

const useEligibilityForTermSavingsPriceDisplay = ( {
	hiddenPlans,
	intent,
	isSubdomainNotGenerated,
	selectedPlan,
	term,
	displayedIntervals,
	coupon,
	siteId,
	isInSignup,
}: {
	hiddenPlans?: HiddenPlans;
	intent?: PlansIntent;
	isSubdomainNotGenerated?: boolean;
	selectedPlan?: PlanSlug;
	term: ( typeof TERMS_LIST )[ number ];
	displayedIntervals: UrlFriendlyTermType[];
	coupon?: string;
	siteId?: number | null;
	isInSignup?: boolean;
} ) => {
	const longerPlanTermDefaultExperiment = useLongerPlanTermDefaultExperiment();
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

	if ( isAnyGridPlanDiscounted ) {
		return false;
	}

	return (
		( isEnabled( 'plans/term-savings-price-display' ) ||
			longerPlanTermDefaultExperiment.isEligibleForTermSavings ) &&
		isInSignup
	);
};

export default useEligibilityForTermSavingsPriceDisplay;
