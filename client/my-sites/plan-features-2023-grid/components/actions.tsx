import {
	getPlanClass,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_P2_FREE,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	planMatches,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import classNames from 'classnames';
import i18n, { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getPlanBillPeriod } from 'calypso/state/plans/selectors';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { PlanActionOverrides } from '../types';

type PlanFeaturesActionsButtonProps = {
	availableForPurchase: boolean;
	canUserPurchasePlan?: boolean | null;
	className: string;
	currentSitePlanSlug?: string | null;
	current: boolean;
	freePlan: boolean;
	manageHref: string;
	isPopular?: boolean;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	onUpgradeClick: () => void;
	planName: TranslateResult;
	planType: string;
	flowName?: string | null;
	buttonText?: string;
	isWpcomEnterpriseGridPlan: boolean;
	isWooExpressPlusPlan?: boolean;
	selectedSiteSlug: string | null;
	planActionOverrides?: PlanActionOverrides;
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
	planName,
	classes,
	handleUpgradeButtonClick,
}: {
	freePlan: boolean;
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
		<Button className={ classes } onClick={ handleUpgradeButtonClick }>
			{ btnText }
		</Button>
	);
};

const LaunchPagePlanFeatureActionButton = ( {
	freePlan,
	planName,
	classes,
	handleUpgradeButtonClick,
}: {
	freePlan: boolean;
	planName: TranslateResult;
	classes: string;
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

	return (
		<Button className={ classes } onClick={ handleUpgradeButtonClick }>
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
	availableForPurchase,
	classes,
	handleUpgradeButtonClick,
	planType,
	current,
	manageHref,
	canUserPurchasePlan,
	currentSitePlanSlug,
	buttonText,
	planActionOverrides,
}: {
	freePlan: boolean;
	availableForPurchase?: boolean;
	classes: string;
	handleUpgradeButtonClick: () => void;
	planType: string;
	current?: boolean;
	manageHref?: string;
	canUserPurchasePlan?: boolean | null;
	currentSitePlanSlug?: string | null;
	buttonText?: string;
	selectedSiteSlug: string | null;
	planActionOverrides?: PlanActionOverrides;
} ) => {
	const translate = useTranslate();
	const currentPlanBillPeriod = useSelector( ( state ) => {
		return currentSitePlanSlug ? getPlanBillPeriod( state, currentSitePlanSlug ) : null;
	} );
	const gridPlanBillPeriod = useSelector( ( state ) => {
		return planType ? getPlanBillPeriod( state, planType ) : null;
	} );

	if ( freePlan ) {
		if ( planActionOverrides?.loggedInFreePlan ) {
			return (
				<Button
					className={ classes }
					onClick={ planActionOverrides.loggedInFreePlan.callback }
					disabled={ ! manageHref } // not sure why this is here
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

	if ( current && planType !== PLAN_P2_FREE ) {
		return (
			<Button className={ classes } href={ manageHref } disabled={ ! manageHref }>
				{ canUserPurchasePlan ? translate( 'Manage plan' ) : translate( 'View plan' ) }
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
		getPlanClass( planType ) === getPlanClass( currentSitePlanSlug ) &&
		! isTrialPlan
	) {
		if ( planMatches( planType, { term: TERM_TRIENNIALLY } ) ) {
			return (
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Triennial' ) }
				</Button>
			);
		}

		if ( planMatches( planType, { term: TERM_BIENNIALLY } ) ) {
			return (
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Biennial' ) }
				</Button>
			);
		}

		if ( planMatches( planType, { term: TERM_ANNUALLY } ) ) {
			return (
				<Button className={ classes } onClick={ handleUpgradeButtonClick }>
					{ buttonText || translate( 'Upgrade to Yearly' ) }
				</Button>
			);
		}
	}

	const buttonTextFallback = buttonText ?? translate( 'Upgrade', { context: 'verb' } );

	if ( availableForPurchase ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick }>
				{ buttonTextFallback }
			</Button>
		);
	}

	if ( ! availableForPurchase ) {
		return (
			<Plans2023Tooltip text={ translate( 'Please contact support to downgrade your plan.' ) }>
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
	canUserPurchasePlan,
	className,
	currentSitePlanSlug,
	current = false,
	freePlan = false,
	manageHref,
	isInSignup,
	isLaunchPage,
	onUpgradeClick,
	planName,
	planType,
	flowName,
	buttonText,
	isWpcomEnterpriseGridPlan = false,
	isWooExpressPlusPlan = false,
	selectedSiteSlug,
	planActionOverrides,
} ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const classes = classNames( 'plan-features-2023-grid__actions-button', className, {
		'is-current-plan': current,
	} );

	const handleUpgradeButtonClick = () => {
		if ( ! freePlan ) {
			recordTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: currentSitePlanSlug,
				upgrading_to: planType,
			} );
		}

		onUpgradeClick && onUpgradeClick();
	};

	const vipLandingPageUrlWithoutUtmCampaign =
		'https://wpvip.com/wordpress-vip-agile-content-platform?utm_source=WordPresscom&utm_medium=automattic_referral';

	if ( isWpcomEnterpriseGridPlan ) {
		const translateComponents = {
			ExternalLink: (
				<ExternalLinkWithTracking
					href={ `${ vipLandingPageUrlWithoutUtmCampaign }&utm_campaign=calypso_signup` }
					target="_blank"
					tracksEventName="calypso_plan_step_enterprise_click"
					tracksEventProps={ { flow: flowName } }
				/>
			),
		};

		const shouldShowNewCta =
			isEnglishLocale || i18n.hasTranslation( '{{ExternalLink}}Learn more{{/ExternalLink}}' );

		return (
			<Button className={ classes }>
				{ shouldShowNewCta
					? translate( '{{ExternalLink}}Learn more{{/ExternalLink}}', {
							components: translateComponents,
					  } )
					: translate( '{{ExternalLink}}Get in touch{{/ExternalLink}}', {
							components: translateComponents,
					  } ) }
			</Button>
		);
	} else if ( isWooExpressPlusPlan ) {
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
	} else if ( isLaunchPage ) {
		return (
			<LaunchPagePlanFeatureActionButton
				freePlan={ freePlan }
				planName={ planName }
				classes={ classes }
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
			/>
		);
	} else if ( isInSignup ) {
		return (
			<SignupFlowPlanFeatureActionButton
				freePlan={ freePlan }
				planName={ planName }
				classes={ classes }
				handleUpgradeButtonClick={ handleUpgradeButtonClick }
			/>
		);
	}

	return (
		<LoggedInPlansFeatureActionButton
			freePlan={ freePlan }
			availableForPurchase={ availableForPurchase }
			classes={ classes }
			handleUpgradeButtonClick={ handleUpgradeButtonClick }
			planType={ planType }
			current={ current }
			manageHref={ manageHref }
			canUserPurchasePlan={ canUserPurchasePlan }
			currentSitePlanSlug={ currentSitePlanSlug }
			buttonText={ buttonText }
			selectedSiteSlug={ selectedSiteSlug }
			planActionOverrides={ planActionOverrides }
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
