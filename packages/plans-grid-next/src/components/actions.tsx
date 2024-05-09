import {
	getPlanClass,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_P2_FREE,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	planMatches,
	TERM_ANNUALLY,
	type PlanSlug,
	PLAN_HOSTING_TRIAL_MONTHLY,
	type StorageOption,
	isP2FreePlan,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
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
	isLaunchPage?: boolean | null;
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

const SignupFlowPlanFeatureActionButton = ( {
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
	text: string;
	freeTrialText?: string;
	postButtonText: string | null;
	status: string;
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

const LaunchPagePlanFeatureActionButton = ( {
	planSlug,
	onCtaClick,
	text,
}: {
	planSlug: PlanSlug;
	onCtaClick: () => void;
	text: string;
} ) => {
	return (
		<PlanButton planSlug={ planSlug } onClick={ onCtaClick }>
			{ text }
		</PlanButton>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	availableForPurchase,
	isMonthlyPlan,
	onCtaClick,
	planSlug,
	currentSitePlanSlug,
	buttonText,
	storageOptions,
	text,
}: {
	availableForPurchase?: boolean;
	isMonthlyPlan?: boolean;
	onCtaClick: () => void;
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	buttonText?: string;
	storageOptions?: StorageOption[];
	text: string;
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const { gridPlansIndex, siteId } = usePlansGridContext();

	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug ]
	);
	const {
		current,
		storageAddOnsForPlan,
		pricing: { billingPeriod },
	} = gridPlansIndex[ planSlug ];
	const currentPlanBillingPeriod = currentSitePlanSlug
		? gridPlansIndex[ currentSitePlanSlug ]?.pricing.billingPeriod
		: null;
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
		isFreePlan( planSlug ) ||
		( storageAddOnsForPlan && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected )
	) {
		if ( isP2FreePlan( planSlug ) && current ) {
			return null;
		}

		return (
			<PlanButton
				planSlug={ planSlug }
				onClick={ onCtaClick }
				current={ current }
				disabled={ ! current }
			>
				{ text }
			</PlanButton>
		);
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
		return (
			// TODO: this looks like a matter of passing the right text/props from `useAction`
			<PlanButton planSlug={ planSlug } current={ current } disabled>
				{ translate( 'Active Plan' ) }
			</PlanButton>
		);
	}

	const isTrialPlan =
		currentSitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
		currentSitePlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
		currentSitePlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;

	// If the current plan is on a higher-term but lower-tier, then show a "Contact support" button.
	// TODO: this can be the conditioning done in `useAction` to pass the right text/props through. So we'd remove this block.
	if (
		availableForPurchase &&
		currentSitePlanSlug &&
		! current &&
		! isTrialPlan &&
		currentPlanBillingPeriod &&
		billingPeriod &&
		currentPlanBillingPeriod > billingPeriod
	) {
		return (
			<PlanButton planSlug={ planSlug } disabled={ true } current={ current }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</PlanButton>
		);
	}

	// If the current plan matches on a lower-term, then show an "Upgrade to..." button.
	if (
		availableForPurchase &&
		currentSitePlanSlug &&
		! current &&
		getPlanClass( planSlug ) === getPlanClass( currentSitePlanSlug ) &&
		! isTrialPlan
	) {
		// TODO: all of these can be done in `useAction` hook. It's basically just the `text` that's different.
		if ( planMatches( planSlug, { term: TERM_TRIENNIALLY } ) ) {
			return (
				<PlanButton planSlug={ planSlug } onClick={ onCtaClick } current={ current }>
					{ buttonText || translate( 'Upgrade to Triennial' ) }
				</PlanButton>
			);
		}

		if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
			return (
				<PlanButton planSlug={ planSlug } onClick={ onCtaClick } current={ current }>
					{ buttonText || translate( 'Upgrade to Biennial' ) }
				</PlanButton>
			);
		}

		if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
			return (
				<PlanButton planSlug={ planSlug } onClick={ onCtaClick } current={ current }>
					{ buttonText || translate( 'Upgrade to Yearly' ) }
				</PlanButton>
			);
		}
	}

	let buttonTextFallback;

	if ( buttonText ) {
		buttonTextFallback = buttonText;
	} else {
		buttonTextFallback = text;
	}

	if ( availableForPurchase ) {
		return (
			<PlanButton planSlug={ planSlug } onClick={ onCtaClick } current={ current }>
				{ buttonTextFallback }
			</PlanButton>
		);
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

	return null;
};

const PlanFeaturesActionsButton: React.FC< PlanFeaturesActionsButtonProps > = ( {
	availableForPurchase = true,
	currentSitePlanSlug,
	isInSignup,
	isLaunchPage,
	planSlug,
	buttonText,
	isStuck,
	isMonthlyPlan,
	storageOptions,
	visibleGridPlans,
} ) => {
	const {
		gridPlansIndex,
		siteId,
		helpers: { useAction },
	} = usePlansGridContext();
	const {
		planTitle,
		pricing: { currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
		cartItemForPlan,
		storageAddOnsForPlan,
	} = gridPlansIndex[ planSlug ];
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

	const { callback, text, postButtonText, status } = useAction( {
		// TODO: Double check that we need to do this boolean coercion
		availableForPurchase,
		isLargeCurrency: !! isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
		cartItemForPlan,
		selectedStorageAddOn,
	} );

	const { callback: freeTrialCallback, text: freeTrialText } = useAction( {
		// TODO: Double check that we need to do this boolean coercion
		isFreeTrialAction: true,
		isLargeCurrency: !! isLargeCurrency,
		isStuck,
		// TODO: Unsure about using free plan as a fallback. We should revisit.
		planSlug: freeTrialPlanSlug ?? PLAN_FREE,
		planTitle,
		priceString,
		cartItemForPlan: { product_slug: freeTrialPlanSlug ?? PLAN_FREE },
		selectedStorageAddOn,
	} );

	if ( isLaunchPage || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return (
			<LaunchPagePlanFeatureActionButton
				planSlug={ planSlug }
				onCtaClick={ callback }
				text={ text }
			/>
		);
	}

	if ( isInSignup ) {
		return (
			<SignupFlowPlanFeatureActionButton
				planSlug={ planSlug }
				isStuck={ isStuck }
				postButtonText={ postButtonText }
				status={ status }
				hasFreeTrialPlan={ !! freeTrialPlanSlug }
				onCtaClick={ callback }
				onFreeTrialCtaClick={ freeTrialCallback }
				text={ text }
				freeTrialText={ freeTrialText }
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			planSlug={ planSlug }
			availableForPurchase={ availableForPurchase }
			onCtaClick={ callback }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			isMonthlyPlan={ isMonthlyPlan }
			storageOptions={ storageOptions }
			text={ text }
		/>
	);
};

const PlanFeatures2023GridActions = ( props: PlanFeaturesActionsButtonProps ) => {
	return (
		<div className="plan-features-2023-gridrison__actions">
			<div className="plan-features-2023-gridrison__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
		</div>
	);
};

export default PlanFeatures2023GridActions;
