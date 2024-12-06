import { isEnabled } from '@automattic/calypso-config';
import {
	getPlanSlugForTermVariant,
	PlanSlug,
	URL_FRIENDLY_TERMS_MAPPING,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { AddOns, Plans } from '@automattic/data-stores';
import { GridPlan } from '@automattic/plans-grid-next';
import useLongerPlanTermDefaultExperiment from './experiments/use-longer-plan-term-default-experiment';
import useCheckPlanAvailabilityForPurchase from './use-check-plan-availability-for-purchase';

const useEligibilityForTermSavingsPriceDisplay = ( {
	gridPlans,
	displayedIntervals,
	coupon,
	siteId,
	storageAddOns,
	isInSignup,
}: {
	gridPlans: GridPlan[];
	displayedIntervals: UrlFriendlyTermType[];
	storageAddOns: ( AddOns.AddOnMeta | null )[] | null;
	coupon?: string;
	siteId?: number | null;
	isInSignup?: boolean;
} ) => {
	const longerPlanTermDefaultExperiment = useLongerPlanTermDefaultExperiment();
	const planSlugs = gridPlans.map( ( { planSlug } ) => planSlug );
	const planSlugsForAllDisplayedIntervals = planSlugs.flatMap(
		( planSlug ) =>
			displayedIntervals
				.map( ( term ) =>
					getPlanSlugForTermVariant( planSlug, URL_FRIENDLY_TERMS_MAPPING[ term ] )
				)
				.filter( ( planSlug ) => planSlug !== undefined ) as PlanSlug[]
	);
	const pricingForAllDisplayedIntervals = Plans.usePricingMetaForGridPlans( {
		planSlugs: planSlugsForAllDisplayedIntervals,
		storageAddOns,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
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
