import {
	is2023PricingGridEnabled,
	getPlanClass,
	isMonthly,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_P2_FREE,
	isFreePlan,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Plans2023Tooltip } from './plans-2023-tooltip';

type PlanFeaturesActionsButtonProps = {
	availableForPurchase: boolean;
	canUserPurchasePlan: boolean;
	className: string;
	currentSitePlanSlug: string;
	current: boolean;
	forceDisplayButton?: boolean;
	freePlan: boolean;
	manageHref: string;
	isPlaceholder?: boolean;
	isPopular?: boolean;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	onUpgradeClick: () => void;
	planName: TranslateResult;
	planType: string;
	flowName: string;
	buttonText?: string;
	isWpcomEnterpriseGridPlan: boolean;
	selectedSiteSlug: string | null;
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
	isPlaceholder,
	planName,
	classes,
	handleUpgradeButtonClick,
}: {
	freePlan: boolean;
	isPlaceholder: boolean;
	planName: TranslateResult;
	classes: string;
	handleUpgradeButtonClick: () => void;
} ) => {
	const translate = useTranslate();
	let btnText;

	if ( freePlan ) {
		btnText = translate( 'Start with Free' );
	} else {
		btnText = translate( 'Get %(plan)s', {
			args: {
				plan: planName,
			},
		} );
	}

	return (
		<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
			{ btnText }
		</Button>
	);
};

const LaunchPagePlanFeatureActionButton = ( {
	freePlan,
	isPlaceholder,
	planName,
	classes,
	handleUpgradeButtonClick,
}: {
	freePlan: boolean;
	isPlaceholder: boolean;
	planName: TranslateResult;
	classes: string;
	handleUpgradeButtonClick: () => void;
} ) => {
	const translate = useTranslate();

	if ( freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ translate( 'Keep this plan', {
					comment:
						'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} ) }
			</Button>
		);
	}

	return (
		<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
			{ translate( 'Select %(plan)s', {
				args: {
					plan: planName,
				},
				context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
				comment:
					'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
			} ) }
		</Button>
	);
};

const LoggedInPlansFeatureActionButton = ( {
	freePlan,
	isPlaceholder,
	availableForPurchase,
	classes,
	handleUpgradeButtonClick,
	planType,
	current,
	manageHref,
	canUserPurchasePlan,
	currentSitePlanSlug,
	buttonText,
	forceDisplayButton,
	selectedSiteSlug,
}: {
	freePlan: boolean;
	isPlaceholder: boolean;
	availableForPurchase?: boolean;
	classes: string;
	handleUpgradeButtonClick: () => void;
	planType: string;
	current?: boolean;
	manageHref?: string;
	canUserPurchasePlan?: boolean;
	currentSitePlanSlug?: string;
	buttonText?: string;
	forceDisplayButton: boolean;
	selectedSiteSlug: string | null;
} ) => {
	const translate = useTranslate();

	if ( freePlan ) {
		if ( currentSitePlanSlug && isFreePlan( currentSitePlanSlug ) ) {
			return (
				<Button
					className={ classes }
					href={ `/add-ons/${ selectedSiteSlug }` }
					disabled={ ! manageHref }
				>
					{ translate( 'Manage add-ons', { context: 'verb' } ) }
				</Button>
			);
		}

		return (
			<Button className={ classes } disabled={ true }>
				{ translate( 'Contact support', { context: 'verb' } ) }
			</Button>
		);
	}

	if ( current && planType !== PLAN_P2_FREE ) {
		return (
			<Button className={ classes } href={ manageHref } disabled={ ! manageHref }>
				{ canUserPurchasePlan ? translate( 'Manage plan' ) : translate( 'View plan' ) }
			</Button>
		);
	}

	if (
		( availableForPurchase || isPlaceholder ) &&
		currentSitePlanSlug &&
		isMonthly( currentSitePlanSlug ) &&
		getPlanClass( planType ) === getPlanClass( currentSitePlanSlug ) &&
		currentSitePlanSlug !== PLAN_ECOMMERCE_TRIAL_MONTHLY
	) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonText || translate( 'Upgrade to Yearly' ) }
			</Button>
		);
	}

	const buttonTextFallback = buttonText ?? translate( 'Upgrade', { context: 'verb' } );

	if ( availableForPurchase || isPlaceholder ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonTextFallback }
			</Button>
		);
	}

	const is2023OnboardingPricingGrid = is2023PricingGridEnabled();
	if ( ! availableForPurchase ) {
		if ( is2023OnboardingPricingGrid ) {
			return (
				<Plans2023Tooltip text={ translate( 'Please contact support to downgrade your plan.' ) }>
					<DummyDisabledButton>
						{ translate( 'Downgrade', { context: 'verb' } ) }
					</DummyDisabledButton>
				</Plans2023Tooltip>
			);
		} else if ( forceDisplayButton ) {
			return (
				<Button className={ classes } disabled={ true }>
					{ buttonText }
				</Button>
			);
		}
	}

	return null;
};

const PlanFeaturesActionsButton: React.FC< PlanFeaturesActionsButtonProps > = ( {
	availableForPurchase = true,
	canUserPurchasePlan,
	className,
	currentSitePlanSlug,
	current = false,
	forceDisplayButton = false,
	freePlan = false,
	manageHref,
	isPlaceholder = false,
	isInSignup,
	isLaunchPage,
	onUpgradeClick,
	planName,
	planType,
	flowName,
	buttonText,
	isWpcomEnterpriseGridPlan = false,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const classes = classNames( 'plan-features-2023-grid__actions-button', className, {
		'is-current-plan': current,
	} );

	const handleUpgradeButtonClick = () => {
		if ( isPlaceholder ) {
			return;
		}

		if ( ! freePlan ) {
			recordTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: null,
				upgrading_to: planType,
			} );
		}

		onUpgradeClick && onUpgradeClick();
	};

	const vipLandingPageUrlWithoutUtmCampaign =
		'https://wpvip.com/wordpress-vip-agile-content-platform?utm_source=WordPresscom&utm_medium=automattic_referral';

	if ( isWpcomEnterpriseGridPlan ) {
		return (
			<Button className={ classes }>
				{ translate( '{{ExternalLink}}Get in touch{{/ExternalLink}}', {
					components: {
						ExternalLink: (
							<ExternalLinkWithTracking
								href={ `${ vipLandingPageUrlWithoutUtmCampaign }&utm_campaign=calypso_signup` }
								target="_blank"
								tracksEventName="calypso_plan_step_enterprise_click"
								tracksEventProps={ { flow: flowName } }
							/>
						),
					},
				} ) }
			</Button>
		);
	} else if ( isLaunchPage ) {
		return (
			<LaunchPagePlanFeatureActionButton
				freePlan={ freePlan }
				isPlaceholder={ isPlaceholder }
				planName={ planName }
				classes={ classes }
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
			/>
		);
	} else if ( isInSignup ) {
		return (
			<SignupFlowPlanFeatureActionButton
				freePlan={ freePlan }
				isPlaceholder={ isPlaceholder }
				planName={ planName }
				classes={ classes }
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			freePlan={ freePlan }
			isPlaceholder={ isPlaceholder }
			availableForPurchase={ availableForPurchase }
			classes={ classes }
			handleUpgradeButtonClick={ handleUpgradeButtonClick }
			planType={ planType }
			current={ current }
			manageHref={ manageHref }
			canUserPurchasePlan={ canUserPurchasePlan }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			forceDisplayButton={ forceDisplayButton }
			selectedSiteSlug={ selectedSiteSlug }
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
