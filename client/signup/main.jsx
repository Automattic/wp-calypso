/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';
import debugModule from 'debug';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import url from 'url';
import {
	assign,
	defer,
	delay,
	find,
	get,
	indexOf,
	isEmpty,
	isEqual,
	last,
	pick,
	startsWith,
} from 'lodash';
import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';

// Components
import DocumentHead from 'components/data/document-head';
import LocaleSuggestions from 'components/locale-suggestions';
import SignupProcessingScreen from 'signup/processing-screen';

// Libraries
import analytics from 'lib/analytics';
import { recordSignupStart, recordSignupCompletion } from 'lib/analytics/ad-tracking';
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
import { isValidLandingPageVertical } from 'lib/signup/verticals';

// Current directory dependencies
import steps from './config/steps';
import flows from './config/flows';
import stepComponents from './config/step-components';
import FlowProgressIndicator from './flow-progress-indicator';
import {
	canResumeFlow,
	getCompletedSteps,
	getDestination,
	getFilteredSteps,
	getFirstInvalidStep,
	getStepUrl,
} from './utils';
import WpcomLoginForm from './wpcom-login-form';

/**
 * Constants
 */
const debug = debugModule( 'calypso:signup' );
const MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED = 3000;

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
		trackAffiliateReferral: PropTypes.func.isRequired,
	};

	constructor( props, context ) {
		super( props, context );

		this.state = {
			controllerHasReset: false,
			login: false,
			dependencies: props.signupDependencies,
			loadingScreenStartTime: undefined,
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

		this.submitQueryDependencies();

		const flow = flows.getFlow( this.props.flowName );
		const queryObject = ( this.props.initialContext && this.props.initialContext.query ) || {};

		let providedDependencies;

		if ( flow.providesDependenciesInQuery ) {
			providedDependencies = pick( queryObject, flow.providesDependenciesInQuery );
		}

		this.signupFlowController = new SignupFlowController( {
			flowName: this.props.flowName,
			providedDependencies,
			reduxStore: this.context.store,
			onComplete: this.handleSignupFlowControllerCompletion,
		} );

		this.updateLoadingScreenStartTime();

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

	UNSAFE_componentWillReceiveProps( { signupDependencies, stepName, flowName, progress } ) {
		if ( this.props.stepName !== stepName ) {
			this.recordStep( stepName );
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
			this.updateLoadingScreenStartTime( progress );
		}

		this.checkForCartItems( signupDependencies );
	}

	componentDidMount() {
		debug( 'Signup component mounted' );
		this.recordSignupStart();
	}

	handleSignupFlowControllerCompletion = ( dependencies, destination ) => {
		const timeSinceLoading = this.state.loadingScreenStartTime
			? Date.now() - this.state.loadingScreenStartTime
			: undefined;
		const filteredDestination = getDestination( destination, dependencies, this.props.flowName );

		if ( timeSinceLoading && timeSinceLoading < MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED ) {
			return delay(
				this.handleFlowComplete.bind( this, dependencies, filteredDestination ),
				MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED - timeSinceLoading
			);
		}
		return this.handleFlowComplete( dependencies, filteredDestination );
	};

	recordSignupStart() {
		analytics.tracks.recordEvent( 'calypso_signup_start', {
			flow: this.props.flowName,
			ref: this.props.refParameter,
		} );
		this.recordReferralVisit();
		this.props.loadTrackingTool( 'HotJar' );
		recordSignupStart();
	}

	recordReferralVisit() {
		const urlPath = location.href;
		const parsedUrl = url.parse( urlPath, true );
		const affiliateId = parsedUrl.query.aff;
		const campaignId = parsedUrl.query.cid;

		if ( affiliateId && ! isNaN( affiliateId ) ) {
			this.props.trackAffiliateReferral( { affiliateId, campaignId, urlPath } );
			// Record the referral in Tracks
			analytics.tracks.recordEvent( 'calypso_refer_visit', {
				flow: this.props.flowName,
				// The current page without any query params
				page: `${ parsedUrl.host }${ parsedUrl.pathname }`,
			} );
		}
	}

	updateLoadingScreenStartTime = ( progress = this.props.progress ) => {
		const hasInvalidSteps = !! getFirstInvalidStep( this.props.flowName, progress ),
			waitingForServer = ! hasInvalidSteps && this.isEveryStepSubmitted( progress ),
			startLoadingScreen = waitingForServer && ! this.state.loadingScreenStartTime;

		if ( this.isEveryStepSubmitted( progress ) ) {
			this.goToFirstInvalidStep( progress );
		}

		if ( startLoadingScreen ) {
			this.setState( { loadingScreenStartTime: Date.now() } );
		}

		if ( hasInvalidSteps ) {
			this.setState( { loadingScreenStartTime: undefined } );
		}
	};

	submitQueryDependencies = () => {
		if ( isEmpty( this.props.initialContext && this.props.initialContext.query ) ) {
			return;
		}

		const queryObject = this.props.initialContext.query;
		const flowSteps = flows.getFlow( this.props.flowName ).steps;

		// `vertical` query parameter
		const vertical = queryObject.vertical;
		if ( 'undefined' !== typeof vertical && -1 === flowSteps.indexOf( 'survey' ) ) {
			debug( 'From query string: vertical = %s', vertical );
			this.props.setSurvey( {
				vertical,
				otherText: '',
			} );
			SignupActions.submitSignupStep( { stepName: 'survey' }, [], {
				surveySiteType: 'blog',
				surveyQuestion: vertical,
			} );
			// Track our landing page verticals
			if ( isValidLandingPageVertical( vertical ) ) {
				analytics.tracks.recordEvent( 'calypso_signup_vertical_landing_page', {
					vertical,
					flow: this.props.flowName,
				} );
			}
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

	recordStep = ( stepName = this.props.stepName ) => {
		analytics.tracks.recordEvent( 'calypso_signup_step_start', {
			flow: this.props.flowName,
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

		analytics.tracks.recordEvent( 'calypso_signup_complete', {
			flow: this.props.flowName,
			is_new_user: isNewUser,
			is_new_site: isNewSite,
			has_cart_items: hasCartItems,
			is_new_user_on_free_plan: isNewUserOnFreePlan,
		} );
		recordSignupCompletion( { isNewUser, isNewSite, hasCartItems, isNewUserOnFreePlan } );

		if (
			dependencies.cartItem ||
			dependencies.domainItem ||
			this.signupFlowController.shouldAutoContinue()
		) {
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

		this.setState( { controllerHasReset: true } );

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
			this.setState( {
				bearerToken: dependencies.bearer_token,
				username: dependencies.username,
				redirectTo: this.loginRedirectTo( destination ),
			} );
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
	// to `store-nux`. If not specified, the current flow (`this.props.flowName`) continues.
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
	// to `store-nux`. If not specified, the current flow (`this.props.flowName`) continues.
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
		return indexOf( flows.getFlow( this.props.flowName ).steps, this.props.stepName );
	}

	renderCurrentStep() {
		const domainItem = get( this.props, 'signupDependencies.domainItem', false );
		const currentStepProgress = find( this.props.progress, { stepName: this.props.stepName } ),
			CurrentComponent = stepComponents[ this.props.stepName ],
			propsFromConfig = assign( {}, this.props, steps[ this.props.stepName ].props ),
			stepKey = this.state.loadingScreenStartTime ? 'processing' : this.props.stepName,
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
				{ shouldRenderLocaleSuggestions && (
					<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
				) }
				{ this.state.loadingScreenStartTime ? (
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
		);
	}

	render() {
		if (
			! this.props.stepName ||
			( this.getPositionInFlow() > 0 && this.props.progress.length === 0 ) ||
			this.state.resumingStep
		) {
			return null;
		}

		const flow = flows.getFlow( this.props.flowName );
		const showProgressIndicator = 'pressable-nux' === this.props.flowName ? false : true;

		const pageTitle =
			this.props.flowName === 'account'
				? translate( 'Create an account' )
				: translate( 'Create a site' );

		return (
			<span>
				<DocumentHead title={ pageTitle } />
				{ ! this.state.loadingScreenStartTime &&
					showProgressIndicator && (
						<FlowProgressIndicator
							positionInFlow={ this.getPositionInFlow() }
							flowLength={ flow.steps.length }
							flowName={ this.props.flowName }
						/>
					) }
				<ReactCSSTransitionGroup
					component="div"
					className="signup__steps"
					transitionName="signup__step"
					transitionEnterTimeout={ 400 }
					transitionLeaveTimeout={ 400 }
				>
					{ this.renderCurrentStep() }
				</ReactCSSTransitionGroup>
				{ this.state.bearerToken && (
					<WpcomLoginForm
						authorization={ 'Bearer ' + this.state.bearerToken }
						log={ this.state.username }
						redirectTo={ this.state.redirectTo }
					/>
				) }
			</span>
		);
	}
}

export default connect(
	state => ( {
		domainsWithPlansOnly: getCurrentUser( state )
			? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
			: true,
		progress: getSignupProgress( state ),
		signupDependencies: getSignupDependencyStore( state ),
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{ setSurvey, loadTrackingTool, trackAffiliateReferral: affiliateReferral },
	undefined,
	{ pure: false }
)( Signup );
