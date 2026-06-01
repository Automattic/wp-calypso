import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	UrlFriendlyTermType,
	isDomainTransfer,
	PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { HelpCenter, HelpCenterSelect, Plans } from '@automattic/data-stores';
import { FREE_THEME } from '@automattic/design-picker';
import {
	DOMAIN_FLOW,
	isNewHostedSiteCreationFlow,
	isOnboardingFlow,
	isTailoredSignupFlow,
	ONBOARDING_FLOW,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { PlansIntent } from '@automattic/plans-grid-next';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { isDesktop as isDesktopViewport, subscribeIsDesktop } from '@automattic/viewport';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { parse as parseQs } from 'qs';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import IntentToggle from 'calypso/my-sites/plans-features-main/components/intent-toggle';
import { getStepUrl } from 'calypso/signup/utils';
import { getDomainFromUrl } from 'calypso/site-profiler/utils/get-valid-url';
import { useDispatch as reduxUseDispatch, useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import isDomainOnlySiteSelector from 'calypso/state/selectors/is-domain-only-site';
import {
	saveSignupStep as saveSignupStepAction,
	submitSignupStep as submitSignupStepAction,
} from 'calypso/state/signup/progress/actions';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import { useOnboardingStepCounter } from '../../../flows/onboarding/use-onboarding-step-counter';
import { getIntervalType } from './util';
import type { OnboardSelect, SiteDetails } from '@automattic/data-stores';
import type { StepState } from 'calypso/state/signup/progress/schema';
import './unified-plans-step-styles.scss';

const loadPlanFaq = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-plans-features-main-components-plan-faq" */ 'calypso/my-sites/plans-features-main/components/plan-faq'
	);
const loadStepWrapper = () =>
	import(
		/* webpackChunkName: "async-load-calypso-signup-step-wrapper" */ 'calypso/signup/step-wrapper'
	);

export interface UnifiedPlansStepProps {
	hideFreePlan?: boolean;
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	hideEnterprisePlan?: boolean;
	hideEcommercePlan?: boolean;

	flowName: string;
	stepName: string;

	// Upgrade Handler - START

	goToNextStep: () => void;
	additionalStepData?: object;
	stepSectionName?: string;
	launchSite?: boolean;
	themeSlugWithRepo?: string;
	selectedSite?: SiteDetails;

	/**
	 * Make required once Start is removed
	 */
	submitSignupStep?: (
		stepInfo: {
			stepName: string;
			domainItem?: { meta?: string };
			isPurchasingItem?: boolean;
			stepSectionName?: string;
			siteUrl?: string;
		},
		domainInfo: object
	) => void;

	// Upgrade Handler - END

	/**
	 * Make required once Start is removed
	 */
	saveSignupStep?: ( step: { stepName: string } ) => void;

	signupDependencies: {
		siteId?: number | null;
		siteSlug?: string | null;
		siteUrl?: string | null;
		domainItem?: { meta?: string } | null;
		siteTitle?: string | null;
		username?: string | null;
		coupon?: string | null;
		selectedThemeType?: string;
	};
	onPlanIntervalUpdate: ( path: string ) => void;

	customerType?: string;
	displayedIntervals?: Array<
		Extract< UrlFriendlyTermType, 'monthly' | 'yearly' | '2yearly' | '3yearly' >
	>;
	headerText?: string;
	fallbackHeaderText?: string;
	deemphasizeFreePlan?: boolean;
	useStepperWrapper?: boolean;

	/**
	 * Passed from Stepper for @automattic/onboarding step-container
	 */
	wrapperProps?: {
		hideBack?: boolean;
		goBack: NavigationControls[ 'goBack' ];
		isFullLayout: boolean;
		isExtraWideLayout: boolean;
	};

	shouldHideNavButtons?: boolean;
	intent?: PlansIntent;
	onIntentChange?: ( intent: PlansIntent ) => void;
	isLaunchPage?: boolean;
	intervalType?: string;
	selectedFeature?: string;
	fallbackSubHeaderText?: string;

	/**
	 * Used only in old Signup/Start
	 * Can be queried through a selector (as is and passed through),
	 * although the return type is incomplete (missing added terms here)
	 */
	progress?: Record< string, StepState & { stepSectionName?: string; siteUrl?: string } >;

	/**
	 * Used only in old Signup/Start
	 */
	positionInFlow?: number;

	/**
	 * Used only in old Signup/Start
	 */
	queryParams?: object;

	/**
	 * Used only in old Signup/Start
	 */
	steps?: string[];

	/**
	 * Used only in old Signup/Start
	 */
	step?: {
		status?: string;
		errors?: { message: string };
	};

	/**
	 * Used only in old Signup/Start
	 * TODO clk: Stepper pass something?
	 */
	path?: string;

	/**
	 * Used only in "mailbox-plan" step (old Signup/Start)
	 */
	useEmailOnboardingSubheader?: boolean;

	/**
	 * Used only in "onboarding-pm" flow (old Signup/Start)
	 */
	isCustomDomainAllowedOnFreePlan?: boolean;

	useStepContainerV2?: boolean;

	/**
	 * Whether this step is being used in a signup flow context.
	 * Defaults to true to preserve existing behavior.
	 */
	isInSignup?: boolean;

	/**
	 * Whether this step is being used in a stepper upgrade flow context.
	 */
	isStepperUpgradeFlow?: boolean;
}

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * This is a "unified" plans step component that is utilised by both Start (old framework) and Stepper (new framework).
 * It contains the latest logic/conditioning, properties, etc. that apply to the latest main iterations of the plans step.
 *
 * Important: The component is used in the main onboarding flows (/start/onboarding, /start/onboarding-pm, /setup/onboarding),
 * so care should be taken when making changes to it. Always test `/start/onboarding` and `/setup/onboarding` after making changes.
 */
function UnifiedPlansStep( {
	hideFreePlan,
	hideEcommercePlan,
	hidePersonalPlan,
	hidePremiumPlan,
	hideEnterprisePlan,
	saveSignupStep: saveSignupStepFromProps,
	submitSignupStep: submitSignupStepFromProps,
	customerType: customerTypeFromProps,
	additionalStepData,
	flowName,
	selectedSite: selectedSiteFromProps,
	stepName,
	stepSectionName,
	themeSlugWithRepo,
	goToNextStep,
	launchSite,
	deemphasizeFreePlan: deemphasizeFreePlanFromProps,
	isLaunchPage,
	intent,
	intervalType,
	path,
	step,
	signupDependencies,
	displayedIntervals,
	headerText,
	useEmailOnboardingSubheader,
	onPlanIntervalUpdate,
	positionInFlow,
	steps,
	wrapperProps,
	useStepperWrapper,
	useStepContainerV2,
	isCustomDomainAllowedOnFreePlan,
	fallbackHeaderText: fallbackHeaderTextFromProps,
	fallbackSubHeaderText: fallbackSubHeaderTextFromProps,
	progress,
	queryParams: queryParamsFromProps,
	shouldHideNavButtons,
	onIntentChange,
	isInSignup = true,
	isStepperUpgradeFlow = false,
	selectedFeature,
}: UnifiedPlansStepProps ) {
	const [ isContentReady, setIsContentReady ] = useState( ! useStepContainerV2 );
	const handlePlansReady = useCallback( () => setIsContentReady( true ), [] );
	const [ isDesktop, setIsDesktop ] = useState< boolean | undefined >( isDesktopViewport() );
	const dispatch = reduxUseDispatch();
	const translate = useTranslate();
	const dashboardOptIn = useSelector( hasDashboardOptIn );

	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isHelpCenterShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const toggleHelpCenter = () => setShowHelpCenter( ! isHelpCenterShown );
	const stepCounter = useOnboardingStepCounter( flowName, 'plans' );
	const initializedSitesBackUrl = useSelector( ( state ) => {
		if ( getCurrentUserSiteCount( state ) ) {
			return null;
		}

		return dashboardOptIn ? dashboardLink( '/sites' ) : '/sites/';
	} );

	useSiteGlobalStylesOnPersonal();

	const customerType =
		customerTypeFromProps ??
		( parseQs( path?.split( '?' ).pop() ?? '' ).customerType as string ) ??
		'personal';

	// This step could be used to set up an existing site, in which case
	// some descendants of this component may display discounted prices if
	// they apply to the given site.
	const selectedSiteFromState = useSelector( ( state ) =>
		signupDependencies.siteSlug ? getSiteBySlug( state, signupDependencies.siteSlug ) : null
	);
	const selectedSite = selectedSiteFromProps ?? selectedSiteFromState;

	const isDomainOnlySite = useSelector( ( state ) =>
		signupDependencies.siteId ? isDomainOnlySiteSelector( state, signupDependencies.siteId ) : false
	);

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const { domainItem, siteTitle, username, coupon, selectedThemeType } = signupDependencies;

	const { domainCartItem, siteUrl: onboardingStoreSiteUrl } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			const { getDomainCartItem, getSiteUrl } = select( ONBOARD_STORE );
			return {
				domainCartItem: getDomainCartItem(),
				siteUrl: getSiteUrl(),
			};
		},
		[]
	);

	const siteUrl = onboardingStoreSiteUrl ?? signupDependencies.siteUrl;

	const isPaidTheme = Boolean( selectedThemeType && selectedThemeType !== FREE_THEME );

	const effectiveSubmitSignupStep = useMemo(
		() =>
			submitSignupStepFromProps ??
			function ( stepInfo: object, domainInfo: object ) {
				dispatch( submitSignupStepAction( stepInfo, domainInfo ) );
			},
		[ dispatch, submitSignupStepFromProps ]
	);

	const effectiveSaveSignupStep =
		saveSignupStepFromProps ??
		function ( step: { stepName: string } ) {
			dispatch( saveSignupStepAction( step ) );
		};

	useEffect( () => {
		const unsubscribe = subscribeIsDesktop( ( matchesDesktop ) => setIsDesktop( matchesDesktop ) );

		effectiveSaveSignupStep( { stepName } );

		if ( isTailoredSignupFlow( flowName ) ) {
			triggerGuidesForStep( flowName, 'plans' );
		}

		return () => {
			unsubscribe();
		};
	}, [] );

	const handleUpgradeClick = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null ) => {
			if ( isPaidTheme && cartItems === null ) {
				setSelectedDesign( null );
			}

			buildUpgradeFunction(
				{
					additionalStepData,
					flowName,
					launchSite,
					selectedSite,
					stepName,
					stepSectionName,
					themeSlugWithRepo,
					goToNextStep,
					submitSignupStep: effectiveSubmitSignupStep,
				},
				cartItems
			);

			return;
		},
		[
			additionalStepData,
			effectiveSubmitSignupStep,
			flowName,
			goToNextStep,
			launchSite,
			selectedSite,
			stepName,
			stepSectionName,
			themeSlugWithRepo,
		]
	);

	const siteId = selectedSite?.ID ?? signupDependencies.siteId;
	const currentPlan = Plans.useCurrentPlan( { siteId } );

	const handleRemovePaidDomain = useCallback( () => {
		const domainItem = undefined;

		effectiveSubmitSignupStep(
			{
				stepName: 'domains',
				domainItem,
				isPurchasingItem: false,
				stepSectionName: undefined,
			},
			{
				domainItem,
				signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.FREE,
			}
		);
	}, [ effectiveSubmitSignupStep ] );

	const handleSetSiteUrlAsFreeDomainSuggestion = useCallback(
		( freeDomainSuggestion: { domain_name: string; product_slug?: string } ) => {
			if ( freeDomainSuggestion?.product_slug ) {
				return;
			}

			const siteUrl = freeDomainSuggestion.domain_name.replace( '.wordpress.com', '' );

			effectiveSubmitSignupStep(
				{
					stepName: 'domains',
					siteUrl,
				},
				{}
			);
		},
		[ effectiveSubmitSignupStep ]
	);

	const shouldHideEcommercePlan = () => {
		return hideEcommercePlan;
	};

	const getHeaderText = () => {
		if ( headerText ) {
			return headerText;
		}

		if ( isNewHostedSiteCreationFlow( flowName ) ) {
			return translate( 'Host with the best' );
		}

		if ( intent === 'plans-wordpress-hosting' ) {
			return translate( 'Managed hosting without limits' );
		}

		if ( intent === 'plans-website-builder' ) {
			return translate( 'Create a beautiful WordPress website' );
		}

		if ( intent === 'plans-woo-hosted' ) {
			return translate( 'Select a plan to launch your store' );
		}

		if ( intent === 'plans-woo-hosting-solutions' ) {
			return translate( 'Pick a plan for your store' );
		}

		return translate( 'There’s a plan for you' );
	};

	let paidDomainName = domainItem?.meta;

	if ( ! paidDomainName && isDomainOnlySite && selectedSite?.URL ) {
		paidDomainName = getDomainFromUrl( selectedSite.URL );
	}

	const deemphasizeFreePlan =
		( [ ONBOARDING_FLOW, DOMAIN_FLOW ].includes( flowName ) &&
			( paidDomainName != null || isPaidTheme ) ) ||
		deemphasizeFreePlanFromProps;

	const shouldUseModalBackedFreePlanCTA =
		useStepContainerV2 && deemphasizeFreePlan && ( paidDomainName != null || isPaidTheme );

	const getSubheaderText = () => {
		const freePlanButton = (
			<Button
				onClick={ () =>
					buildUpgradeFunction( {
						additionalStepData,
						flowName,
						launchSite,
						selectedSite,
						stepName,
						stepSectionName,
						themeSlugWithRepo,
						goToNextStep,
						submitSignupStep: effectiveSubmitSignupStep,
					} )
				}
				borderless
				className="plans-features-main__free-plan-cta"
			/>
		);

		if ( isNewHostedSiteCreationFlow( flowName ) ) {
			return translate(
				'Create a site with WordPress.com, and get all the power of lightning-fast, secure, and managed WordPress hosting.'
			);
		}

		if ( intent === 'plans-wordpress-hosting' ) {
			return translate(
				'All the security, flexibility, and control you need — without the overhead.'
			);
		}

		if ( intent === 'plans-website-builder' ) {
			if ( deemphasizeFreePlan ) {
				if ( shouldUseModalBackedFreePlanCTA ) {
					return translate(
						'Everything you need to go from idea to one-of-a-kind site, blog, or newsletter.'
					);
				}

				return translate(
					'Everything you need to go from idea to one-of-a-kind site, blog, or newsletter. Or {{link}}start with our free plan{{/link}}.',
					{ components: { link: freePlanButton } }
				);
			}
			return translate(
				'Everything you need to go from idea to one-of-a-kind site, blog, or newsletter.'
			);
		}

		if ( intent === 'plans-woo-hosted' ) {
			if ( ! currentPlan && ! selectedSite?.plan ) {
				return null;
			}
			const isOnTrial =
				currentPlan?.productSlug === PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY ||
				selectedSite?.plan?.product_slug === PLAN_WOO_HOSTED_FREE_TRIAL_MONTHLY;

			if ( isOnTrial ) {
				const daysLeft = currentPlan?.expiry
					? Math.ceil( moment.utc( currentPlan.expiry ).diff( moment().utc(), 'days', true ) )
					: null;

				if ( daysLeft !== null && daysLeft >= 1 ) {
					return translate(
						'Your free trial ends in %(daysLeft)d day — select a plan to keep your online store.',
						'Your free trial ends in %(daysLeft)d days — select a plan to keep your online store.',
						{ count: daysLeft, args: { daysLeft } }
					);
				}
				return translate( 'Your free trial ends soon — select a plan to keep your online store.' );
			}
			return translate( 'Choose the plan that fits your business.' );
		}

		if ( intent === 'plans-woo-hosting-solutions' ) {
			return translate(
				'All plans come with WooCommerce. Pick the level of support and features you want.'
			);
		}

		if ( useEmailOnboardingSubheader ) {
			return translate(
				'Add more features to your professional website with a plan. Or {{link}}start with email and a free site{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}

		// Keep the non-modal CTA in Step.Heading. Paid-domain/theme flows use
		// <PlansPageSubheader> so the CTA can open PlanUpsellModal first.
		if ( useStepContainerV2 && deemphasizeFreePlan && ! shouldUseModalBackedFreePlanCTA ) {
			return translate(
				'Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}

		if ( deemphasizeFreePlanFromProps ) {
			return null;
		}

		if ( isOnboardingFlow( flowName ) || intent === 'plans-upgrade' ) {
			return translate( 'Whatever site you’re building, there’s a plan to make it happen sooner.' );
		}
	};

	const fallbackHeaderText = fallbackHeaderTextFromProps || getHeaderText();
	const fallbackSubHeaderText = fallbackSubHeaderTextFromProps || getSubheaderText();

	let backUrl;
	let backLabelText;

	if ( 0 === positionInFlow && initializedSitesBackUrl ) {
		backUrl = initializedSitesBackUrl;
		backLabelText = translate( 'Back to sites' );
	}

	let queryParams;
	if (
		! isNaN( Number( positionInFlow ) ) &&
		'undefined' !== typeof positionInFlow &&
		0 !== positionInFlow &&
		steps
	) {
		const previousStepName = steps[ positionInFlow - 1 ];
		const previousStep = progress?.[ previousStepName ];

		const isComingFromUseYourDomainStep = 'use-your-domain' === previousStep?.stepSectionName;

		if ( isComingFromUseYourDomainStep ) {
			queryParams = {
				...( queryParamsFromProps && queryParamsFromProps ),
				step: 'transfer-or-connect',
				initialQuery: previousStep?.siteUrl,
			};

			if (
				( ONBOARDING_FLOW === flowName || 'onboarding-pm' === flowName ) &&
				undefined === previousStep?.providedDependencies?.domainItem
			) {
				backUrl = getStepUrl( flowName, 'domains' );
			}
		}
	}

	const intervalTypeValue = intervalType || getIntervalType( path );

	let freeWPComSubdomain: string | undefined;
	if ( typeof siteUrl === 'string' && siteUrl.includes( '.wordpress.com' ) ) {
		freeWPComSubdomain = siteUrl;
	}

	const stepContent = (
		<div
			className={ clsx( {
				'step-container-v2__visual-split':
					intent === 'plans-wordpress-hosting' || intent === 'plans-website-builder',
			} ) }
		>
			{ 'invalid' === step?.status && (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ step?.errors?.message }
					</Notice>
				</div>
			) }
			<PlansFeaturesMain
				paidDomainName={ paidDomainName }
				freeSubdomain={ freeWPComSubdomain }
				siteTitle={ siteTitle ?? undefined }
				signupFlowUserName={ username ?? undefined }
				siteId={ selectedSite?.ID }
				isDomainTransfer={ domainCartItem ? isDomainTransfer( domainCartItem ) : false }
				isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				intervalType={
					intervalTypeValue as 'monthly' | 'yearly' | '2yearly' | '3yearly' | undefined
				}
				displayedIntervals={ displayedIntervals }
				onUpgradeClick={ handleUpgradeClick }
				customerType={ customerType }
				deemphasizeFreePlan={ deemphasizeFreePlan }
				renderFreePlanCtaInStepContainerV2={ shouldUseModalBackedFreePlanCTA }
				plansWithScroll={ isDesktop }
				intent={ intent }
				flowName={ flowName }
				isStepperUpgradeFlow={ isStepperUpgradeFlow }
				hideFreePlan={ hideFreePlan && ! deemphasizeFreePlan }
				hidePersonalPlan={ hidePersonalPlan }
				hidePremiumPlan={ hidePremiumPlan }
				hideEcommercePlan={ shouldHideEcommercePlan() }
				hideEnterprisePlan={ hideEnterprisePlan }
				removePaidDomain={ handleRemovePaidDomain }
				setSiteUrlAsFreeDomainSuggestion={ handleSetSiteUrlAsFreeDomainSuggestion }
				coupon={ coupon ?? undefined }
				showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
				onPlanIntervalUpdate={ onPlanIntervalUpdate }
				selectedThemeType={ selectedThemeType }
				selectedFeature={ selectedFeature }
				onReady={ useStepContainerV2 ? handlePlansReady : undefined }
				renderSiblingWhenLoaded={ () => {
					if ( ! isNewHostedSiteCreationFlow( flowName ) ) {
						return null;
					}

					return <AsyncLoad require={ loadPlanFaq } placeholder={ null } />;
				} }
			/>
		</div>
	);

	if ( useStepContainerV2 && wrapperProps ) {
		const goBack = wrapperProps.hideBack ? undefined : wrapperProps.goBack;

		return (
			<>
				{ /*
				 * The layout mounts hidden (CSS: visibility:hidden + position:absolute) so
				 * PlansFeaturesMain's data-fetching hooks run immediately. Step.Loading
				 * overlays until onReady fires, then both swap in a single React commit.
				 *
				 * This is intentionally a one-way latch: once ready, we don't re-hide on
				 * subsequent data refetches (e.g. intent toggle) — PlansFeaturesMain's
				 * internal Spinner handles those transitions. The latch resets naturally
				 * on step remount (stepper uses key={step.slug}).
				 */ }
				{ ! isContentReady && <Step.Loading /> }
				<div aria-hidden={ ! isContentReady ? true : undefined }>
					<MarketingMessage path="signup/plans" />
					<Step.WideLayout
						headingColumnWidth={ 6 }
						className={ clsx( 'step-container-v2--plans', {
							'is-plans-loading': ! isContentReady,
						} ) }
						topBar={
							<Step.TopBar
								leftElement={
									goBack ? (
										<Step.BackButton onClick={ goBack }>{ backLabelText }</Step.BackButton>
									) : undefined
								}
								rightElement={
									isOnboardingFlow( flowName ) ? (
										<>
											{ stepCounter && (
												<Step.StepCounter
													current={ stepCounter.current }
													total={ stepCounter.total }
												/>
											) }
											<Step.LinkButton onClick={ toggleHelpCenter }>
												{ translate( 'Need help?' ) }
											</Step.LinkButton>
										</>
									) : undefined
								}
							/>
						}
						heading={
							<>
								{ ( intent === 'plans-website-builder' ||
									intent === 'plans-wordpress-hosting' ) && (
									<IntentToggle
										currentIntent={ intent }
										onIntentChange={ ( newIntent ) => {
											onIntentChange?.( newIntent );
										} }
									/>
								) }
								<Step.Heading text={ getHeaderText() } subText={ fallbackSubHeaderText } />
							</>
						}
					>
						{ stepContent }
					</Step.WideLayout>
				</div>
			</>
		);
	}

	const classes = clsx( 'plans plans-step', {
		'has-no-sidebar': true,
		'is-wide-layout': false,
		'is-extra-wide-layout': true,
	} );

	return (
		<>
			<MarketingMessage path="signup/plans" />
			<div className={ classes }>
				{ useStepperWrapper && wrapperProps ? (
					// This is biased towards Stepper. It will always load Stepper's StepContainer but only load /start's StepWrapper if /start is used.
					// This is because Stepper's plans page is much more likely (90%+ of the time) to be used than /start's plans page.
					<StepContainer
						flowName={ flowName }
						stepName={ stepName }
						stepContent={ stepContent }
						backLabelText={ backLabelText }
						isWideLayout={ false }
						isExtraWideLayout={ wrapperProps.isExtraWideLayout }
						isFullLayout={ wrapperProps.isFullLayout }
						formattedHeader={
							<FormattedHeader
								id="plans-header"
								align="center"
								headerText={ getHeaderText() }
								subHeaderText={ fallbackSubHeaderText }
							/>
						}
						recordTracksEvent={ recordTracksEvent }
						hideBack={ wrapperProps.hideBack }
						goBack={ wrapperProps.goBack }
					/>
				) : (
					<AsyncLoad
						/**
						 * Common Start/Stepper props [START]
						 */
						require={ loadStepWrapper }
						flowName={ flowName }
						stepName={ stepName }
						stepContent={ stepContent }
						isWideLayout={ false }
						isExtraWideLayout
						backLabelText={ backLabelText }
						/**
						 * Common Start/Stepper props [END]
						 */
						backUrl={ backUrl }
						positionInFlow={ positionInFlow }
						headerText={ getHeaderText() }
						shouldHideNavButtons={ shouldHideNavButtons }
						fallbackHeaderText={ fallbackHeaderText }
						subHeaderText={ getSubheaderText() }
						fallbackSubHeaderText={ fallbackSubHeaderText }
						allowBackFirstStep={ !! initializedSitesBackUrl }
						queryParams={ queryParams }
					/>
				) }
			</div>
		</>
	);
}

export default UnifiedPlansStep;
