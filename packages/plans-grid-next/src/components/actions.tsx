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
	isBusinessPlan,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { WpcomPlansUI } from '@automattic/data-stores';
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
	planTitle,
	priceString,
	isStuck,
	isLargeCurrency,
	hasFreeTrialPlan,
	onCtaClick,
	onFreeTrialCtaClick,
}: {
	planSlug: PlanSlug;
	planTitle: TranslateResult;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	hasFreeTrialPlan: boolean;
	onCtaClick: () => void;
	onFreeTrialCtaClick: () => void;
} ) => {
	const {
		helpers: { useAction },
	} = usePlansGridContext();

	const { postButtonText, status, text } = useAction( {
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
	} );

	const { text: freeTrialText } = useAction( {
		isFreeTrialAction: hasFreeTrialPlan,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
	} );

	const busy = isFreePlan( planSlug ) && status === 'blocked';

	if ( hasFreeTrialPlan ) {
		return (
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
		);
	}

	return (
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
	planTitle,
	priceString,
	isStuck,
	isLargeCurrency,
	onCtaClick,
}: {
	planSlug: PlanSlug;
	planTitle: TranslateResult;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	onCtaClick: () => void;
} ) => {
	const translate = useTranslate();

	let buttonText = translate( 'Select %(plan)s', {
		args: {
			plan: planTitle,
		},
		context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
		comment:
			'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
	} );

	if ( isFreePlan( planSlug ) ) {
		buttonText = translate( 'Keep this plan', {
			comment:
				'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
		} );
	} else if ( isStuck && ! isLargeCurrency ) {
		buttonText = translate( 'Select %(plan)s – %(priceString)s', {
			args: {
				plan: planTitle,
				priceString: priceString ?? '',
			},
			comment:
				'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium - $10',
		} );
	}

	return (
		<PlanButton planSlug={ planSlug } onClick={ onCtaClick }>
			{ buttonText }
		</PlanButton>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	availableForPurchase,
	priceString,
	isStuck,
	isLargeCurrency,
	isMonthlyPlan,
	planTitle,
	onCtaClick,
	planSlug,
	currentSitePlanSlug,
	buttonText,
	storageOptions,
}: {
	availableForPurchase?: boolean;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	isMonthlyPlan?: boolean;
	planTitle: TranslateResult;
	onCtaClick: () => void;
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	buttonText?: string;
	storageOptions?: StorageOption[];
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const {
		helpers: { useAction },
		gridPlansIndex,
		siteId,
	} = usePlansGridContext();

	const action = useAction( { planSlug } );

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
		if ( action?.loggedInFreePlan ) {
			return (
				<PlanButton planSlug={ planSlug } onClick={ onCtaClick } current={ current }>
					{ action.loggedInFreePlan.text }
				</PlanButton>
			);
		}

		if ( isP2FreePlan( planSlug ) && current ) {
			return null;
		}

		return (
			<PlanButton planSlug={ planSlug } current={ current } disabled>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</PlanButton>
		);
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
		} else if ( action?.currentPlan ) {
			const { text } = action.currentPlan;
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
	} else if ( isStuck && ! isLargeCurrency ) {
		buttonTextFallback = translate( 'Upgrade – %(priceString)s', {
			context: 'verb',
			args: { priceString: priceString ?? '' },
			comment: '%(priceString)s is the full price including the currency. Eg: Get Upgrade - $10',
		} );
	} else if ( isStuck && isLargeCurrency ) {
		buttonTextFallback = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
			args: {
				plan: planTitle,
				priceString: priceString ?? '',
			},
			comment:
				'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
			components: {
				span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
			},
		} );
	} else {
		buttonTextFallback = translate( 'Upgrade', { context: 'verb' } );
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
				<DummyDisabledButton>{ translate( 'Downgrade', { context: 'verb' } ) }</DummyDisabledButton>
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
	const translate = useTranslate();
	const {
		gridPlansIndex,
		siteId,
		helpers: { useActionCallback },
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

	const onCtaClick = useActionCallback( {
		planSlug,
		cartItemForPlan,
		selectedStorageAddOn,
	} );

	// TODO: Unsure about using free plan as a fallback. We should revisit.
	const onFreeTrialCtaClick = useActionCallback( {
		planSlug: freeTrialPlanSlug ?? PLAN_FREE,
		cartItemForPlan: { product_slug: freeTrialPlanSlug ?? PLAN_FREE },
	} );

	if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
		return (
			<PlanButton planSlug={ planSlug } onClick={ onCtaClick }>
				{ translate( 'Learn more' ) }
			</PlanButton>
		);
	}

	const priceString = formatCurrency(
		( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
		currencyCode || 'USD',
		{
			stripZeros: true,
			isSmallestUnit: true,
		}
	);

	if ( isLaunchPage ) {
		return (
			<LaunchPagePlanFeatureActionButton
				planSlug={ planSlug }
				planTitle={ planTitle }
				priceString={ priceString }
				isStuck={ isStuck }
				isLargeCurrency={ !! isLargeCurrency }
				onCtaClick={ onCtaClick }
			/>
		);
	}
	if ( isInSignup ) {
		return (
			<SignupFlowPlanFeatureActionButton
				planSlug={ planSlug }
				planTitle={ planTitle }
				priceString={ priceString }
				isStuck={ isStuck }
				isLargeCurrency={ !! isLargeCurrency }
				hasFreeTrialPlan={ !! freeTrialPlanSlug }
				onCtaClick={ onCtaClick }
				onFreeTrialCtaClick={ onFreeTrialCtaClick }
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			planSlug={ planSlug }
			availableForPurchase={ availableForPurchase }
			onCtaClick={ onCtaClick }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			priceString={ priceString }
			isStuck={ isStuck }
			isLargeCurrency={ !! isLargeCurrency }
			isMonthlyPlan={ isMonthlyPlan }
			planTitle={ planTitle }
			storageOptions={ storageOptions }
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
