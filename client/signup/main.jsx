/**
 * External dependencies
 */
import debugModule from 'debug';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import {
	clone,
	defer,
	find,
	get,
	includes,
	isEmpty,
	isEqual,
	kebabCase,
	map,
	omit,
	pick,
	startsWith,
} from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import * as oauthToken from 'calypso/lib/oauth-token';
import {
	isDomainRegistration,
	isDomainTransfer,
	isDomainMapping,
} from '@automattic/calypso-products';
import SignupFlowController from 'calypso/lib/signup/flow-controller';
import {
	recordSignupStart,
	recordSignupComplete,
	recordSignupStep,
	recordSignupInvalidStep,
} from 'calypso/lib/analytics/signup';
import DocumentHead from 'calypso/components/data/document-head';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import SignupProcessingScreen from 'calypso/signup/processing-screen';
import SignupHeader from 'calypso/signup/signup-header';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import {
	isUserLoggedIn,
	getCurrentUser,
	currentUserHasFlag,
	getCurrentUserSiteCount,
} from 'calypso/state/current-user/selectors';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { submitSignupStep, removeStep, addStep } from 'calypso/state/signup/progress/actions';
import { setSurvey } from 'calypso/state/signup/steps/survey/actions';
import { submitSiteType } from 'calypso/state/signup/steps/site-type/actions';
import { submitSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import { getSiteId, isCurrentPlanPaid, getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { isSitePreviewVisible } from 'calypso/state/signup/preview/selectors';
import { showSitePreview, hideSitePreview } from 'calypso/state/signup/preview/actions';
import steps from './config/steps';
import flows from './config/flows';
import { getStepComponent } from './config/step-components';
import {
	canResumeFlow,
	getCompletedSteps,
	getDestination,
	getFirstInvalidStep,
	getStepUrl,
} from './utils';
import {
	persistSignupDestination,
	retrieveSignupDestination,
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	getSignupCompleteSlug,
	getSignupCompleteFlowName,
	setSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
} from './storageUtils';
import WpcomLoginForm from './wpcom-login-form';
import SiteMockups from './site-mockup';
import P2SignupProcessingScreen from 'calypso/signup/p2-processing-screen';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { ProvideExperimentData } from 'calypso/lib/explat';

/**
 * Style dependencies
 */
import './style.scss';
import { addP2SignupClassName } from './controller';

const debug = debugModule( 'calypso:signup' );

function dependenciesContainCartItem( dependencies ) {
	return !! (
		dependencies &&
		( dependencies.cartItem || dependencies.domainItem || dependencies.themeItem )
	);
}

function addLoadingScreenClassNamesToBody() {
	if ( ! document ) {
		return;
	}

	document.body.classList.add( 'has-loading-screen-signup' );
}

function removeLoadingScreenClassNamesFromBody() {
	if ( ! document ) {
		return;
	}

	document.body.classList.remove( 'has-loading-screen-signup' );
}

function isWPForTeamsFlow( flowName ) {
	return flowName === 'p2';
}

class Signup extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool,
		isLoggedIn: PropTypes.bool,
		loadTrackingTool: PropTypes.func.isRequired,
		setSurvey: PropTypes.func.isRequired,
		submitSiteType: PropTypes.func.isRequired,
		submitSiteVertical: PropTypes.func.isRequired,
		submitSignupStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object,
		siteDomains: PropTypes.array,
		isPaidPlan: PropTypes.bool,
		flowName: PropTypes.string,
		stepName: PropTypes.string,
		pageTitle: PropTypes.string,
		siteType: PropTypes.string,
		stepSectionName: PropTypes.string,
		shouldShowMockups: PropTypes.bool,
	};

	state = {
		controllerHasReset: false,
		shouldShowLoadingScreen: false,
		resumingStep: undefined,
		previousFlowName: null,
	};

	UNSAFE_componentWillMount() {
		const flow = flows.getFlow( this.props.flowName );
		const queryObject = ( this.props.initialContext && this.props.initialContext.query ) || {};

		let providedDependencies;

		if ( flow.providesDependenciesInQuery ) {
			providedDependencies = pick( queryObject, flow.providesDependenciesInQuery );
		}

		const searchParams = new URLSearchParams( window.location.search );
		const isAddNewSiteFlow = searchParams.has( 'ref' );

		if ( isAddNewSiteFlow ) {
			clearSignupDestinationCookie();
		}

		// Prevent duplicate sites, check pau2Xa-1Io-p2#comment-6759.
		if ( ! isAddNewSiteFlow && this.isReEnteringSignupViaBrowserBack() ) {
			this.enableManageSiteFlow = true;
			providedDependencies = { siteSlug: getSignupCompleteSlug(), isManageSiteFlow: true };
		}

		this.signupFlowController = new SignupFlowController( {
			flowName: this.props.flowName,
			providedDependencies,
			reduxStore: this.props.store,
			onComplete: this.handleSignupFlowControllerCompletion,
		} );

		this.removeFulfilledSteps( this.props );

		this.updateShouldShowLoadingScreen();

		// Only applies to the P2 signup flow (/start/p2) and only after logging in to
		// a WP.com account during the signup flow.
		this.completeP2FlowAfterLoggingIn();

		if ( canResumeFlow( this.props.flowName, this.props.progress ) ) {
			// Resume from the current window location
			return;
		}

		if ( this.getPositionInFlow() !== 0 ) {
			// Flow is not resumable; redirect to the beginning of the flow.
			// Set `resumingStep` to prevent flash of incorrect step before the redirect.
			const destinationStep = flows.getFlow( this.props.flowName ).steps[ 0 ];
			this.setState( { resumingStep: destinationStep } );
			return page.redirect( getStepUrl( this.props.flowName, destinationStep, this.props.locale ) );
		}

		this.isReskinned = false;
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { stepName, flowName, progress } = nextProps;

		if ( this.props.stepName !== stepName ) {
			this.removeFulfilledSteps( nextProps );
		}

		if ( stepName === this.state.resumingStep ) {
			this.setState( { resumingStep: undefined } );
		}

		if ( this.props.flowName !== flowName ) {
			this.signupFlowController.changeFlowName( flowName );
		}

		if ( ! this.state.controllerHasReset && ! isEqual( this.props.progress, progress ) ) {
			this.updateShouldShowLoadingScreen( progress );
		}

		if ( ! this.isReskinned ) {
			document.body.classList.remove( 'is-white-signup' );
			debug( 'In componentWillReceiveProps, removed is-white-signup class' );
		}
	}

	componentWillUnmount() {
		this.signupFlowController.cleanup();
	}

	componentDidMount() {
		debug( 'Signup component mounted' );
		this.startTrackingForBusinessSite();
		recordSignupStart( this.props.flowName, this.props.refParameter );
		recordSignupStep( this.props.flowName, this.props.stepName );
		this.preloadNextStep();
		this.maybeShowSitePreview();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.flowName !== prevProps.flowName ||
			this.props.stepName !== prevProps.stepName
		) {
			recordSignupStep( this.props.flowName, this.props.stepName );
		}

		if (
			get( this.props.signupDependencies, 'siteType' ) !==
			get( prevProps.signupDependencies, 'siteType' )
		) {
			this.startTrackingForBusinessSite();
		}

		if ( this.props.stepName !== prevProps.stepName ) {
			this.maybeShowSitePreview();
			this.preloadNextStep();
		}
	}

	/**
	 * Checks if the user entered the signup flow via browser back from checkout page,
	 * and if they did we will show a modified domain step to prevent creating duplicate sites.
	 * Check pau2Xa-1Io-p2#comment-6759 for more context.
	 */
	isReEnteringSignupViaBrowserBack() {
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === this.props.flowName;
		const isReEnteringSignupViaBrowserBack =
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;

		return isReEnteringSignupViaBrowserBack;
	}

	completeP2FlowAfterLoggingIn() {
		if ( ! this.props.progress ) {
			return;
		}

		const p2SiteStep = this.props.progress[ 'p2-site' ];

		if ( p2SiteStep && p2SiteStep.status === 'pending' && this.props.isLoggedIn ) {
			// By removing and adding the p2-site step, we trigger the `SignupFlowController` store listener
			// to process the signup flow.
			this.props.removeStep( p2SiteStep );
			this.props.addStep( p2SiteStep );
		}
	}

	maybeShowSitePreview() {
		// Only show the site preview on main step pages, not sub step section screens
		if ( this.props.shouldStepShowSitePreview && ! this.props.stepSectionName ) {
			this.props.showSitePreview();
		} else {
			this.props.hideSitePreview();
		}
	}

	handleSignupFlowControllerCompletion = async ( dependencies, destination ) => {
		// See comment below for `this.bizxSurveyTimerComplete`
		if ( this.bizxSurveyTimerComplete && window && window.hj ) {
			await this.bizxSurveyTimerComplete;
		}

		const filteredDestination = getDestination(
			destination,
			dependencies,
			this.props.flowName,
			this.props.localeSlug
		);

		// If the filtered destination is different from the flow destination (e.g. changes to checkout), then save the flow destination so the user ultimately arrives there
		if ( destination !== filteredDestination ) {
			persistSignupDestination( destination );
			setSignupCompleteSlug( dependencies.siteSlug );
			setSignupCompleteFlowName( this.props.flowName );
		}

		return this.handleFlowComplete( dependencies, filteredDestination );
	};

	startTrackingForBusinessSite() {
		const siteType = get( this.props.signupDependencies, 'siteType' );

		if ( siteType === 'business' ) {
			this.props.loadTrackingTool( 'HotJar' );
		}
	}

	updateShouldShowLoadingScreen = ( progress = this.props.progress ) => {
		const hasInvalidSteps = !! getFirstInvalidStep( this.props.flowName, progress );
		const waitingForServer = ! hasInvalidSteps && this.isEveryStepSubmitted( progress );
		const startLoadingScreen = waitingForServer && ! this.state.shouldShowLoadingScreen;

		if ( ! this.isEveryStepSubmitted( progress ) ) {
			this.goToFirstInvalidStep( progress );
		}

		if ( startLoadingScreen ) {
			this.setState( { shouldShowLoadingScreen: true } );
			/* Temporary change to add a 10 second delay to the processing screen.
			 * This is done to allow the user 10 seconds to answer the bizx survey
			 */
			if ( ! this.bizxSurveyTimerComplete ) {
				this.bizxSurveyTimerComplete = new Promise( ( resolve ) => setTimeout( resolve, 10000 ) );
			}

			if ( isWPForTeamsFlow( this.props.flowName ) ) {
				addLoadingScreenClassNamesToBody();

				// We have to add the P2 signup class name as well because it gets removed in the 'users' step.
				addP2SignupClassName();
			}
		}

		if ( hasInvalidSteps ) {
			this.setState( { shouldShowLoadingScreen: false } );

			if ( isWPForTeamsFlow( this.props.flowName ) ) {
				removeLoadingScreenClassNamesFromBody();
			}
		}
	};

	processFulfilledSteps = ( stepName, nextProps ) => {
		const isFulfilledCallback = steps[ stepName ].fulfilledStepCallback;
		const defaultDependencies = steps[ stepName ].defaultDependencies;
		isFulfilledCallback && isFulfilledCallback( stepName, defaultDependencies, nextProps );
	};

	removeFulfilledSteps = ( nextProps ) => {
		const { flowName, stepName } = nextProps;
		const flowSteps = flows.getFlow( flowName ).steps;
		const excludedSteps = clone( flows.excludedSteps );
		map( excludedSteps, ( flowStepName ) => this.processFulfilledSteps( flowStepName, nextProps ) );
		map( flowSteps, ( flowStepName ) => this.processFulfilledSteps( flowStepName, nextProps ) );

		if ( includes( flows.excludedSteps, stepName ) ) {
			this.goToNextStep( flowName );
		}
	};

	preloadNextStep() {
		const currentStepName = this.props.stepName;
		const nextStepName = flows.getNextStepNameInFlow( this.props.flowName, currentStepName );

		nextStepName && getStepComponent( nextStepName );
	}

	handleFlowComplete = ( dependencies, destination ) => {
		debug( 'The flow is completed. Destination: %s', destination );

		const { isNewishUser, existingSiteCount } = this.props;

		const isNewUser = !! ( dependencies && dependencies.username );
		const siteId = dependencies && dependencies.siteId;
		const isNew7DUserSite = !! (
			isNewUser ||
			( isNewishUser && dependencies && dependencies.siteSlug && existingSiteCount <= 1 )
		);
		const hasCartItems = dependenciesContainCartItem( dependencies );

		const debugProps = {
			isNewishUser,
			existingSiteCount,
			isNewUser,
			hasCartItems,
			isNew7DUserSite,
			flow: this.props.flowName,
			siteId,
		};
		debug( 'Tracking signup completion.', debugProps );

		recordSignupComplete( {
			flow: this.props.flowName,
			siteId,
			isNewUser,
			hasCartItems,
			isNew7DUserSite,
		} );

		this.handleLogin( dependencies, destination );
	};

	handleLogin( dependencies, destination ) {
		const userIsLoggedIn = this.props.isLoggedIn;

		debug( `Logging you in to "${ destination }"` );

		this.signupFlowController.reset();

		if ( ! this.state.controllerHasReset ) {
			this.setState( { controllerHasReset: true } );
		}

		if ( userIsLoggedIn ) {
			// don't use page.js for external URLs (eg redirect to new site after signup)
			if ( /^https?:\/\//.test( destination ) ) {
				return ( window.location.href = destination );
			}

			// deferred in case the user is logged in and the redirect triggers a dispatch
			defer( () => {
				debug( `Redirecting you to "${ destination }"` );
				window.location.href = destination;
			} );
		}

		if ( ! userIsLoggedIn && ( config.isEnabled( 'oauth' ) || dependencies.oauth2_client_id ) ) {
			debug( `Handling oauth login` );
			oauthToken.setToken( dependencies.bearer_token );
			window.location.href = destination;
			return;
		}

		if ( ! userIsLoggedIn && ! config.isEnabled( 'oauth' ) ) {
			debug( `Handling regular login` );

			const { bearer_token: bearerToken, username } = dependencies;

			if (
				isEmpty( bearerToken ) &&
				isEmpty( username ) &&
				'onboarding-registrationless' === this.props.flowName
			) {
				window.location.href = destination;
				return;
			}

			if ( this.state.bearerToken !== bearerToken && this.state.username !== username ) {
				this.setState( {
					bearerToken: dependencies.bearer_token,
					username: dependencies.username,
					redirectTo: this.loginRedirectTo( destination ),
				} );
			}
		}
	}

	loginRedirectTo = ( path ) => {
		if ( startsWith( path, 'https://' ) || startsWith( path, 'http://' ) ) {
			return path;
		}

		return window.location.origin + path;
	};

	// `flowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToStep = ( stepName, stepSectionName, flowName = this.props.flowName ) => {
		if ( this.state.scrolling ) {
			return;
		}

		// animate the scroll position to the top
		const scrollPromise = new Promise( ( resolve ) => {
			this.setState( { scrolling: true } );

			const ANIMATION_LENGTH_MS = 200;
			const startTime = window.performance.now();
			const scrollHeight = window.pageYOffset;

			const scrollToTop = ( timestamp ) => {
				const progress = timestamp - startTime;

				if ( progress < ANIMATION_LENGTH_MS ) {
					window.scrollTo( 0, scrollHeight - ( scrollHeight * progress ) / ANIMATION_LENGTH_MS );
					window.requestAnimationFrame( scrollToTop );
				} else {
					this.setState( { scrolling: false } );
					resolve();
				}
			};

			window.requestAnimationFrame( scrollToTop );
		} );

		// redirect the user to the next step
		scrollPromise.then( () => {
			if ( ! this.isEveryStepSubmitted() ) {
				page( getStepUrl( flowName, stepName, stepSectionName, this.props.locale ) );
			} else if ( this.isEveryStepSubmitted() ) {
				this.goToFirstInvalidStep();
			}
		} );
	};

	// `nextFlowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToNextStep = ( nextFlowName = this.props.flowName ) => {
		const flowSteps = flows.getFlow( nextFlowName ).steps;
		const currentStepIndex = flowSteps.indexOf( this.props.stepName );
		const nextStepName = flowSteps[ currentStepIndex + 1 ];
		const nextProgressItem = get( this.props.progress, nextStepName );
		const nextStepSection = ( nextProgressItem && nextProgressItem.stepSectionName ) || '';

		if ( nextFlowName !== this.props.flowName ) {
			this.setState( { previousFlowName: this.props.flowName } );
		}

		this.goToStep( nextStepName, nextStepSection, nextFlowName );
	};

	goToFirstInvalidStep = ( progress = this.props.progress ) => {
		const firstInvalidStep = getFirstInvalidStep( this.props.flowName, progress );

		if ( firstInvalidStep ) {
			recordSignupInvalidStep( this.props.flowName, this.props.stepName );

			if ( firstInvalidStep.stepName === this.props.stepName ) {
				// No need to redirect
				debug( `Already navigated to the first invalid step: ${ firstInvalidStep.stepName }` );
				return;
			}

			debug( `Navigating to the first invalid step: ${ firstInvalidStep.stepName }` );
			page( getStepUrl( this.props.flowName, firstInvalidStep.stepName, this.props.locale ) );
		}
	};

	isEveryStepSubmitted = ( progress = this.props.progress ) => {
		const flowSteps = flows.getFlow( this.props.flowName ).steps;
		const completedSteps = getCompletedSteps( this.props.flowName, progress );
		return flowSteps.length === completedSteps.length;
	};

	getPositionInFlow() {
		const { flowName, stepName } = this.props;
		return flows.getFlow( flowName ).steps.indexOf( stepName );
	}

	getFlowLength() {
		return flows.getFlow( this.props.flowName ).steps.length;
	}

	renderProcessingScreen( isReskinned ) {
		if ( isWPForTeamsFlow( this.props.flowName ) ) {
			return <P2SignupProcessingScreen />;
		}

		if ( isReskinned ) {
			const domainItem = get( this.props, 'signupDependencies.domainItem', false );
			const hasPaidDomain = isDomainRegistration( domainItem );

			return <ReskinnedProcessingScreen hasPaidDomain={ hasPaidDomain } />;
		}

		return (
			<SignupProcessingScreen
				flowName={ this.props.flowName }
				localeSlug={ this.props.localeSlug }
			/>
		);
	}

	renderCurrentStep( isReskinned ) {
		const domainItem = get( this.props, 'signupDependencies.domainItem', false );
		const currentStepProgress = find( this.props.progress, { stepName: this.props.stepName } );
		const CurrentComponent = this.props.stepComponent;
		const propsFromConfig = {
			...omit( this.props, 'locale' ),
			...steps[ this.props.stepName ].props,
		};
		const stepKey = this.state.shouldShowLoadingScreen ? 'processing' : this.props.stepName;
		const flow = flows.getFlow( this.props.flowName );
		const planWithDomain =
			this.props.domainsWithPlansOnly &&
			domainItem &&
			( isDomainRegistration( domainItem ) ||
				isDomainTransfer( domainItem ) ||
				isDomainMapping( domainItem ) );

		// Hide the free option in the signup flow
		const selectedHideFreePlan = get( this.props, 'signupDependencies.shouldHideFreePlan', false );
		const hideFreePlan = planWithDomain || this.props.isDomainOnlySite || selectedHideFreePlan;
		const shouldRenderLocaleSuggestions = 0 === this.getPositionInFlow() && ! this.props.isLoggedIn;

		let propsForCurrentStep = propsFromConfig;
		if ( this.enableManageSiteFlow ) {
			propsForCurrentStep = {
				...propsFromConfig,
				showExampleSuggestions: false,
				showSkipButton: true,
				includeWordPressDotCom: false,
			};
		}

		return (
			<div className="signup__step" key={ stepKey }>
				<div className={ `signup__step is-${ kebabCase( this.props.stepName ) }` }>
					{ shouldRenderLocaleSuggestions && (
						<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
					) }
					{ this.state.shouldShowLoadingScreen ? (
						this.renderProcessingScreen( isReskinned )
					) : (
						<CurrentComponent
							path={ this.props.path }
							step={ currentStepProgress }
							initialContext={ this.props.initialContext }
							steps={ flow.steps }
							stepName={ this.props.stepName }
							meta={ flow.meta || {} }
							goToNextStep={ this.goToNextStep }
							goToStep={ this.goToStep }
							previousFlowName={ this.state.previousFlowName }
							flowName={ this.props.flowName }
							signupDependencies={ this.props.signupDependencies }
							stepSectionName={ this.props.stepSectionName }
							positionInFlow={ this.getPositionInFlow() }
							hideFreePlan={ hideFreePlan }
							isReskinned={ isReskinned }
							{ ...propsForCurrentStep }
						/>
					) }
				</div>
			</div>
		);
	}

	shouldWaitToRender() {
		const isStepRemovedFromFlow = ! includes(
			flows.getFlow( this.props.flowName ).steps,
			this.props.stepName
		);
		const isDomainsForSiteEmpty =
			this.props.isLoggedIn &&
			this.props.signupDependencies.siteSlug &&
			0 === this.props.siteDomains.length;

		if ( isStepRemovedFromFlow ) {
			return true;
		}

		// siteDomains is sometimes empty, so we need to force update.
		if ( isDomainsForSiteEmpty ) {
			return <QuerySiteDomains siteId={ this.props.siteId } />;
		}
	}

	/**
	 * Temporary hack for adding a css class to the body
	 * for a user who is assigned to the reskinned group of reskinSignupFlow a/b test.
	 */
	addCssClassToBodyForReskinnedFlow() {
		document.body.classList.add( 'is-white-signup' );
	}

	render() {
		// Prevent rendering a step if in the middle of performing a redirect or resuming progress.
		if (
			! this.props.stepName ||
			( this.getPositionInFlow() > 0 && this.props.progress.length === 0 ) ||
			this.state.resumingStep
		) {
			return null;
		}

		// Removes flicker of steps that have been removed from the flow
		const waitToRenderReturnValue = this.shouldWaitToRender();
		if ( waitToRenderReturnValue && ! this.state.shouldShowLoadingScreen ) {
			return this.props.siteId && waitToRenderReturnValue;
		}

		const showProgressIndicator = 'pressable-nux' === this.props.flowName ? false : true;

		return (
			<ProvideExperimentData
				name="refined_reskin_v2"
				options={ { isEligible: 'onboarding' === this.props.flowName } }
			>
				{ ( isLoading, experimentAssignment ) => {
					if ( isLoading ) {
						debug( 'Waiting for experiment status to load' );
						return null;
					}

					this.isReskinned = 'treatment' === experimentAssignment?.variationName;
					this.isReskinned
						? document.body.classList.add( 'is-white-signup' )
						: document.body.classList.remove( 'is-white-signup' );
					debug( `isReskinned value is ${ this.isReskinned }` );

					return (
						<div className={ `signup is-${ kebabCase( this.props.flowName ) }` }>
							<DocumentHead title={ this.props.pageTitle } />
							{ ! isWPForTeamsFlow( this.props.flowName ) && (
								<SignupHeader
									positionInFlow={ this.getPositionInFlow() }
									flowLength={ this.getFlowLength() }
									flowName={ this.props.flowName }
									showProgressIndicator={ showProgressIndicator }
									shouldShowLoadingScreen={ this.state.shouldShowLoadingScreen }
									isReskinned={ this.isReskinned }
								/>
							) }
							<div className="signup__steps">{ this.renderCurrentStep( this.isReskinned ) }</div>
							{ ! this.state.shouldShowLoadingScreen && this.props.isSitePreviewVisible && (
								<SiteMockups stepName={ this.props.stepName } />
							) }
							{ this.state.bearerToken && (
								<WpcomLoginForm
									authorization={ 'Bearer ' + this.state.bearerToken }
									log={ this.state.username }
									redirectTo={ this.state.redirectTo }
								/>
							) }
						</div>
					);
				} }
			</ProvideExperimentData>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const signupDependencies = getSignupDependencyStore( state );
		const siteId = getSiteId( state, signupDependencies.siteSlug );
		const siteDomains = getDomainsBySiteId( state, siteId );
		const shouldStepShowSitePreview = get(
			steps[ ownProps.stepName ],
			'props.showSiteMockups',
			false
		);

		return {
			domainsWithPlansOnly: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) // this is intentional, not a mistake
				: true,
			isDomainOnlySite: isDomainOnlySite( state, siteId ),
			progress: getSignupProgress( state ),
			signupDependencies,
			isLoggedIn: isUserLoggedIn( state ),
			isNewishUser: isUserRegistrationDaysWithinRange( state, null, 0, 7 ),
			existingSiteCount: getCurrentUserSiteCount( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			sitePlanSlug: getSitePlanSlug( state, siteId ),
			siteDomains,
			siteId,
			siteType: getSiteType( state ),
			shouldStepShowSitePreview,
			isSitePreviewVisible: shouldStepShowSitePreview && isSitePreviewVisible( state ),
			localeSlug: getCurrentLocaleSlug( state ),
		};
	},
	{
		setSurvey,
		submitSiteType,
		submitSiteVertical,
		submitSignupStep,
		removeStep,
		loadTrackingTool,
		showSitePreview,
		hideSitePreview,
		addStep,
	}
)( Signup );
