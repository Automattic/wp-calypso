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
} from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useManageTooltipToggle } from 'calypso/my-sites/plans-grid/hooks/use-manage-tooltip-toggle';
import { usePlansGridContext } from '../grid-context';
import useDefaultStorageOption from '../hooks/npm-ready/data-store/use-default-storage-option';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { PlanActionOverrides } from '../types';

type PlanFeaturesActionsButtonProps = {
	availableForPurchase: boolean;
	currentSitePlanSlug?: string | null;
	isPopular?: boolean;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	isMonthlyPlan?: boolean;
	onUpgradeClick: ( overridePlanSlug?: PlanSlug ) => void;
	planSlug: PlanSlug;
	buttonText?: string;
	planActionOverrides?: PlanActionOverrides;
	showMonthlyPrice: boolean;
	isStuck: boolean;
	isLargeCurrency?: boolean;
	storageOptions?: StorageOption[];
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

const PlanActionButton = ( {
	planSlug,
	children,
	classes,
	href,
	onClick = () => {},
	busy = false,
	borderless = false,
	current = false,
	disabled = false,
	isStuck = false,
	isLargeCurrency = false,
}: {
	planSlug: PlanSlug;
	children: React.ReactNode;
	classes?: string;
	href?: string;
	onClick?: () => void;
	busy?: boolean;
	borderless?: boolean;
	current?: boolean;
	disabled?: boolean;
	isStuck?: boolean;
	isLargeCurrency?: boolean;
} ) => {
	const className = classNames(
		classes,
		'plan-features-2023-grid__actions-button',
		getPlanClass( planSlug ),
		{
			'is-current-plan': current,
			'is-stuck': isStuck,
			'is-large-currency': isLargeCurrency,
		}
	);

	return (
		<Button
			className={ className }
			onClick={ onClick }
			busy={ busy }
			borderless={ borderless }
			disabled={ disabled }
			href={ href }
		>
			{ children }
		</Button>
	);
};

const SignupFlowPlanFeatureActionButton = ( {
	planSlug,
	planTitle,
	priceString,
	isStuck,
	isLargeCurrency,
	hasFreeTrialPlan,
	handleUpgradeButtonClick,
	busy,
}: {
	planSlug: PlanSlug;
	planTitle: TranslateResult;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	hasFreeTrialPlan: boolean;
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void;
	busy?: boolean;
} ) => {
	const translate = useTranslate();

	let btnText = translate( 'Get %(plan)s', {
		args: {
			plan: planTitle,
		},
	} );

	const onClick = () => handleUpgradeButtonClick( hasFreeTrialPlan );

	if ( isFreePlan( planSlug ) ) {
		btnText = translate( 'Start with Free' );
	} else if ( isStuck && ! isLargeCurrency ) {
		btnText = translate( 'Get %(plan)s – %(priceString)s', {
			args: {
				plan: planTitle,
				priceString: priceString ?? '',
			},
			comment:
				'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
		} );
	} else if ( isStuck && isLargeCurrency ) {
		btnText = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
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
	}

	if ( hasFreeTrialPlan ) {
		return (
			<div className="plan-features-2023-grid__multiple-actions-container">
				<PlanActionButton planSlug={ planSlug } onClick={ onClick } busy={ busy }>
					{ translate( 'Try for free' ) }
				</PlanActionButton>
				{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
					<PlanActionButton
						planSlug={ planSlug }
						onClick={ () => handleUpgradeButtonClick( false ) }
						borderless
					>
						{ btnText } <Gridicon icon="arrow-right" />
					</PlanActionButton>
				) }
			</div>
		);
	}

	return (
		<PlanActionButton planSlug={ planSlug } onClick={ onClick } busy={ busy }>
			{ btnText }
		</PlanActionButton>
	);
};

const LaunchPagePlanFeatureActionButton = ( {
	planSlug,
	planTitle,
	priceString,
	isStuck,
	isLargeCurrency,
	handleUpgradeButtonClick,
}: {
	planSlug: PlanSlug;
	planTitle: TranslateResult;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	handleUpgradeButtonClick: () => void;
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
		<PlanActionButton planSlug={ planSlug } onClick={ handleUpgradeButtonClick }>
			{ buttonText }
		</PlanActionButton>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	availableForPurchase,
	priceString,
	isStuck,
	isLargeCurrency,
	isMonthlyPlan,
	planTitle,
	handleUpgradeButtonClick,
	planSlug,
	currentSitePlanSlug,
	buttonText,
	planActionOverrides,
	storageOptions,
}: {
	availableForPurchase?: boolean;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	isMonthlyPlan?: boolean;
	planTitle: TranslateResult;
	handleUpgradeButtonClick: () => void;
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	buttonText?: string;
	planActionOverrides?: PlanActionOverrides;
	storageOptions?: StorageOption[];
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug ),
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
		if ( planActionOverrides?.loggedInFreePlan ) {
			return (
				<PlanActionButton
					planSlug={ planSlug }
					onClick={ planActionOverrides.loggedInFreePlan.callback }
					current={ current }
				>
					{ planActionOverrides.loggedInFreePlan.text }
				</PlanActionButton>
			);
		}

		if ( isP2FreePlan( planSlug ) && current ) {
			return null;
		}

		return (
			<PlanActionButton planSlug={ planSlug } current={ current } disabled>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</PlanActionButton>
		);
	}

	if ( current && planSlug !== PLAN_P2_FREE ) {
		if ( canPurchaseStorageAddOns && nonDefaultStorageOptionSelected && ! isMonthlyPlan ) {
			return (
				<PlanActionButton
					planSlug={ planSlug }
					classes="is-storage-upgradeable"
					href={ storageAddOnCheckoutHref }
				>
					{ translate( 'Upgrade' ) }
				</PlanActionButton>
			);
		} else if ( planActionOverrides?.currentPlan ) {
			const { callback, text } = planActionOverrides.currentPlan;
			return (
				<PlanActionButton
					planSlug={ planSlug }
					disabled={ ! callback }
					onClick={ callback }
					current={ current }
				>
					{ text }
				</PlanActionButton>
			);
		}
		return (
			<PlanActionButton planSlug={ planSlug } current={ current } disabled>
				{ translate( 'Active Plan' ) }
			</PlanActionButton>
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
			<PlanActionButton planSlug={ planSlug } disabled={ true } current={ current }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</PlanActionButton>
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
				<PlanActionButton
					planSlug={ planSlug }
					onClick={ handleUpgradeButtonClick }
					current={ current }
				>
					{ buttonText || translate( 'Upgrade to Triennial' ) }
				</PlanActionButton>
			);
		}

		if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
			return (
				<PlanActionButton
					planSlug={ planSlug }
					onClick={ handleUpgradeButtonClick }
					current={ current }
				>
					{ buttonText || translate( 'Upgrade to Biennial' ) }
				</PlanActionButton>
			);
		}

		if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
			return (
				<PlanActionButton
					planSlug={ planSlug }
					onClick={ handleUpgradeButtonClick }
					current={ current }
				>
					{ buttonText || translate( 'Upgrade to Yearly' ) }
				</PlanActionButton>
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
			<PlanActionButton
				planSlug={ planSlug }
				onClick={ handleUpgradeButtonClick }
				current={ current }
			>
				{ buttonTextFallback }
			</PlanActionButton>
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
	onUpgradeClick,
	planSlug,
	buttonText,
	planActionOverrides,
	isStuck,
	isLargeCurrency,
	isMonthlyPlan,
	storageOptions,
} ) => {
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const {
		planTitle,
		pricing: { currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
	} = gridPlansIndex[ planSlug ];

	const handleUpgradeButtonClick = useCallback(
		( isFreeTrialPlan?: boolean ) => {
			const upgradePlan = isFreeTrialPlan && freeTrialPlanSlug ? freeTrialPlanSlug : planSlug;

			if ( ! isFreePlan( planSlug ) ) {
				recordTracksEvent( 'calypso_plan_features_upgrade_click', {
					current_plan: currentSitePlanSlug,
					upgrading_to: upgradePlan,
					saw_free_trial_offer: !! freeTrialPlanSlug,
				} );
			}
			onUpgradeClick?.( upgradePlan );
		},
		[ currentSitePlanSlug, freeTrialPlanSlug, onUpgradeClick, planSlug ]
	);

	if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
		return (
			<PlanActionButton planSlug={ planSlug } onClick={ () => handleUpgradeButtonClick() }>
				{ translate( 'Learn more' ) }
			</PlanActionButton>
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
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
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
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
				busy={
					isFreePlan( planSlug ) && planActionOverrides?.loggedInFreePlan?.status === 'blocked'
				}
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			planSlug={ planSlug }
			availableForPurchase={ availableForPurchase }
			handleUpgradeButtonClick={ handleUpgradeButtonClick }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			planActionOverrides={ planActionOverrides }
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

export default localize( PlanFeatures2023GridActions );
