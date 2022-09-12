import config from '@automattic/calypso-config';
import {
	isDomainRegistration,
	isDomainTransfer,
	isDomainMapping,
} from '@automattic/calypso-products';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import debugModule from 'debug';
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
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import OlarkChat from 'calypso/components/olark-chat';
import {
	recordSignupStart,
	recordSignupComplete,
	recordSignupStep,
	recordSignupInvalidStep,
	recordSignupProcessingScreen,
	recordSignupPlanChange,
} from 'calypso/lib/analytics/signup';
import * as oauthToken from 'calypso/lib/oauth-token';
import SignupFlowController from 'calypso/lib/signup/flow-controller';
import FlowProgressIndicator from 'calypso/signup/flow-progress-indicator';
import P2SignupProcessingScreen from 'calypso/signup/p2-processing-screen';
import SignupProcessingScreen from 'calypso/signup/processing-screen';
import ReskinnedProcessingScreen from 'calypso/signup/reskinned-processing-screen';
import SignupHeader from 'calypso/signup/signup-header';
import TailoredFlowProcessingScreen from 'calypso/signup/tailored-flow-processing-screen';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import {
	isUserLoggedIn,
	getCurrentUser,
	currentUserHasFlag,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { submitSignupStep, removeStep, addStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { submitSiteType } from 'calypso/state/signup/steps/site-type/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSiteId,
	isCurrentPlanPaid,
	getSitePlanSlug,
	getSitePlanName,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import flows from './config/flows';
import { getStepComponent } from './config/step-components';
import steps from './config/steps';
import { addP2SignupClassName } from './controller';
import {
	persistSignupDestination,
	setSignupCompleteSlug,
	getSignupCompleteSlug,
	setSignupCompleteFlowName,
} from './storageUtils';
import {
	canResumeFlow,
	getCompletedSteps,
	getDestination,
	getFirstInvalidStep,
	getStepUrl,
	isReskinnedFlow,
	isP2Flow,
} from './utils';
import WpcomLoginForm from './wpcom-login-form';
import './style.scss';

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

function showProgressIndicator( flowName ) {
	const DISABLED_PROGRESS_INDICATOR_FLOWS = [ 'pressable-nux', 'setup-site', 'importer', 'domain' ];

	return ! DISABLED_PROGRESS_INDICATOR_FLOWS.includes( flowName );
}

class Signup extends Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool,
		isLoggedIn: PropTypes.bool,
		isEmailVerified: PropTypes.bool,
		loadTrackingTool: PropTypes.func.isRequired,
		submitSiteType: PropTypes.func.isRequired,
		submitSignupStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object,
		siteDomains: PropTypes.array,
		sitePlanName: PropTypes.string,
		sitePlanSlug: PropTypes.string,
		isPaidPlan: PropTypes.bool,
		flowName: PropTypes.string,
		stepName: PropTypes.string,
		pageTitle: PropTypes.string,
		siteType: PropTypes.string,
		stepSectionName: PropTypes.string,
	};

	state = {
		controllerHasReset: false,
		shouldShowLoadingScreen: false,
		resumingStep: undefined,
		previousFlowName: null,
		signupSiteName: null,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		const flow = flows.getFlow( this.props.flowName, this.props.isLoggedIn );
		const queryObject = this.props.initialContext?.query ?? {};

		let providedDependencies;

		if ( flow.providesDependenciesInQuery ) {
			providedDependencies = pick( queryObject, flow.providesDependenciesInQuery );
		}

		// Prevent duplicate sites, check pau2Xa-1Io-p2#comment-6759.
		if ( this.props.isManageSiteFlow ) {
			providedDependencies = {
				siteSlug: getSignupCompleteSlug(),
				isManageSiteFlow: this.props.isManageSiteFlow,
			};
		}

		this.signupFlowController = new SignupFlowController( {
			flowName: this.props.flowName,
			providedDependencies,
			reduxStore: this.props.store,
			onComplete: this.handleSignupFlowControllerCompletion,
		} );

		this.removeFulfilledSteps( this.props );

		this.updateShouldShowLoadingScreen();

		if ( canResumeFlow( this.props.flowName, this.props.progress, this.props.isLoggedIn ) ) {
			// Resume from the current window location
			return;
		}

		if ( this.getPositionInFlow() !== 0 ) {
			// Flow is not resumable; redirect to the beginning of the flow.
			// Set `resumingStep` to prevent flash of incorrect step before the redirect.
			const destinationStep = flows.getFlow( this.props.flowName, this.props.isLoggedIn )
				.steps[ 0 ];
			this.setState( { resumingStep: destinationStep } );
			const locale = ! this.props.isLoggedIn ? this.props.locale : '';
			return page.redirect( getStepUrl( this.props.flowName, destinationStep, undefined, locale ) );
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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

		if ( isReskinnedFlow( flowName ) ) {
			document.body.classList.add( 'is-white-signup' );
			debug( 'In componentWillReceiveProps, addded is-white-signup class' );
		} else {
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
		recordSignupStart( this.props.flowName, this.props.refParameter, this.getRecordProps() );
		if ( ! this.state.shouldShowLoadingScreen ) {
			recordSignupStep( this.props.flowName, this.props.stepName, this.getRecordProps() );
		}
		this.preloadNextStep();
	}

	componentDidUpdate( prevProps ) {
		const { flowName, stepName, signupDependencies, sitePlanName, sitePlanSlug } = this.props;

		if (
			( flowName !== prevProps.flowName || stepName !== prevProps.stepName ) &&
			! this.state.shouldShowLoadingScreen
		) {
			recordSignupStep( flowName, stepName, this.getRecordProps() );
		}

		if (
			get( signupDependencies, 'siteType' ) !== get( prevProps.signupDependencies, 'siteType' )
		) {
			this.startTrackingForBusinessSite();
		}

		if ( stepName !== prevProps.stepName ) {
			this.preloadNextStep();
			// `scrollToTop` here handles cases where the viewport may fall slightly below the top of the page when the next step is rendered
			this.scrollToTop();
		}

		if ( sitePlanSlug && prevProps.sitePlanSlug && sitePlanSlug !== prevProps.sitePlanSlug ) {
			recordSignupPlanChange(
				flowName,
				stepName,
				prevProps.sitePlanName,
				prevProps.sitePlanSlug,
				sitePlanName,
				sitePlanSlug
			);
		}

		// Several steps in the P2 signup flow require a logged in user.
		if ( isP2Flow( this.props.flowName ) && ! this.props.isLoggedIn && stepName !== 'user' ) {
			debug( 'P2 signup: logging in user', this.props.signupDependencies );

			// We want to be redirected to the next step.
			const destinationStep = flows.getFlow( this.props.flowName, this.props.isLoggedIn )
				.steps[ 1 ];
			const stepUrl = getStepUrl(
				this.props.flowName,
				destinationStep,
				undefined,
				this.props.locale
			);
			this.handleLogin( this.props.signupDependencies, stepUrl, false );
		}
	}

	getRecordProps() {
		const { signupDependencies } = this.props;

		return {
			theme: get( signupDependencies, 'selectedDesign.theme' ),
			intent: get( signupDependencies, 'intent' ),
			starting_point: get( signupDependencies, 'startingPoint' ),
		};
	}

	scrollToTop() {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}

	completeP2FlowAfterLoggingIn() {
		if ( ! this.props.flowName !== 'p2v1' || ! this.props.progress ) {
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

	handleSignupFlowControllerCompletion = async ( dependencies, destination ) => {
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
		const hasInvalidSteps = !! getFirstInvalidStep(
			this.props.flowName,
			progress,
			this.props.isLoggedIn
		);
		const waitingForServer = ! hasInvalidSteps && this.isEveryStepSubmitted( progress );
		const startLoadingScreen = waitingForServer && ! this.state.shouldShowLoadingScreen;

		if ( ! this.isEveryStepSubmitted( progress ) ) {
			this.goToFirstInvalidStep( progress );
		}

		if ( startLoadingScreen ) {
			recordSignupProcessingScreen(
				this.props.flowName,
				this.props.stepName,
				this.getRecordProps()
			);

			this.setState( { shouldShowLoadingScreen: true } );

			if ( isP2Flow( this.props.flowName ) ) {
				// Record submitted site name for displaying it in the loading screen
				if ( ! this.state.signupSiteName ) {
					this.setState( {
						signupSiteName: this.props.progress?.[ 'p2-site' ]?.form?.siteTitle?.value || '',
					} );
				}

				addLoadingScreenClassNamesToBody();

				// We have to add the P2 signup class name as well because it gets removed in the 'users' step.
				addP2SignupClassName();
			}
		}

		if ( hasInvalidSteps ) {
			this.setState( { shouldShowLoadingScreen: false } );

			if ( isP2Flow( this.props.flowName ) ) {
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
		const { flowName, isLoggedIn, stepName } = nextProps;
		const flowSteps = flows.getFlow( flowName, isLoggedIn ).steps;
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
		const selectedDesign = get( dependencies, 'selectedDesign' );
		const intent = get( dependencies, 'intent' );
		const startingPoint = get( dependencies, 'startingPoint' );

		const debugProps = {
			isNewishUser,
			existingSiteCount,
			isNewUser,
			hasCartItems,
			isNew7DUserSite,
			flow: this.props.flowName,
			siteId,
			theme: selectedDesign?.theme,
			intent,
			startingPoint,
		};
		debug( 'Tracking signup completion.', debugProps );

		recordSignupComplete( {
			flow: this.props.flowName,
			siteId,
			isNewUser,
			hasCartItems,
			isNew7DUserSite,
			// Record the following values so that we can know the user completed which branch under the hero flow
			theme: selectedDesign?.theme,
			intent,
			startingPoint,
			isBlankCanvas: isBlankCanvasDesign( dependencies.selectedDesign ),
		} );

		this.handleLogin( dependencies, destination );
	};

	handleLogin( dependencies, destination, resetSignupFlowController = true ) {
		const userIsLoggedIn = this.props.isLoggedIn;

		debug( `Logging you in to "${ destination }"` );

		if ( resetSignupFlowController ) {
			this.signupFlowController.reset();

			if ( ! this.state.controllerHasReset ) {
				this.setState( { controllerHasReset: true } );
			}
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
				debug( 'Performing regular login' );
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
		// The `stepName` might be undefined after the user finish the last step but the value of
		// `isEveryStepSubmitted` is still false. Thus, check the `stepName` here to avoid going
		// to invalid step.
		if ( stepName && ! this.isEveryStepSubmitted() ) {
			const locale = ! this.props.isLoggedIn ? this.props.locale : '';
			const { siteId, siteSlug } = this.props.initialContext?.query ?? {};
			page( getStepUrl( flowName, stepName, stepSectionName, locale, { siteId, siteSlug } ) );
		} else if ( this.isEveryStepSubmitted() ) {
			this.goToFirstInvalidStep();
		}
	};

	// `nextFlowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToNextStep = ( nextFlowName = this.props.flowName ) => {
		const flowSteps = flows.getFlow( nextFlowName, this.props.isLoggedIn ).steps;
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
		const firstInvalidStep = getFirstInvalidStep(
			this.props.flowName,
			progress,
			this.props.isLoggedIn
		);
		const { siteId, siteSlug } = this.props.initialContext?.query ?? {};

		if ( firstInvalidStep ) {
			recordSignupInvalidStep( this.props.flowName, this.props.stepName );

			if ( firstInvalidStep.stepName === this.props.stepName ) {
				// No need to redirect
				debug( `Already navigated to the first invalid step: ${ firstInvalidStep.stepName }` );
				return;
			}

			const locale = ! this.props.isLoggedIn ? this.props.locale : '';
			debug( `Navigating to the first invalid step: ${ firstInvalidStep.stepName }` );
			page(
				getStepUrl( this.props.flowName, firstInvalidStep.stepName, '', locale, {
					siteId,
					siteSlug,
				} )
			);
		}
	};

	isEveryStepSubmitted = ( progress = this.props.progress ) => {
		const flowSteps = flows.getFlow( this.props.flowName, this.props.isLoggedIn ).steps;
		const completedSteps = getCompletedSteps(
			this.props.flowName,
			progress,
			{},
			this.props.isLoggedIn
		);
		return flowSteps.length === completedSteps.length;
	};

	getPositionInFlow() {
		const { flowName, stepName } = this.props;
		return flows.getFlow( flowName, this.props.isLoggedIn ).steps.indexOf( stepName );
	}

	getInteractiveStepsCount() {
		const flowStepsSlugs = flows.getFlow( this.props.flowName, this.props.isLoggedIn ).steps;
		const flowSteps = flowStepsSlugs.filter( ( step ) => ! steps[ step ].props?.nonInteractive );
		return flowSteps.length;
	}

	renderProcessingScreen( isReskinned ) {
		if ( isP2Flow( this.props.flowName ) ) {
			return <P2SignupProcessingScreen signupSiteName={ this.state.signupSiteName } />;
		}

		if ( isNewsletterOrLinkInBioFlow( this.props.flowName ) ) {
			return <TailoredFlowProcessingScreen flowName={ this.props.flowName } />;
		}

		if ( isReskinned ) {
			const domainItem = get( this.props, 'signupDependencies.domainItem', {} );
			const hasPaidDomain = isDomainRegistration( domainItem );
			const destination = this.signupFlowController.getDestination();
			const setupSiteFlowPath = config.isEnabled( 'signup/stepper-flow' )
				? '/setup'
				: '/start/setup-site';

			return (
				<ReskinnedProcessingScreen
					flowName={ this.props.flowName }
					hasPaidDomain={ hasPaidDomain }
					isDestinationSetupSiteFlow={ destination.startsWith( setupSiteFlowPath ) }
				/>
			);
		}

		return <SignupProcessingScreen flowName={ this.props.flowName } />;
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
		const flow = flows.getFlow( this.props.flowName, this.props.isLoggedIn );
		const planWithDomain =
			this.props.domainsWithPlansOnly &&
			domainItem &&
			( isDomainRegistration( domainItem ) ||
				isDomainTransfer( domainItem ) ||
				isDomainMapping( domainItem ) );

		const { siteId, siteSlug } = this.props.initialContext?.query ?? {};

		// Hide the free option in the signup flow
		const selectedHideFreePlan = get( this.props, 'signupDependencies.shouldHideFreePlan', false );
		const hideFreePlan = planWithDomain || this.props.isDomainOnlySite || selectedHideFreePlan;
		const shouldRenderLocaleSuggestions = 0 === this.getPositionInFlow() && ! this.props.isLoggedIn;

		let propsForCurrentStep = propsFromConfig;
		if ( this.props.isManageSiteFlow ) {
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
							queryParams={ { siteId, siteSlug } }
							{ ...propsForCurrentStep }
						/>
					) }
				</div>
			</div>
		);
	}

	shouldWaitToRender() {
		const isStepRemovedFromFlow = ! includes(
			flows.getFlow( this.props.flowName, this.props.isLoggedIn ).steps,
			this.props.stepName
		);
		const isDomainsForSiteEmpty =
			this.props.isLoggedIn &&
			this.props.signupDependencies.siteSlug &&
			0 === this.props.siteDomains.length;
		const isImportingFlow = this.props.flowName === 'from' && this.props.stepName === 'importing';

		if ( isStepRemovedFromFlow ) {
			return true;
		}

		// siteDomains is sometimes empty, so we need to force update.
		if ( isDomainsForSiteEmpty && ! isImportingFlow ) {
			return <QuerySiteDomains siteId={ this.props.siteId } />;
		}
	}

	getPageTitle() {
		if ( isNewsletterOrLinkInBioFlow( this.props.flowName ) ) {
			return this.props.pageTitle;
		}
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

		const isReskinned = isReskinnedFlow( this.props.flowName );
		const olarkIdentity = config( 'olark_chat_identity' );
		const olarkSystemsGroupId = '2dfd76a39ce77758f128b93942ae44b5';
		const isEligibleForOlarkChat =
			'onboarding' === this.props.flowName &&
			[ 'en', 'en-gb' ].includes( this.props.localeSlug ) &&
			this.props.existingSiteCount < 1;

		return (
			<>
				<div className={ `signup is-${ kebabCase( this.props.flowName ) }` }>
					<DocumentHead title={ this.props.pageTitle } />
					{ ! isP2Flow( this.props.flowName ) && (
						<SignupHeader
							progressBar={ {
								flowName: this.props.flowName,
								stepName: this.props.stepName,
							} }
							pageTitle={ this.getPageTitle() }
							shouldShowLoadingScreen={ this.state.shouldShowLoadingScreen }
							isReskinned={ isReskinned }
							rightComponent={
								showProgressIndicator( this.props.flowName ) && (
									<FlowProgressIndicator
										positionInFlow={ this.getPositionInFlow() }
										flowLength={ this.getInteractiveStepsCount() }
										flowName={ this.props.flowName }
									/>
								)
							}
						/>
					) }
					<div className="signup__steps">{ this.renderCurrentStep( isReskinned ) }</div>
					{ this.state.bearerToken && (
						<WpcomLoginForm
							authorization={ 'Bearer ' + this.state.bearerToken }
							log={ this.state.username }
							redirectTo={ this.state.redirectTo }
						/>
					) }
				</div>
				{ isEligibleForOlarkChat && (
					<OlarkChat
						systemsGroupId={ olarkSystemsGroupId }
						identity={ olarkIdentity }
						shouldDisablePreChatSurvey
					/>
				) }
			</>
		);
	}
}

export default connect(
	( state ) => {
		const signupDependencies = getSignupDependencyStore( state );

		// Use selectedSiteId which was set by setSelectedSiteForSignup of controller
		// If we don't have selectedSiteId, then fallback to use getSiteId by siteSlug
		// Note that siteSlug might not be updated as the value was updated when the Signup component will mount
		// and we initialized SignupFlowController
		// See: https://github.com/Automattic/wp-calypso/pull/57386
		const siteId = getSelectedSiteId( state ) || getSiteId( state, signupDependencies.siteSlug );
		const siteDomains = getDomainsBySiteId( state, siteId );

		return {
			domainsWithPlansOnly: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) // this is intentional, not a mistake
				: true,
			isDomainOnlySite: isDomainOnlySite( state, siteId ),
			progress: getSignupProgress( state ),
			signupDependencies,
			isLoggedIn: isUserLoggedIn( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			isNewishUser: isUserRegistrationDaysWithinRange( state, null, 0, 7 ),
			existingSiteCount: getCurrentUserSiteCount( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			sitePlanName: getSitePlanName( state, siteId ),
			sitePlanSlug: getSitePlanSlug( state, siteId ),
			siteDomains,
			siteId,
			siteType: getSiteType( state ),
			localeSlug: getCurrentLocaleSlug( state ),
		};
	},
	{
		submitSiteType,
		submitSignupStep,
		removeStep,
		loadTrackingTool,
		addStep,
	}
)( Signup );
