import {
	type PlanSlug,
	isP2FreePlan,
	isFreePlan,
	PLAN_FREE,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import useIsLargeCurrency from '../hooks/use-is-large-currency';
import { useManageTooltipToggle } from '../hooks/use-manage-tooltip-toggle';
import { usePlanPricingInfoFromGridPlans } from '../hooks/use-plan-pricing-info-from-grid-plans';
import PlanButton from './plan-button';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import { useDefaultStorageOption } from './shared/storage';
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

const DummyDisabledButton = styled.div`
	background-color: var( --studio-white );
	color: var( --studio-gray-5 );
	box-shadow: inset 0 0 0 1px var( --studio-gray-10 );
	font-weight: 500;
	line-height: 20px;
	border-radius: 4px;
	padding: 10px 14px;
	border: unset;
	text-align: center;
`;

const PlanFeatures2023GridActions = ( {
	planSlug,
	currentSitePlanSlug,
	visibleGridPlans,
	availableForPurchase,
	isStuck,
	isInSignup,
	isMonthlyPlan,
}: PlanFeaturesActionsButtonProps ) => {
	const translate = useTranslate();
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
			? addOn.featureSlugs?.includes( selectedStorageOptionForPlan )
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
		primary: { callback, text, status },
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
	} );

	const busy = isFreePlan( planSlug ) && status === 'blocked';
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();

	const defaultStorageOption = useDefaultStorageOption( { planSlug } );
	const canPurchaseStorageAddOns = storageAddOns?.some(
		( storageAddOn ) => ! storageAddOn?.purchased && ! storageAddOn?.exceedsSiteStorageLimits
	);

	const storageAddOnCheckoutHref = storageAddOns?.find(
		( addOn ) =>
			selectedStorageOptionForPlan && addOn?.featureSlugs?.includes( selectedStorageOptionForPlan )
	)?.checkoutLink;

	const nonDefaultStorageOptionSelected =
		selectedStorageOptionForPlan && defaultStorageOption !== selectedStorageOptionForPlan;

	let actionButton = (
		<Plans2023Tooltip
			text={ translate( 'Please contact support to downgrade your plan.' ) }
			setActiveTooltipId={ setActiveTooltipId }
			activeTooltipId={ activeTooltipId }
			showOnMobile={ false }
			id="downgrade"
		>
			<DummyDisabledButton>{ text }</DummyDisabledButton>
			{ isMobile() && (
				<div className="plan-features-2023-grid__actions-downgrade-context-mobile">
					{ translate( 'Please contact support to downgrade your plan.' ) }
				</div>
			) }
		</Plans2023Tooltip>
	);

	if (
		( isFreePlan( planSlug ) ||
			( storageAddOns && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected ) ) &&
		isP2FreePlan( planSlug ) &&
		current
	) {
		return null;
	}

	if ( availableForPurchase || current || isWpcomEnterpriseGridPlan( planSlug ) ) {
		// TODO: Move the condition below into the useAction hook
		if (
			current &&
			canPurchaseStorageAddOns &&
			nonDefaultStorageOptionSelected &&
			! isMonthlyPlan
		) {
			actionButton = (
				<PlanButton
					planSlug={ planSlug }
					classes="is-storage-upgradeable"
					href={ storageAddOnCheckoutHref }
				>
					{ translate( 'Upgrade' ) }
				</PlanButton>
			);
		} else {
			const hasFreeTrialPlan = isInSignup ? !! freeTrialPlanSlug : false;
			actionButton = hasFreeTrialPlan ? (
				<div className="plan-features-2023-grid__multiple-actions-container">
					<PlanButton planSlug={ planSlug } onClick={ () => freeTrialCallback() } busy={ busy }>
						{ freeTrialText }
					</PlanButton>
					{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
						<PlanButton planSlug={ planSlug } onClick={ callback } borderless>
							{ text }
						</PlanButton>
					) }
				</div>
			) : (
				<>
					<PlanButton
						planSlug={ planSlug }
						disabled={ ! callback || 'disabled' === status }
						onClick={ callback }
						current={ current }
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
		}
	}

	return (
		<div className="plan-features-2023-gridrison__actions">
			<div className="plan-features-2023-gridrison__actions-buttons">{ actionButton }</div>
		</div>
	);
};

export default PlanFeatures2023GridActions;
