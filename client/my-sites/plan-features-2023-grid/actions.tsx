import { getPlanClass, isMonthly, PLAN_P2_FREE } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

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
	onUpgradeClick?: () => void;
	planName: TranslateResult;
	planType: string;
	flowName: string;
	buttonText?: string;
	isWpcomEnterpriseGridPlan: boolean;
};

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
} ) => {
	const translate = useTranslate();
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
		getPlanClass( planType ) === getPlanClass( currentSitePlanSlug )
	) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonText || translate( 'Upgrade to Yearly' ) }
			</Button>
		);
	}

	let buttonTextFallback = freePlan
		? translate( 'Select Free', { context: 'button' } )
		: translate( 'Upgrade', { context: 'verb' } );

	if ( buttonText ) {
		buttonTextFallback = buttonText;
	} else {
		buttonTextFallback = freePlan
			? translate( 'Select Free', { context: 'button' } )
			: translate( 'Upgrade', { context: 'verb' } );
	}

	if ( availableForPurchase || isPlaceholder ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonTextFallback }
			</Button>
		);
	}

	if ( ! availableForPurchase && forceDisplayButton ) {
		return (
			<Button className={ classes } disabled={ true }>
				{ buttonText }
			</Button>
		);
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
} ) => {
	const translate = useTranslate();

	const classes = classNames( 'plan-features-2023-grid__actions-button', className );

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
