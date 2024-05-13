import {
	PLAN_P2_FREE,
	type PlanSlug,
	type StorageOption,
	isP2FreePlan,
	isWpcomEnterpriseGridPlan,
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
	planSlug,
	isStuck,
	hasFreeTrialPlan,
	onCtaClick,
	onFreeTrialCtaClick,
	text,
	freeTrialText,
	postButtonText,
	status,
}: {
	planSlug: PlanSlug;
	isStuck: boolean;
	hasFreeTrialPlan: boolean;
	onCtaClick: () => void;
	onFreeTrialCtaClick: () => void;
	text: TranslateResult;
	freeTrialText?: TranslateResult;
	postButtonText?: TranslateResult;
	status?: 'disabled' | 'blocked' | 'enabled';
} ) => {
	// TODO: Is status ever 'blocked'? We should do some thorough investigation at some point.
	const busy = isFreePlan( planSlug ) && status === 'blocked';

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
			<PlanButton planSlug={ planSlug } onClick={ onCtaClick } busy={ busy }>
				{ text }
			</PlanButton>
			{ postButtonText && (
				<span className="plan-features-2023-grid__actions-post-button-text">
					{ postButtonText }
				</span>
			) }
		</>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	availableForPurchase,
	disabled,
	isMonthlyPlan,
	onCtaClick,
	planSlug,
	storageOptions,
	text,
}: {
	availableForPurchase?: boolean;
	disabled: boolean;
	isMonthlyPlan?: boolean;
	onCtaClick: () => void;
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	storageOptions?: StorageOption[];
	text: TranslateResult;
	billingPeriod?: PlanPricing[ 'billPeriod' ];
	currentPlanBillingPeriod?: PlanPricing[ 'billPeriod' ];
} ) => {
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
		// TODO: this block can be another "exception" that stays
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
		} else if ( text ) {
			// TODO: this can be removed and done in the final single-render call. there's nothing special about it outside of "disabled" status
			return (
				<PlanButton
					planSlug={ planSlug }
					disabled={ ! onCtaClick }
					onClick={ onCtaClick }
					current={ current }
				>
					{ text }
				</PlanButton>
			);
		}
	}

	if ( ! availableForPurchase ) {
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
	}

	return (
		<PlanButton
			planSlug={ planSlug }
			disabled={ disabled }
			onClick={ onCtaClick }
			current={ current }
		>
			{ text }
		</PlanButton>
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
		// TODO: Double check that we need to do this boolean coercion
		isLargeCurrency: !! isLargeCurrency,
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
		// TODO: Double check that we need to do this boolean coercion
		isLargeCurrency: !! isLargeCurrency,
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
				{ isInSignup || isWpcomEnterpriseGridPlan( planSlug ) ? (
					<PlanFeatureActionButton
						planSlug={ planSlug }
						isStuck={ isStuck }
						postButtonText={ postButtonText }
						status={ status }
						hasFreeTrialPlan={ isInSignup ? !! freeTrialPlanSlug : false }
						onCtaClick={ callback }
						onFreeTrialCtaClick={ freeTrialCallback }
						text={ text }
						freeTrialText={ freeTrialText }
					/>
				) : (
					<LoggedInPlansFeatureActionButton
						disabled={ ! callback || 'disabled' === status }
						planSlug={ planSlug }
						availableForPurchase={ availableForPurchase }
						onCtaClick={ callback }
						currentSitePlanSlug={ currentSitePlanSlug }
						isMonthlyPlan={ isMonthlyPlan }
						storageOptions={ storageOptions }
						text={ text }
					/>
				) }
			</div>
		</div>
	);
};

export default PlanFeatures2023GridActions;
