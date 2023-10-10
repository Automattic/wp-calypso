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
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useManageTooltipToggle } from 'calypso/my-sites/plans-grid/hooks/use-manage-tooltip-toggle';
import { useSelector } from 'calypso/state';
import { getPlanBillPeriod } from 'calypso/state/plans/selectors';
import { usePlansGridContext } from '../grid-context';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { PlanActionOverrides } from '../types';

type PlanFeaturesActionsButtonProps = {
	availableForPurchase: boolean;
	canUserManageCurrentPlan?: boolean | null;
	className: string;
	currentSitePlanSlug?: string | null;
	freePlan: boolean;
	currentPlanManageHref?: string;
	isPopular?: boolean;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
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

	return (
		<div className="plan-features-2023-grid__actions-button-container">
			<Button
				className={ classes }
				onClick={ () => handleUpgradeButtonClick( false ) }
				busy={ busy }
			>
				{ btnText }
			</Button>
			{ hasFreeTrialPlan && (
				<Button
					onClick={ () => handleUpgradeButtonClick( true ) }
					className="plan-features-2023-grid__actions-trial-button"
				>
					{ translate( 'Try for free' ) }
				</Button>
			) }
		</div>
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
	planTitle,
	handleUpgradeButtonClick,
	planSlug,
	currentPlanManageHref,
	canUserManageCurrentPlan,
	currentSitePlanSlug,
	buttonText,
	planActionOverrides,
}: {
	freePlan: boolean;
	availableForPurchase?: boolean;
	classes: string;
	priceString: string | null;
	isStuck: boolean;
	isLargeCurrency: boolean;
	planTitle: TranslateResult;
	handleUpgradeButtonClick: () => void;
	planSlug: string;
	currentPlanManageHref?: string;
	canUserManageCurrentPlan?: boolean | null;
	currentSitePlanSlug?: string | null;
	buttonText?: string;
	planActionOverrides?: PlanActionOverrides;
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const { current } = gridPlansIndex[ planSlug ];
	const currentPlanBillPeriod = useSelector( ( state ) => {
		return currentSitePlanSlug ? getPlanBillPeriod( state, currentSitePlanSlug ) : null;
	} );
	const gridPlanBillPeriod = useSelector( ( state ) => {
		return planSlug ? getPlanBillPeriod( state, planSlug ) : null;
	} );

	if ( freePlan ) {
		if ( planActionOverrides?.loggedInFreePlan ) {
			return (
				<Button
					className={ classes }
					onClick={ planActionOverrides.loggedInFreePlan.callback }
					disabled={ ! currentPlanManageHref } // not sure why this is here
				>
					{ planActionOverrides.loggedInFreePlan.text }
				</Button>
			);
		}

		return (
			<Button className={ classes } disabled={ true }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</Button>
		);
	}

	if ( current && planSlug !== PLAN_P2_FREE ) {
		return (
			<Button
				className={ classes }
				href={ currentPlanManageHref }
				disabled={ ! currentPlanManageHref }
			>
				{ canUserManageCurrentPlan ? translate( 'Manage plan' ) : translate( 'View plan' ) }
			</Button>
		);
	}

	const isTrialPlan =
		currentSitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
		currentSitePlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY;

	// If the current plan is on a higher-term but lower-tier, then show a "Contact support" button.
	if (
		availableForPurchase &&
		currentSitePlanSlug &&
		! current &&
		! isTrialPlan &&
		currentPlanBillPeriod &&
		gridPlanBillPeriod &&
		currentPlanBillPeriod > gridPlanBillPeriod
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
		buttonTextFallback = translate( 'Upgrade – %(plan)s', {
			context: 'verb',
			args: { plan: planTitle ?? '' },
			comment: '%(plan)s is the name of the plan ',
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
	canUserManageCurrentPlan,
	className,
	currentSitePlanSlug,
	freePlan = false,
	currentPlanManageHref,
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
				} );
			}

			onUpgradeClick?.( upgradePlan );
		},
		[ currentSitePlanSlug, freePlan, freeTrialPlanSlug, onUpgradeClick, planSlug ]
	);

	if ( isWpcomEnterpriseGridPlan ) {
		const vipLandingPageUrlWithoutUtmCampaign =
			'https://wpvip.com/wordpress-vip-agile-content-platform?utm_source=WordPresscom&utm_medium=automattic_referral';

		return (
			<ExternalLinkWithTracking
				href={ `${ vipLandingPageUrlWithoutUtmCampaign }&utm_campaign=calypso_signup` }
				target="_blank"
				tracksEventName="calypso_plan_step_enterprise_click"
				tracksEventProps={ { flow: flowName } }
			>
				<Button className={ classNames( classes ) }>{ translate( 'Learn more' ) }</Button>
			</ExternalLinkWithTracking>
		);
	}

	if ( isWooExpressPlusPlan ) {
		return (
			<ExternalLinkWithTracking
				className={ classNames( classes ) }
				href="https://woocommerce.com/get-in-touch/"
				target="_blank"
				tracksEventName="calypso_plan_step_woo_express_plus_click"
				tracksEventProps={ { flow: flowName } }
			>
				{ translate( 'Get in touch' ) }
			</ExternalLinkWithTracking>
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
			currentPlanManageHref={ currentPlanManageHref }
			canUserManageCurrentPlan={ canUserManageCurrentPlan }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			planActionOverrides={ planActionOverrides }
			priceString={ priceString }
			isStuck={ isStuck }
			isLargeCurrency={ !! isLargeCurrency }
			planTitle={ planTitle }
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
