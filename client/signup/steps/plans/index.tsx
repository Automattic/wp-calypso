import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { UrlFriendlyTermType } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	isSiteAssemblerFlow,
	isTailoredSignupFlow,
	isOnboardingGuidedFlow,
	ONBOARDING_GUIDED_FLOW,
} from '@automattic/onboarding';
import { PlansIntent } from '@automattic/plans-grid-next';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { isDesktop as isDesktopViewport, subscribeIsDesktop } from '@automattic/viewport';
import { useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { parse as parseQs } from 'qs';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
import { getSegmentedIntent } from 'calypso/my-sites/plans/utils/get-segmented-intent';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import useLongerPlanTermDefaultExperiment from 'calypso/my-sites/plans-features-main/hooks/experiments/use-longer-plan-term-default-experiment';
import { getStepUrl } from 'calypso/signup/utils';
import { getDomainFromUrl } from 'calypso/site-profiler/utils/get-valid-url';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import isDomainOnlySiteSelector from 'calypso/state/selectors/is-domain-only-site';
import {
	saveSignupStep as saveSignupStepAction,
	submitSignupStep as submitSignupStepAction,
} from 'calypso/state/signup/progress/actions';
import { StepState } from 'calypso/state/signup/progress/schema';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { SurveyData } from '../initial-intent/types';
import { getIntervalType, shouldBasePlansOnSegment } from './util';
import './style.scss';

interface Props {
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
	// Upgrade Handler - END

	/**
	 * Make required once Start is removed
	 */
	saveSignupStep?: ( step: { stepName: string } ) => void;

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
		domainInfo: {
			domainItem?: { meta?: string };
			signupDomainOrigin?: string;
		}
	) => void;

	signupDependencies: {
		siteId?: number | null;
		siteSlug?: string | null;
		siteUrl?: string | null;
		domainItem?: { meta?: string } | null;
		siteTitle?: string | null;
		username?: string | null;
		coupon?: string | null;
		segmentationSurveyAnswers?: SurveyData;
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
		hideBack: boolean;
		goBack: NavigationControls[ 'goBack' ];
		recordTracksEvent: ( eventName: string, eventProperties: object ) => void;
		isFullLayout: boolean;
		isExtraWideLayout: boolean;
	};

	shouldHideNavButtons?: boolean;
	selectedSite?: SiteDetails;
	intent?: PlansIntent;
	isLaunchPage?: boolean;
	intervalType?: string;
	initialContext?: {
		trailMapExperimentVariant?: null | 'treatment_guided' | 'treatment_survey_only';
	};
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
	 * @deprecated used only in "mailbox-plan" step (old Signup/Start)
	 */
	useEmailOnboardingSubheader?: boolean;

	/**
	 * Used only in "onboarding-pm" flow (old Signup/Start)
	 */
	isCustomDomainAllowedOnFreePlan?: boolean;
}

export function PlansStep( {
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
	initialContext,
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
	isCustomDomainAllowedOnFreePlan,
	fallbackHeaderText: fallbackHeaderTextFromProps,
	fallbackSubHeaderText: fallbackSubHeaderTextFromProps,
	progress,
	queryParams: queryParamsFromProps,
	shouldHideNavButtons,
}: Props ) {
	const [ isDesktop, setIsDesktop ] = useState< boolean | undefined >( isDesktopViewport() );
	const dispatch = useDispatch();
	const longerPlanTermDefaultExperiment = useLongerPlanTermDefaultExperiment();
	const translate = useTranslate();
	const initializedSitesBackUrl = useSelector( ( state ) =>
		getCurrentUserSiteCount( state ) ? '/sites/' : null
	);

	const customerType =
		customerTypeFromProps ??
		( parseQs( path?.split( '?' ).pop() ?? '' ).customerType as string ) ??
		undefined;

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

	const effectiveSubmitSignupStep =
		submitSignupStepFromProps ??
		function ( stepInfo: object, domainInfo: object ) {
			dispatch( submitSignupStepAction( stepInfo, domainInfo ) );
		};

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

	const onSelectPlan = ( cartItems?: MinimalRequestCartProduct[] | null ) => {
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
	};

	const getCustomerType = () => {
		if ( customerType ) {
			return customerType;
		}

		return 'personal';
	};

	const removePaidDomain = () => {
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
	};

	const setSiteUrlAsFreeDomainSuggestion = ( freeDomainSuggestion: {
		domain_name: string;
		product_slug?: string;
	} ) => {
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
	};

	const shouldHideEcommercePlan = () => {
		return isSiteAssemblerFlow( flowName ) || hideEcommercePlan;
	};

	const plansFeaturesList = () => {
		const intervalTypeValue =
			intervalType ||
			getIntervalType(
				path,
				flowName === 'onboarding' && longerPlanTermDefaultExperiment?.term
					? longerPlanTermDefaultExperiment.term
					: undefined
			);

		let errorDisplay;

		if ( 'invalid' === step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ step?.errors?.message }
					</Notice>
				</div>
			);
		}

		const { siteUrl, domainItem, siteTitle, username, coupon, segmentationSurveyAnswers } =
			signupDependencies;

		const { segmentSlug } = getSegmentedIntent( segmentationSurveyAnswers );

		const surveyedIntent = shouldBasePlansOnSegment(
			flowName,
			initialContext?.trailMapExperimentVariant
		)
			? segmentSlug
			: undefined;

		let paidDomainName = domainItem?.meta;

		if ( ! paidDomainName && isDomainOnlySite && selectedSite?.URL ) {
			paidDomainName = getDomainFromUrl( selectedSite.URL );
		}

		let freeWPComSubdomain;
		if ( typeof siteUrl === 'string' && siteUrl.includes( '.wordpress.com' ) ) {
			freeWPComSubdomain = siteUrl;
		}

		const deemphasizeFreePlan =
			( [ 'onboarding', ONBOARDING_GUIDED_FLOW ].includes( flowName ) && paidDomainName != null ) ||
			deemphasizeFreePlanFromProps;

		return (
			<div>
				{ errorDisplay }
				<PlansFeaturesMain
					paidDomainName={ paidDomainName }
					freeSubdomain={ freeWPComSubdomain }
					siteTitle={ siteTitle ?? undefined }
					signupFlowUserName={ username ?? undefined }
					siteId={ selectedSite?.ID }
					isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
					isInSignup
					isLaunchPage={ isLaunchPage }
					intervalType={
						intervalTypeValue as 'monthly' | 'yearly' | '2yearly' | '3yearly' | undefined
					}
					displayedIntervals={ displayedIntervals }
					onUpgradeClick={ ( cartItems ) => onSelectPlan( cartItems ) }
					customerType={ getCustomerType() }
					deemphasizeFreePlan={ deemphasizeFreePlan }
					plansWithScroll={ isDesktop }
					intent={ intent || surveyedIntent }
					flowName={ flowName }
					hideFreePlan={ hideFreePlan }
					hidePersonalPlan={ hidePersonalPlan }
					hidePremiumPlan={ hidePremiumPlan }
					hideEcommercePlan={ shouldHideEcommercePlan() }
					hideEnterprisePlan={ hideEnterprisePlan }
					removePaidDomain={ removePaidDomain }
					setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
					coupon={ coupon ?? undefined }
					showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
					onPlanIntervalUpdate={ onPlanIntervalUpdate }
				/>
			</div>
		);
	};

	const getHeaderText = () => {
		if ( headerText ) {
			return headerText;
		}

		return translate( 'Choose your flavor of WordPress' );
	};

	const getSubHeaderText = () => {
		const { segmentationSurveyAnswers } = signupDependencies;
		const { segmentSlug } = getSegmentedIntent( segmentationSurveyAnswers );

		if (
			isOnboardingGuidedFlow( flowName ) &&
			segmentSlug === 'plans-guided-segment-developer-or-agency'
		) {
			const a4aLinkButton = (
				<Button
					href={ localizeUrl( 'https://wordpress.com/for-agencies?ref=onboarding' ) }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ () => recordTracksEvent( 'calypso_guided_onboarding_agency_link_click' ) }
					borderless
				/>
			);

			return translate(
				'Are you an agency? Get bulk discounts and premier support with {{link}}Automattic for Agencies{{/link}}.',
				{ components: { link: a4aLinkButton } }
			);
		}

		const freePlanButton = (
			<Button
				onClick={ () =>
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
						null
					)
				}
				borderless
			/>
		);

		if ( useEmailOnboardingSubheader ) {
			return translate(
				'Add more features to your professional website with a plan. Or {{link}}start with email and a free site{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}

		if ( deemphasizeFreePlanFromProps ) {
			return null;
		}
	};

	const plansFeaturesSelection = () => {
		const headerText = getHeaderText();
		const fallbackHeaderText = fallbackHeaderTextFromProps || headerText;
		const subHeaderText = getSubHeaderText();
		const fallbackSubHeaderText = fallbackSubHeaderTextFromProps || subHeaderText;

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
					( 'onboarding' === flowName || 'onboarding-pm' === flowName ) &&
					undefined === previousStep?.providedDependencies?.domainItem
				) {
					backUrl = getStepUrl( flowName, 'domains' );
				}
			}
		}

		if ( useStepperWrapper ) {
			return (
				// TODO clk: confirm what's missing here
				<AsyncLoad
					require="@automattic/onboarding/src/step-container"
					flowName={ flowName }
					stepName={ stepName }
					formattedHeader={
						<FormattedHeader
							id="plans-header"
							align="center"
							subHeaderAlign="center"
							headerText={ headerText }
							subHeaderText={ fallbackSubHeaderText }
						/>
					}
					isWideLayout={ false }
					isExtraWideLayout
					stepContent={ plansFeaturesList() }
					backLabelText={ backLabelText }
					{ ...wrapperProps }
				/>
			);
		}

		return (
			<AsyncLoad
				require="calypso/signup/step-wrapper"
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				shouldHideNavButtons={ shouldHideNavButtons }
				fallbackHeaderText={ fallbackHeaderText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				isWideLayout={ false }
				isExtraWideLayout
				stepContent={ plansFeaturesList() }
				allowBackFirstStep={ !! initializedSitesBackUrl }
				backUrl={ backUrl }
				backLabelText={ backLabelText }
				queryParams={ queryParams }
			/>
		);
	};

	const classes = clsx( 'plans plans-step', {
		'has-no-sidebar': true,
		'is-wide-layout': false,
		'is-extra-wide-layout': true,
	} );

	return (
		<>
			<MarketingMessage path="signup/plans" />
			<div className={ classes }>{ plansFeaturesSelection() }</div>
		</>
	);
}

export default PlansStep;
