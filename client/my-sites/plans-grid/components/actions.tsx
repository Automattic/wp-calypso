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
} from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
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
	className: string;
	currentSitePlanSlug?: string | null;
	freePlan: boolean;
	isPopular?: boolean;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	isMonthlyPlan?: boolean;
	onUpgradeClick: ( overridePlanSlug?: PlanSlug ) => void;
	planSlug: PlanSlug;
	flowName?: string | null;
	buttonText?: string;
	isWpcomEnterpriseGridPlan: boolean;
	isWooExpressPlusPlan?: boolean;
	planActionOverrides?: PlanActionOverrides;
	showMonthlyPrice: boolean;
	siteId?: number | null;
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

const SignupFlowPlanFeatureActionButton = ( {
	freePlan,
	planTitle,
	classes,
	priceString,
	isStuck,
	isLargeCurrency,
	hasFreeTrialPlan,
	handleUpgradeButtonClick,
	busy,
}: {
	freePlan: boolean;
	planTitle: TranslateResult;
	classes: string;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	hasFreeTrialPlan: boolean;
	handleUpgradeButtonClick: ( isFreeTrialPlan?: boolean ) => void;
	busy?: boolean;
} ) => {
	const translate = useTranslate();
	let btnText;

	if ( freePlan ) {
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
	} else {
		btnText = translate( 'Get %(plan)s', {
			args: {
				plan: planTitle,
			},
		} );
	}

	if ( hasFreeTrialPlan ) {
		return (
			<div className="plan-features-2023-grid__multiple-actions-container">
				<Button
					className={ classes }
					onClick={ () => handleUpgradeButtonClick( true ) }
					busy={ busy }
				>
					{ translate( 'Try for free' ) }
				</Button>
				{ ! isStuck && (
					<Button borderless onClick={ () => handleUpgradeButtonClick( false ) }>
						{ btnText } <Gridicon icon="arrow-right" />
					</Button>
				) }
			</div>
		);
	}

	return (
		<Button className={ classes } onClick={ () => handleUpgradeButtonClick( false ) } busy={ busy }>
			{ btnText }
		</Button>
	);
};

const LaunchPagePlanFeatureActionButton = ( {
	freePlan,
	planTitle,
	classes,
	priceString,
	isStuck,
	isLargeCurrency,
	handleUpgradeButtonClick,
}: {
	freePlan: boolean;
	planTitle: TranslateResult;
	classes: string;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	handleUpgradeButtonClick: () => void;
} ) => {
	const translate = useTranslate();

	if ( freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick }>
				{ translate( 'Keep this plan', {
					comment:
						'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} ) }
			</Button>
		);
	}

	let buttonText;

	if ( isStuck && ! isLargeCurrency ) {
		buttonText = translate( 'Select %(plan)s – %(priceString)s', {
			args: {
				plan: planTitle,
				priceString: priceString ?? '',
			},
			comment:
				'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium - $10',
		} );
	} else {
		buttonText = translate( 'Select %(plan)s', {
			args: {
				plan: planTitle,
			},
			context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
			comment:
				'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
		} );
	}

	return (
		<Button className={ classes } onClick={ handleUpgradeButtonClick }>
			{ buttonText }
		</Button>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	freePlan,
	availableForPurchase,
	classes,
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
	freePlan: boolean;
	availableForPurchase?: boolean;
	classes: string;
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
		freePlan ||
		( storageAddOnsForPlan && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected )
	) {
		if ( planActionOverrides?.loggedInFreePlan ) {
			return (
				<Button className={ classes } onClick={ planActionOverrides.loggedInFreePlan.callback }>
					{ planActionOverrides.loggedInFreePlan.text }
				</Button>
			);
		}

		if ( isP2FreePlan( planSlug ) && current ) {
			return null;
		}

		return (
			<Button className={ classes } disabled={ true }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</Button>
		);
	}

	if ( current && planSlug !== PLAN_P2_FREE ) {
		if ( canPurchaseStorageAddOns && nonDefaultStorageOptionSelected && ! isMonthlyPlan ) {
			return (
				<Button
					className={ classNames( classes, 'is-storage-upgradeable' ) }
					href={ storageAddOnCheckoutHref }
				>
					{ translate( 'Upgrade' ) }
				</Button>
			);
		} else if ( planActionOverrides?.currentPlan ) {
			const { callback, text } = planActionOverrides.currentPlan;
			return (
				<Button className={ classes } disabled={ ! callback } onClick={ callback }>
					{ text }
				</Button>
			);
		}
		return (
			<Button className={ classes } disabled>
				{ translate( 'Active Plan' ) }
			</Button>
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
			<Button className={ classes } disabled={ true }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</Button>
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
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Triennial' ) }
				</Button>
			);
		}

		if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
			return (
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Biennial' ) }
				</Button>
			);
		}

		if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
			return (
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Yearly' ) }
				</Button>
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
			<Button className={ classes } onClick={ handleUpgradeButtonClick }>
				{ buttonTextFallback }
			</Button>
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
	className,
	currentSitePlanSlug,
	freePlan = false,
	isInSignup,
	isLaunchPage,
	onUpgradeClick,
	planSlug,
	flowName,
	buttonText,
	isWpcomEnterpriseGridPlan = false,
	isWooExpressPlusPlan = false,
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
		current,
		pricing: { currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
	} = gridPlansIndex[ planSlug ];

	const classes = classNames( 'plan-features-2023-grid__actions-button', className, {
		'is-current-plan': current,
		'is-stuck': isStuck,
		'is-large-currency': isLargeCurrency,
	} );

	const handleUpgradeButtonClick = useCallback(
		( isFreeTrialPlan?: boolean ) => {
			const upgradePlan = isFreeTrialPlan && freeTrialPlanSlug ? freeTrialPlanSlug : planSlug;

			if ( ! freePlan ) {
				recordTracksEvent( 'calypso_plan_features_upgrade_click', {
					current_plan: currentSitePlanSlug,
					upgrading_to: upgradePlan,
					saw_free_trial_offer: !! freeTrialPlanSlug,
				} );
			}

			onUpgradeClick?.( upgradePlan );
		},
		[ currentSitePlanSlug, freePlan, freeTrialPlanSlug, onUpgradeClick, planSlug ]
	);

	if ( isWpcomEnterpriseGridPlan ) {
		const vipLandingPageUrlWithUtmCampaign = addQueryArgs(
			'https://wpvip.com/wordpress-vip-agile-content-platform',
			{
				utm_source: 'WordPresscom',
				utm_medium: 'automattic_referral',
				utm_campaign: 'calypso_signup',
			}
		);

		return (
			<Button
				className={ classNames( classes ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } )
				}
				href={ vipLandingPageUrlWithUtmCampaign }
				target="_blank"
			>
				{ translate( 'Learn more' ) }
			</Button>
		);
	}

	if ( isWooExpressPlusPlan ) {
		return (
			<Button
				className={ classNames( classes ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_plan_step_woo_express_plus_click', { flow: flowName } )
				}
				href="https://woocommerce.com/get-in-touch/"
				target="_blank"
			>
				{ translate( 'Get in touch' ) }
			</Button>
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
				freePlan={ freePlan }
				planTitle={ planTitle }
				classes={ classes }
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
				freePlan={ freePlan }
				planTitle={ planTitle }
				classes={ classes }
				priceString={ priceString }
				isStuck={ isStuck }
				isLargeCurrency={ !! isLargeCurrency }
				hasFreeTrialPlan={ !! freeTrialPlanSlug }
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
				busy={ freePlan && planActionOverrides?.loggedInFreePlan?.status === 'blocked' }
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			planSlug={ planSlug }
			freePlan={ freePlan }
			availableForPurchase={ availableForPurchase }
			classes={ classes }
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
