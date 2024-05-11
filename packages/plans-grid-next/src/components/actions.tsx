import {
	PLAN_P2_FREE,
	type PlanSlug,
	type StorageOption,
	isP2FreePlan,
	isFreePlan,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { PlanPricing, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import useDefaultStorageOption from '../hooks/data-store/use-default-storage-option';
import useSelectedStorageAddOn from '../hooks/data-store/use-selected-storage-add-on';
import useIsLargeCurrency from '../hooks/use-is-large-currency';
import { useManageTooltipToggle } from '../hooks/use-manage-tooltip-toggle';
import { usePlanPricingInfoFromGridPlans } from '../hooks/use-plan-pricing-info-from-grid-plans';
import PlanButton from './plan-button';
import { Plans2023Tooltip } from './plans-2023-tooltip';
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
	storageOptions?: StorageOption[];
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

const PlanFeatureActionButton = ( {
	availableForPurchase,
	disabled,
	freeTrialText,
	hasFreeTrialPlan,
	isMonthlyPlan,
	isStuck,
	onCtaClick,
	onFreeTrialCtaClick,
	planSlug,
	postButtonText,
	status,
	storageOptions,
	text,
}: {
	availableForPurchase?: boolean;
	billingPeriod?: PlanPricing[ 'billPeriod' ];
	currentPlanBillingPeriod?: PlanPricing[ 'billPeriod' ];
	currentSitePlanSlug?: string | null;
	disabled: boolean;
	freeTrialText?: TranslateResult;
	hasFreeTrialPlan: boolean;
	isMonthlyPlan?: boolean;
	isStuck: boolean;
	onCtaClick: () => void;
	onFreeTrialCtaClick: () => void;
	planSlug: PlanSlug;
	postButtonText?: TranslateResult;
	status?: 'disabled' | 'blocked' | 'enabled';
	storageOptions?: StorageOption[];
	text: TranslateResult;
} ) => {
	const busy = isFreePlan( planSlug ) && status === 'blocked';
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const { gridPlansIndex, siteId } = usePlansGridContext();

	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug ]
	);
	const { current, storageAddOnsForPlan } = gridPlansIndex[ planSlug ];
	const defaultStorageOption = useDefaultStorageOption( {
		storageOptions,
		storageAddOnsForPlan,
	} );
	const canPurchaseStorageAddOns = storageAddOnsForPlan?.some(
		( storageAddOn ) => ! storageAddOn?.purchased && ! storageAddOn?.exceedsSiteStorageLimits
	);
	const storageAddOnCheckoutHref = storageAddOnsForPlan?.find(
		( addOn ) =>
			selectedStorageOptionForPlan && addOn?.featureSlugs?.includes( selectedStorageOptionForPlan )
	)?.checkoutLink;
	const nonDefaultStorageOptionSelected = defaultStorageOption !== selectedStorageOptionForPlan;

	if (
		( isFreePlan( planSlug ) ||
			( storageAddOnsForPlan && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected ) ) &&
		isP2FreePlan( planSlug ) &&
		current
	) {
		return null;
	}

	if ( current && planSlug !== PLAN_P2_FREE ) {
		if ( canPurchaseStorageAddOns && nonDefaultStorageOptionSelected && ! isMonthlyPlan ) {
			return (
				<PlanButton
					planSlug={ planSlug }
					classes="is-storage-upgradeable"
					href={ storageAddOnCheckoutHref }
				>
					{ translate( 'Upgrade' ) }
				</PlanButton>
			);
		}
	}

	if ( availableForPurchase || current ) {
		return hasFreeTrialPlan ? (
			<div className="plan-features-2023-grid__multiple-actions-container">
				<PlanButton planSlug={ planSlug } onClick={ () => onFreeTrialCtaClick() } busy={ busy }>
					{ freeTrialText }
				</PlanButton>
				{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
					<PlanButton planSlug={ planSlug } onClick={ onCtaClick } borderless>
						{ text }
					</PlanButton>
				) }
			</div>
		) : (
			<>
				<PlanButton
					planSlug={ planSlug }
					disabled={ disabled }
					onClick={ onCtaClick }
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

	return (
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
};

const PlanFeatures2023GridActions = ( {
	planSlug,
	currentSitePlanSlug,
	visibleGridPlans,
	availableForPurchase,
	isStuck,
	isInSignup,
	isMonthlyPlan,
	storageOptions,
}: PlanFeaturesActionsButtonProps ) => {
	const {
		gridPlansIndex,
		siteId,
		helpers: { useAction },
	} = usePlansGridContext();
	const {
		planTitle,
		pricing: { billingPeriod, currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
		cartItemForPlan,
		storageAddOnsForPlan,
	} = gridPlansIndex[ planSlug ];
	const currentPlanBillingPeriod = currentSitePlanSlug
		? gridPlansIndex[ currentSitePlanSlug ]?.pricing.billingPeriod
		: undefined;
	const { prices } = usePlanPricingInfoFromGridPlans( {
		gridPlans: visibleGridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );

	const selectedStorageAddOn = useSelectedStorageAddOn( {
		planSlug,
		selectedSiteId: siteId,
		storageAddOnsForPlan,
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

	return (
		<div className="plan-features-2023-gridrison__actions">
			<div className="plan-features-2023-gridrison__actions-buttons">
				<PlanFeatureActionButton
					availableForPurchase={ availableForPurchase }
					currentSitePlanSlug={ currentSitePlanSlug }
					disabled={ ! callback || 'disabled' === status }
					freeTrialText={ freeTrialText }
					hasFreeTrialPlan={ isInSignup ? !! freeTrialPlanSlug : false }
					isMonthlyPlan={ isMonthlyPlan }
					isStuck={ isStuck }
					onCtaClick={ callback }
					onFreeTrialCtaClick={ freeTrialCallback }
					planSlug={ planSlug }
					postButtonText={ postButtonText }
					status={ status }
					storageOptions={ storageOptions }
					text={ text }
				/>
			</div>
		</div>
	);
};

export default PlanFeatures2023GridActions;
