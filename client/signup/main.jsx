/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';
import debugModule from 'debug';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import url from 'url';
import {
	assign,
	defer,
	find,
	get,
	includes,
	indexOf,
	isEqual,
	kebabCase,
	last,
	map,
	pick,
	startsWith,
} from 'lodash';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

// Components
import DocumentHead from 'components/data/document-head';
import LocaleSuggestions from 'components/locale-suggestions';
import SignupProcessingScreen from 'signup/processing-screen';
import SignupHeader from 'signup/signup-header';
import QuerySiteDomains from 'components/data/query-site-domains';

// Libraries
import analytics from 'lib/analytics';
import * as oauthToken from 'lib/oauth-token';
import { isDomainRegistration, isDomainTransfer, isDomainMapping } from 'lib/products-values';
import SignupActions from 'lib/signup/actions';
import SignupFlowController from 'lib/signup/flow-controller';
import { disableCart } from 'lib/upgrades/actions';

// State actions and selectors
import { loadTrackingTool } from 'state/analytics/actions';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { currentUserHasFlag, getCurrentUser, isUserLoggedIn } from 'state/current-user/selectors';
import { affiliateReferral } from 'state/refer/actions';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { setSurvey } from 'state/signup/steps/survey/actions';
import { submitSiteType } from 'state/signup/steps/site-type/actions';
import { submitSiteVertical } from 'state/signup/steps/site-vertical/actions';
import getSiteId from 'state/selectors/get-site-id';
import { isCurrentPlanPaid, getSitePlanSlug } from 'state/sites/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';

// Current directory dependencies
import steps from './config/steps';
import flows from './config/flows';
import stepComponents from './config/step-components';
import {
	canResumeFlow,
	getCompletedSteps,
	getDestination,
	getFilteredSteps,
	getFirstInvalidStep,
	getStepUrl,
} from './utils';
import WpcomLoginForm from './wpcom-login-form';
import SiteMockups from 'signup/site-mockup';

/**
 * Constants
 */
const debug = debugModule( 'calypso:signup' );

class Signup extends React.Component {
	static displayName = 'Signup';

	static contextTypes = {
		store: PropTypes.object,
	};

	static propTypes = {
		domainsWithPlansOnly: PropTypes.bool,
		isLoggedIn: PropTypes.bool,
		loadTrackingTool: PropTypes.func.isRequired,
		setSurvey: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object,
		siteDomains: PropTypes.array,
		isPaidPlan: PropTypes.bool,
		trackAffiliateReferral: PropTypes.func.isRequired,
	};

	constructor( props, context ) {
		super( props, context );

		this.state = {
			controllerHasReset: false,
			login: false,
			dependencies: props.signupDependencies,
			siteDomains: props.siteDomains,
			isPaidPlan: props.isPaidPlan,
			shouldShowLoadingScreen: false,
			resumingStep: undefined,
			loginHandler: null,
			hasCartItems: false,
			plans: false,
			previousFlowName: null,
		};
	}

	UNSAFE_componentWillMount() {
		// Signup updates the cart through `SignupCart`. To prevent
		// synchronization issues and unnecessary polling, the cart is disabled
		// here.
		disableCart();

		const flow = flows.getFlow( this.props.flowName );
		const queryObject = ( this.props.initialContext && this.props.initialContext.query ) || {};

		let providedDependencies;

		if ( flow.providesDependenciesInQuery ) {
			providedDependencies = pick( queryObject, flow.providesDependenciesInQuery );
		}

		// Caution: any signup Flux actions should happen after this initialization.
		// Otherwise, the redux adpatation layer won't work and the state can go off.
		this.signupFlowController = new SignupFlowController( {
			flowName: this.props.flowName,
			providedDependencies,
			reduxStore: this.context.store,
			onComplete: this.handleSignupFlowControllerCompletion,
		} );

		this.removeFulfilledSteps( this.props );

		this.updateShouldShowLoadingScreen();

		if ( canResumeFlow( this.props.flowName, this.props.progress ) ) {
			// Resume progress if possible
			return this.resumeProgress();
		}

		if ( this.getPositionInFlow() !== 0 ) {
			// Flow is not resumable; redirect to the beginning of the flow
			return page.redirect(
				getStepUrl(
					this.props.flowName,
					flows.getFlow( this.props.flowName ).steps[ 0 ],
					this.props.locale
				)
			);
		}

		this.checkForCartItems( this.props.signupDependencies );
		this.recordStep();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { signupDependencies, stepName, flowName, progress } = nextProps;

		this.removeFulfilledSteps( nextProps );

		if ( this.props.stepName !== stepName ) {
			this.recordStep( stepName, flowName );
		}

		if ( stepName === this.state.resumingStep ) {
			this.setState( { resumingStep: undefined } );
		}

		if ( cookie.parse( document.cookie )[ 'wp-affiliate-tracker' ] ) {
			this.setState( { plans: true } );
		}

		if ( this.props.flowName !== flowName ) {
			this.signupFlowController.changeFlowName( flowName );
		}

		if ( ! this.state.controllerHasReset && ! isEqual( this.props.progress, progress ) ) {
			this.updateShouldShowLoadingScreen( progress );
		}

		this.checkForCartItems( signupDependencies );
	}

	componentWillUnmount() {
		this.signupFlowController.cleanup();
	}

	componentDidMount() {
		debug( 'Signup component mounted' );
		this.startTrackingForBusinessSite();
		this.recordSignupStart();
	}

	componentDidUpdate( prevProps ) {
		if (
			get( this.props.signupDependencies, 'siteType' ) !==
			get( prevProps.signupDependencies, 'siteType' )
		) {
			this.startTrackingForBusinessSite();
		}
	}

	handleSignupFlowControllerCompletion = ( dependencies, destination ) => {
		const filteredDestination = getDestination( destination, dependencies, this.props.flowName );
		return this.handleFlowComplete( dependencies, filteredDestination );
	};

	startTrackingForBusinessSite() {
		const siteType = get( this.props.signupDependencies, 'siteType' );

		if ( siteType === 'business' ) {
			this.props.loadTrackingTool( 'HotJar' );
		}
	}

	recordSignupStart() {
		analytics.recordSignupStart( {
			flow: this.props.flowName,
			ref: this.props.refParameter,
		} );
		this.recordReferralVisit();
	}

	recordReferralVisit() {
		const urlPath = location.href;
		const parsedUrl = url.parse( urlPath, true );
		const affiliateId = parsedUrl.query.aff;
		const campaignId = parsedUrl.query.cid;
		const subId = parsedUrl.query.sid;

		if ( affiliateId && ! isNaN( affiliateId ) ) {
			// Record the referral in Tracks
			analytics.tracks.recordEvent( 'calypso_refer_visit', {
				flow: this.props.flowName,
				// The current page without any query params
				page: `${ parsedUrl.host }${ parsedUrl.pathname }`,
			} );
			this.props.trackAffiliateReferral( { affiliateId, campaignId, subId, urlPath } );
		}
	}

	updateShouldShowLoadingScreen = ( progress = this.props.progress ) => {
		const hasInvalidSteps = !! getFirstInvalidStep( this.props.flowName, progress ),
			waitingForServer = ! hasInvalidSteps && this.isEveryStepSubmitted( progress ),
			startLoadingScreen = waitingForServer && ! this.state.shouldShowLoadingScreen;

		if ( ! this.isEveryStepSubmitted( progress ) ) {
			this.goToFirstInvalidStep( progress );
		}

		if ( startLoadingScreen ) {
			this.setState( { shouldShowLoadingScreen: true } );
		}

		if ( hasInvalidSteps ) {
			this.setState( { shouldShowLoadingScreen: false } );
		}
	};

	processFulfilledSteps = ( stepName, nextProps ) => {
		if ( includes( flows.excludedSteps, stepName ) ) {
			return;
		}

		const isFulfilledCallback = steps[ stepName ].fulfilledStepCallback;
		const defaultDependencies = steps[ stepName ].defaultDependencies;
		isFulfilledCallback && isFulfilledCallback( stepName, defaultDependencies, nextProps );
	};

	removeFulfilledSteps = nextProps => {
		const { flowName, stepName } = nextProps;
		const flowSteps = flows.getFlow( flowName ).steps;
		map( flowSteps, flowStepName => this.processFulfilledSteps( flowStepName, nextProps ) );

		if ( includes( flows.excludedSteps, stepName ) ) {
			this.goToNextStep( flowName );
		}
	};

	checkForCartItems = signupDependencies => {
		const dependenciesContainCartItem = dependencies => {
			return (
				dependencies &&
				( dependencies.cartItem || dependencies.domainItem || dependencies.themeItem )
			);
		};

		if ( dependenciesContainCartItem( signupDependencies ) ) {
			this.setState( { hasCartItems: true } );
		}
	};

	recordStep = ( stepName = this.props.stepName, flowName = this.props.flowName ) => {
		analytics.tracks.recordEvent( 'calypso_signup_step_start', {
			flow: flowName,
			step: stepName,
		} );
	};

	handleFlowComplete = ( dependencies, destination ) => {
		debug( 'The flow is completed. Destination: %s', destination );

		const isNewUser = !! ( dependencies && dependencies.username );
		const isNewSite = !! ( dependencies && dependencies.siteSlug );
		const hasCartItems = !! (
			dependencies &&
			( dependencies.cartItem || dependencies.domainItem || dependencies.themeItem )
		);
		const isNewUserOnFreePlan = isNewUser && isNewSite && ! hasCartItems;

		analytics.recordSignupComplete( {
			isNewUser,
			isNewSite,
			hasCartItems,
			isNewUserOnFreePlan,
			flow: this.props.flowName,
		} );

		if ( dependencies.cartItem || dependencies.domainItem ) {
			this.handleLogin( dependencies, destination );
		} else {
			this.setState( {
				loginHandler: this.handleLogin.bind( this, dependencies, destination ),
			} );
		}
	};

	handleLogin = ( dependencies, destination, event ) => {
		const userIsLoggedIn = this.props.isLoggedIn;

		if ( event && event.redirectTo ) {
			destination = event.redirectTo;
		}

		debug( `Logging you in to "${ destination }"` );

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
				this.signupFlowController.reset();
				window.location.href = destination;
			} );
		}

		if ( ! userIsLoggedIn && ( config.isEnabled( 'oauth' ) || dependencies.oauth2_client_id ) ) {
			debug( `Handling oauth login` );
			oauthToken.setToken( dependencies.bearer_token );
			this.signupFlowController.reset();
			window.location.href = destination;
			return;
		}

		if ( ! userIsLoggedIn && ! config.isEnabled( 'oauth' ) ) {
			debug( `Handling regular login` );

			const { bearer_token: bearerToken, username } = dependencies;

			if ( this.state.bearerToken !== bearerToken && this.state.username !== username ) {
				this.setState( {
					bearerToken: dependencies.bearer_token,
					username: dependencies.username,
					redirectTo: this.loginRedirectTo( destination ),
				} );
			}
		}
	};

	loginRedirectTo = path => {
		let redirectTo;

		if ( startsWith( path, 'https://' ) || startsWith( path, 'http://' ) ) {
			return path;
		}

		redirectTo = window.location.protocol + '//' + window.location.hostname; // Don't force https because of local development

		if ( window.location.port ) {
			redirectTo += ':' + window.location.port;
		}
		return redirectTo + path;
	};

	firstUnsubmittedStepName = () => {
		const currentSteps = flows.getFlow( this.props.flowName ).steps,
			signupProgress = getFilteredSteps( this.props.flowName, this.props.progress ),
			nextStepName = currentSteps[ signupProgress.length ],
			firstInProgressStep = find( signupProgress, { status: 'in-progress' } ) || {},
			firstInProgressStepName = firstInProgressStep.stepName;

		return firstInProgressStepName || nextStepName || last( currentSteps );
	};

	resumeProgress = () => {
		// Update the Flows object to know that the signup flow is being resumed.
		flows.resumingFlow = true;

		const firstUnsubmittedStep = this.firstUnsubmittedStepName(),
			stepSectionName = firstUnsubmittedStep.stepSectionName;

		// set `resumingStep` so we don't render/animate anything until we have mounted this step
		this.setState( { firstUnsubmittedStep } );

		return page.redirect(
			getStepUrl( this.props.flowName, firstUnsubmittedStep, stepSectionName, this.props.locale )
		);
	};

	// `flowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToStep = ( stepName, stepSectionName, flowName = this.props.flowName ) => {
		if ( this.state.scrolling ) {
			return;
		}

		// animate the scroll position to the top
		const scrollPromise = new Promise( resolve => {
			this.setState( { scrolling: true } );

			const scrollIntervalId = setInterval( () => {
				if ( window.pageYOffset > 0 ) {
					window.scrollBy( 0, -10 );
				} else {
					this.setState( { scrolling: false } );
					resolve( clearInterval( scrollIntervalId ) );
				}
			}, 1 );
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
		const flowSteps = flows.getFlow( nextFlowName, this.props.stepName ).steps,
			currentStepIndex = indexOf( flowSteps, this.props.stepName ),
			nextStepName = flowSteps[ currentStepIndex + 1 ],
			nextProgressItem = this.props.progress[ currentStepIndex + 1 ],
			nextStepSection = ( nextProgressItem && nextProgressItem.stepSectionName ) || '';

		if ( nextFlowName !== this.props.flowName ) {
			SignupActions.changeSignupFlow( nextFlowName );
			this.setState( { previousFlowName: this.props.flowName } );
		}

		this.goToStep( nextStepName, nextStepSection, nextFlowName );
	};

	goToFirstInvalidStep = ( progress = this.props.progress ) => {
		const firstInvalidStep = getFirstInvalidStep( this.props.flowName, progress );

		if ( firstInvalidStep ) {
			analytics.tracks.recordEvent( 'calypso_signup_goto_invalid_step', {
				step: firstInvalidStep.stepName,
				flow: this.props.flowName,
			} );

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
		return indexOf( flows.getFlow( flowName ).steps, stepName );
	}

	getFlowLength() {
		return flows.getFlow( this.props.flowName ).steps.length;
	}

	renderCurrentStep() {
		const domainItem = get( this.props, 'signupDependencies.domainItem', false );
		const currentStepProgress = find( this.props.progress, { stepName: this.props.stepName } ),
			CurrentComponent = stepComponents[ this.props.stepName ],
			propsFromConfig = assign( {}, this.props, steps[ this.props.stepName ].props ),
			stepKey = this.state.shouldShowLoadingScreen ? 'processing' : this.props.stepName,
			flow = flows.getFlow( this.props.flowName ),
			hideFreePlan = !! (
				this.state.plans ||
				( ( isDomainRegistration( domainItem ) ||
					isDomainTransfer( domainItem ) ||
					isDomainMapping( domainItem ) ) &&
					this.props.domainsWithPlansOnly )
			);
		const shouldRenderLocaleSuggestions = 0 === this.getPositionInFlow() && ! this.props.isLoggedIn;

		return (
			<div className="signup__step" key={ stepKey }>
				<div className={ `signup__step is-${ kebabCase( this.props.stepName ) }` }>
					{ shouldRenderLocaleSuggestions && (
						<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
					) }
					{ this.state.shouldShowLoadingScreen ? (
						<SignupProcessingScreen
							hasCartItems={ this.state.hasCartItems }
							steps={ this.props.progress }
							loginHandler={ this.state.loginHandler }
							signupDependencies={ this.props.signupDependencies }
							flowName={ this.props.flowName }
							flowSteps={ flow.steps }
						/>
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
							signupProgress={ this.props.progress }
							signupDependencies={ this.props.signupDependencies }
							stepSectionName={ this.props.stepSectionName }
							positionInFlow={ this.getPositionInFlow() }
							hideFreePlan={ hideFreePlan }
							{ ...propsFromConfig }
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

	render() {
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

		const pageTitle =
			this.props.flowName === 'account'
				? translate( 'Create an account' )
				: translate( 'Create a site' );
		const showProgressIndicator = 'pressable-nux' === this.props.flowName ? false : true;

		return (
			<div className={ `signup is-${ kebabCase( this.props.flowName ) }` }>
				<DocumentHead title={ pageTitle } />
				<SignupHeader
					positionInFlow={ this.getPositionInFlow() }
					flowLength={ this.getFlowLength() }
					flowName={ this.props.flowName }
					showProgressIndicator={ showProgressIndicator }
					shouldShowLoadingScreen={ this.state.shouldShowLoadingScreen }
				/>
				<div className="signup__steps">{ this.renderCurrentStep() }</div>
				{ this.state.bearerToken && (
					<WpcomLoginForm
						authorization={ 'Bearer ' + this.state.bearerToken }
						log={ this.state.username }
						redirectTo={ this.state.redirectTo }
					/>
				) }
				{ get( steps[ this.props.stepName ], 'props.showSiteMockups', false ) && <SiteMockups stepName={ this.props.stepName } /> }
			</div>
		);
	}
}

export default connect(
	state => {
		const signupDependencies = getSignupDependencyStore( state );
		const siteId = getSiteId( state, signupDependencies.siteSlug );
		const siteDomains = getDomainsBySiteId( state, siteId );
		return {
			domainsWithPlansOnly: getCurrentUser( state )
				? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
				: true,
			progress: getSignupProgress( state ),
			signupDependencies,
			isLoggedIn: isUserLoggedIn( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			sitePlanSlug: getSitePlanSlug( state, siteId ),
			siteDomains,
			siteId,
		};
	},
	{
		setSurvey,
		submitSiteType,
		submitSiteVertical,
		loadTrackingTool,
		trackAffiliateReferral: affiliateReferral,
	},
	undefined,
	{ pure: false }
)( Signup );
