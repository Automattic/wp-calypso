import { type PlanSlug, PLAN_FREE } from '@automattic/calypso-products';
import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { useSelect } from '@wordpress/data';
import { usePlansGridContext } from '../grid-context';
import useIsLargeCurrency from '../hooks/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../hooks/use-plan-pricing-info-from-grid-plans';
import PlanButton from './plan-button';
import type { GridPlan, PlanActionOverrides } from '../types';

type PlanFeaturesActionsButtonProps = {
	availableForPurchase: boolean;
	currentSitePlanSlug?: string | null;
	isPopular?: boolean;
	isInSignup?: boolean;
	isMonthlyPlan?: boolean;
	planSlug: PlanSlug;
	buttonText?: string;
	planActionOverrides?: PlanActionOverrides;
	showMonthlyPrice: boolean;
	isStuck: boolean;
	visibleGridPlans: GridPlan[];
};

const PlanFeatures2023GridActions = ( {
	planSlug,
	currentSitePlanSlug,
	visibleGridPlans,
	availableForPurchase,
	isStuck,
	isInSignup,
	isMonthlyPlan,
}: PlanFeaturesActionsButtonProps ) => {
	const {
		gridPlansIndex,
		siteId,
		helpers: { useAction },
	} = usePlansGridContext();
	const {
		current,
		planTitle,
		pricing: { billingPeriod, currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
		cartItemForPlan,
	} = gridPlansIndex[ planSlug ];
	const currentPlanBillingPeriod = currentSitePlanSlug
		? gridPlansIndex[ currentSitePlanSlug ]?.pricing.billingPeriod
		: undefined;
	const { prices } = usePlanPricingInfoFromGridPlans( {
		gridPlans: visibleGridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug ]
	);
	const selectedStorageAddOn = storageAddOns?.find( ( addOn ) => {
		return selectedStorageOptionForPlan && addOn
			? addOn.addOnSlug === selectedStorageOptionForPlan
			: false;
	} );

	const priceString = formatCurrency(
		( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
		currencyCode || 'USD',
		{
			stripZeros: true,
			isSmallestUnit: true,
		}
	);

	const {
		primary: { callback, text, status, variant },
		postButtonText,
	} = useAction( {
		availableForPurchase,
		billingPeriod,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
		cartItemForPlan,
		currentPlanBillingPeriod,
		selectedStorageAddOn,
		isMonthlyPlan,
	} );
	const {
		primary: { callback: freeTrialCallback, text: freeTrialText },
	} = useAction( {
		billingPeriod,
		isFreeTrialAction: true,
		isLargeCurrency,
		isStuck,
		// TODO: Unsure about using free plan as a fallback. We should revisit.
		planSlug: freeTrialPlanSlug ?? PLAN_FREE,
		planTitle,
		priceString,
		cartItemForPlan: { product_slug: freeTrialPlanSlug ?? PLAN_FREE },
		currentPlanBillingPeriod,
		selectedStorageAddOn,
		isMonthlyPlan,
	} );

	if ( ! callback ) {
		return null;
	}

	let actionButton = (
		<>
			<PlanButton
				planSlug={ planSlug }
				disabled={ ! callback || 'disabled' === status }
				classes={ variant === 'secondary' ? 'is-secondary' : '' }
				{ ...( callback && { onClick: callback } ) }
			>
				{ text }
			</PlanButton>
			{ postButtonText && (
				<span className="plan-features-2023-grid__actions-post-button-text">
					{ postButtonText }
				</span>
			) }
		</>
	);

	const hasFreeTrialPlan = isInSignup ? !! freeTrialPlanSlug : false;

	if ( ( availableForPurchase || current ) && hasFreeTrialPlan ) {
		actionButton = (
			<div className="plan-features-2023-grid__multiple-actions-container">
				<PlanButton
					planSlug={ planSlug }
					{ ...( freeTrialCallback && { onClick: freeTrialCallback } ) }
				>
					{ freeTrialText }
				</PlanButton>
				{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
					<PlanButton planSlug={ planSlug } { ...( callback && { onClick: callback } ) } borderless>
						{ text }
					</PlanButton>
				) }
			</div>
		);
	}

	return (
		<div className="plan-features-2023-grid__actions">
			<div className="plan-features-2023-grid__actions-buttons">{ actionButton }</div>
		</div>
	);
};

export default PlanFeatures2023GridActions;
