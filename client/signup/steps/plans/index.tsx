import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	isSiteAssemblerFlow,
	isTailoredSignupFlow,
	isOnboardingGuidedFlow,
	ONBOARDING_GUIDED_FLOW,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { isDesktop as isDesktopViewport, subscribeIsDesktop } from '@automattic/viewport';
import { useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse as parseQs } from 'qs';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { getTld, isSubdomain } from 'calypso/lib/domains';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
import { getSegmentedIntent } from 'calypso/my-sites/plans/utils/get-segmented-intent';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import useLongerPlanTermDefaultExperiment from 'calypso/my-sites/plans-features-main/hooks/experiments/use-longer-plan-term-default-experiment';
import { getStepUrl } from 'calypso/signup/utils';
import { getDomainFromUrl } from 'calypso/site-profiler/utils/get-valid-url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import isDomainOnlySiteSelector from 'calypso/state/selectors/is-domain-only-site';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getIntervalType, shouldBasePlansOnSegment } from './util';
import './style.scss';

interface Props {
	saveSignupStep: ( step: { stepName: string } ) => void;
	flowName: string;
	stepName: string;
	/**
	 * TODO: Stepper pass something?
	 */
	customerType?: string;
	submitSignupStep: ( stepInfo: object, domainInfo: object ) => void;
	isCustomDomainAllowedOnFreePlan: boolean;
	displayedIntervals: any; // Define proper type
	onPlanIntervalUpdate: () => void;
	hidePersonalPlan: boolean;
	hidePremiumPlan: boolean;
	hideEnterprisePlan: boolean;
	recordTracksEvent: ( event: string ) => void;
	translate: ( text: string, options?: object ) => string;
	headerText?: string;
	fallbackHeaderText?: string;
	useEmailOnboardingSubheader: boolean;
	deemphasizeFreePlan: boolean;
	hasInitializedSitesBackUrl: string | null;
	steps: string[];
	wrapperProps: object;
	useStepperWrapper: boolean;
	queryParams: object;
	progress?: Record< string, any >; // Define proper type
	positionInFlow: number;
	shouldHideNavButtons: boolean;
	signupDependencies: {
		siteUrl?: string;
		domainItem?: { meta?: string };
		siteTitle?: string;
		username?: string;
		coupon?: string;
		segmentationSurveyAnswers?: any; // Define proper type
	};
	selectedSite: {
		URL?: string;
		ID?: number;
	};
	intent?: string;
	/**
	 * TODO: Stepper pass something?
	 */
	disableBloggerPlanWithNonBlogDomain: boolean;
	deemphasizeFreePlanFromProps: boolean;
	hideFreePlan: boolean;
	isLaunchPage: boolean;
	intervalType?: string;
	longerPlanTermDefaultExperiment?: { term?: string };
	isDomainOnlySite: boolean;
	initialContext?: {
		trailMapExperimentVariant?: null | 'treatment_guided' | 'treatment_survey_only';
	};
	/**
	 * TODO: Stepper pass something?
	 */
	path: string;
	step?: {
		status?: string;
		errors?: { message: string };
	};
}

export function PlansStep( props: Props ) {
	const [ isDesktop, setIsDesktop ] = useState< boolean | undefined >( isDesktopViewport() );

	useEffect( () => {
		const unsubscribe = subscribeIsDesktop( ( matchesDesktop ) => setIsDesktop( matchesDesktop ) );
		props.saveSignupStep( { stepName: props.stepName } );

		if ( isTailoredSignupFlow( props.flowName ) ) {
			triggerGuidesForStep( props.flowName, 'plans' );
		}

		return () => {
			unsubscribe();
		};
	}, [] );

	const onSelectPlan = ( cartItems?: MinimalRequestCartProduct[] | null ) => {
		buildUpgradeFunction( props, cartItems );
	};

	const getCustomerType = () => {
		if ( props.customerType ) {
			return props.customerType;
		}

		return 'personal';
	};

	const removePaidDomain = () => {
		const domainItem = undefined;

		props.submitSignupStep(
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

		props.submitSignupStep(
			{
				stepName: 'domains',
				siteUrl,
			},
			{}
		);
	};

	const plansFeaturesList = () => {
		const {
			disableBloggerPlanWithNonBlogDomain,
			deemphasizeFreePlan: deemphasizeFreePlanFromProps,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			intent,
			flowName,
			initialContext,
			intervalType,
			isDomainOnlySite,
			longerPlanTermDefaultExperiment,
		} = props;

		const intervalTypeValue =
			intervalType ||
			getIntervalType(
				props.path,
				flowName === 'onboarding' && longerPlanTermDefaultExperiment?.term
					? longerPlanTermDefaultExperiment.term
					: undefined
			);

		let errorDisplay;

		if ( 'invalid' === props.step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ props.step?.errors?.message }
					</Notice>
				</div>
			);
		}

		const { signupDependencies } = props;
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

		if ( ! paidDomainName && isDomainOnlySite && selectedSite.URL ) {
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
					siteTitle={ siteTitle }
					signupFlowUserName={ username }
					siteId={ selectedSite?.ID }
					isCustomDomainAllowedOnFreePlan={ props.isCustomDomainAllowedOnFreePlan }
					isInSignup
					isLaunchPage={ isLaunchPage }
					intervalType={ intervalTypeValue }
					displayedIntervals={ props.displayedIntervals }
					onUpgradeClick={ ( cartItems ) => onSelectPlan( cartItems ) }
					customerType={ getCustomerType() }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					deemphasizeFreePlan={ deemphasizeFreePlan }
					plansWithScroll={ isDesktop }
					intent={ intent || surveyedIntent }
					flowName={ flowName }
					hideFreePlan={ hideFreePlan }
					hidePersonalPlan={ props.hidePersonalPlan }
					hidePremiumPlan={ props.hidePremiumPlan }
					hideEcommercePlan={ shouldHideEcommercePlan() }
					hideEnterprisePlan={ props.hideEnterprisePlan }
					removePaidDomain={ removePaidDomain }
					setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
					coupon={ coupon }
					showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
					onPlanIntervalUpdate={ props.onPlanIntervalUpdate }
				/>
			</div>
		);
	};

	const renderLoading = () => {
		return (
			<div className="plans__loading">
				<LoadingEllipsis active />
			</div>
		);
	};

	const getHeaderText = () => {
		const { headerText, translate } = props;

		if ( headerText ) {
			return headerText;
		}

		return translate( 'Choose your flavor of WordPress' );
	};

	const getSubHeaderText = () => {
		const {
			translate,
			useEmailOnboardingSubheader,
			signupDependencies,
			flowName,
			deemphasizeFreePlan,
		} = props;

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
					onClick={ () => props.recordTracksEvent( 'calypso_guided_onboarding_agency_link_click' ) }
					borderless
				/>
			);

			return translate(
				'Are you an agency? Get bulk discounts and premier support with {{link}}Automattic for Agencies{{/link}}.',
				{ components: { link: a4aLinkButton } }
			);
		}

		const freePlanButton = (
			<Button onClick={ () => buildUpgradeFunction( props, null ) } borderless />
		);

		if ( useEmailOnboardingSubheader ) {
			return translate(
				'Add more features to your professional website with a plan. Or {{link}}start with email and a free site{{/link}}.',
				{ components: { link: freePlanButton } }
			);
		}

		if ( deemphasizeFreePlan ) {
			return null;
		}
	};

	const shouldHideEcommercePlan = () => {
		return isSiteAssemblerFlow( props.flowName ) || props.hideEcommercePlan;
	};

	const plansFeaturesSelection = () => {
		const {
			flowName,
			stepName,
			positionInFlow,
			translate,
			hasInitializedSitesBackUrl,
			steps,
			wrapperProps,
			useStepperWrapper,
		} = props;

		const headerText = getHeaderText();
		const fallbackHeaderText = props.fallbackHeaderText || headerText;
		const subHeaderText = getSubHeaderText();
		const fallbackSubHeaderText = props.fallbackSubHeaderText || subHeaderText;

		let backUrl;
		let backLabelText;

		if ( 0 === positionInFlow && hasInitializedSitesBackUrl ) {
			backUrl = hasInitializedSitesBackUrl;
			backLabelText = translate( 'Back to sites' );
		}

		let queryParams;
		if ( ! isNaN( Number( positionInFlow ) ) && 0 !== positionInFlow ) {
			const previousStepName = steps[ props.positionInFlow - 1 ];
			const previousStep = props.progress?.[ previousStepName ];

			const isComingFromUseYourDomainStep = 'use-your-domain' === previousStep?.stepSectionName;

			if ( isComingFromUseYourDomainStep ) {
				queryParams = {
					...props.queryParams,
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
				shouldHideNavButtons={ props.shouldHideNavButtons }
				fallbackHeaderText={ fallbackHeaderText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				isWideLayout={ false }
				isExtraWideLayout
				stepContent={ plansFeaturesList() }
				allowBackFirstStep={ !! hasInitializedSitesBackUrl }
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

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	flowName: PropTypes.string,
	intent: PropTypes.oneOf( [
		'plans-blog-onboarding',
		'plans-newsletter',
		'plans-link-in-bio',
		'plans-new-hosted-site',
		'plans-plugins',
		'plans-jetpack-app',
		'plans-import',
		'default',
	] ),
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
 * @param {Object} domainItem domainItem object stored in the "choose domain" step
 * @returns {boolean} is .blog domain registration
 */
export const isDotBlogDomainRegistration = ( domainItem ) => {
	if ( ! domainItem ) {
		return false;
	}
	const { is_domain_registration, meta } = domainItem;

	return is_domain_registration && getTld( meta ) === 'blog';
};

const WrappedPlansStep = ( props ) => {
	const longerPlanTermDefaultExperiment = useLongerPlanTermDefaultExperiment();

	return (
		<PlansStep { ...props } longerPlanTermDefaultExperiment={ longerPlanTermDefaultExperiment } />
	);
};

export default connect(
	( state, { path, signupDependencies: { siteSlug, siteId, domainItem } } ) => ( {
		// Blogger plan is only available if user chose either a free domain or a .blog domain registration
		disableBloggerPlanWithNonBlogDomain:
			domainItem && ! isSubdomain( domainItem.meta ) && ! isDotBlogDomainRegistration( domainItem ),
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		isDomainOnlySite:
			siteId || siteSlug ? isDomainOnlySiteSelector( state, siteId || siteSlug ) : false,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		hasInitializedSitesBackUrl: getCurrentUserSiteCount( state ) ? '/sites/' : false,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep, errorNotice }
)( localize( WrappedPlansStep ) );
