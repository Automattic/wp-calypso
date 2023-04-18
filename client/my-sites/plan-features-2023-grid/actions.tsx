import {
	getPlanClass,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_P2_FREE,
	isFreePlan,
	is2023PricingGridActivePage,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	planMatches,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import i18n, { localize, TranslateResult, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getPlanBillPeriod } from 'calypso/state/plans/selectors';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
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
	isWooExpressPlusPlan?: boolean;
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
	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const translate = useTranslate();
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const currentPlanBillPeriod = useSelector( ( state ) => {
		return currentSitePlanSlug ? getPlanBillPeriod( state, currentSitePlanSlug ) : null;
	} );
	const gridPlanBillPeriod = useSelector( ( state ) => {
		return planType ? getPlanBillPeriod( state, planType ) : null;
	} );

	const showDomainUpsellDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [ setShowDomainUpsellDialog ] );

	if ( freePlan ) {
		if ( currentSitePlanSlug && isFreePlan( currentSitePlanSlug ) ) {
			if ( domainFromHomeUpsellFlow ) {
				return (
					<Button className={ classes } onClick={ showDomainUpsellDialog }>
						{ translate( 'Keep my plan', { context: 'verb' } ) }
					</Button>
				);
			}

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

	// If the current plan is on a higher-term but lower-tier, then show a "Contact support" button.
	if (
		( availableForPurchase || isPlaceholder ) &&
		currentSitePlanSlug &&
		! current &&
		currentSitePlanSlug !== PLAN_ECOMMERCE_TRIAL_MONTHLY &&
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
		( availableForPurchase || isPlaceholder ) &&
		currentSitePlanSlug &&
		! current &&
		getPlanClass( planType ) === getPlanClass( currentSitePlanSlug ) &&
		currentSitePlanSlug !== PLAN_ECOMMERCE_TRIAL_MONTHLY
	) {
		if ( planMatches( planType, { term: TERM_TRIENNIALLY } ) ) {
			return (
				<Button
					className={ classes }
					onClick={ handleUpgradeButtonClick }
					disabled={ isPlaceholder }
				>
					{ buttonText || translate( 'Upgrade to Triennial' ) }
				</Button>
			);
		}

		if ( planMatches( planType, { term: TERM_BIENNIALLY } ) ) {
			return (
				<Button
					className={ classes }
					onClick={ handleUpgradeButtonClick }
					disabled={ isPlaceholder }
				>
					{ buttonText || translate( 'Upgrade to Biennial' ) }
				</Button>
			);
		}

		if ( planMatches( planType, { term: TERM_ANNUALLY } ) ) {
			return (
				<Button
					className={ classes }
					onClick={ handleUpgradeButtonClick }
					disabled={ isPlaceholder }
				>
					{ buttonText || translate( 'Upgrade to Yearly' ) }
				</Button>
			);
		}
	}

	const buttonTextFallback = buttonText ?? translate( 'Upgrade', { context: 'verb' } );

	if ( availableForPurchase || isPlaceholder ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonTextFallback }
			</Button>
		);
	}

	const is2023PricingGridVisible = is2023PricingGridActivePage( window );
	if ( ! availableForPurchase ) {
		if ( is2023PricingGridVisible ) {
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
	isWooExpressPlusPlan = false,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const classes = classNames( 'plan-features-2023-grid__actions-button', className, {
		'is-current-plan': current,
	} );

	const handleUpgradeButtonClick = () => {
		if ( isPlaceholder ) {
			return;
		}

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
			<Button className={ classNames( classes ) }>
				<ExternalLinkWithTracking
					href="https://woocommerce.com/get-in-touch/"
					target="_blank"
					tracksEventName="calypso_plan_step_woo_express_plus_click"
					tracksEventProps={ { flow: flowName } }
				>
					{ translate( 'Get in touch' ) }
				</ExternalLinkWithTracking>
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
