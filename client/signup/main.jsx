/**
 * External dependencies
 */
import debugModule from 'debug';
const debug = debugModule( 'calypso:signup' );
import React from 'react';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import page from 'page';
import startsWith from 'lodash/startsWith';
import sortBy from 'lodash/sortBy';
import last from 'lodash/last';
import find from 'lodash/find';
import some from 'lodash/some';
import defer from 'lodash/defer';
import delay from 'lodash/delay';
import assign from 'lodash/assign';
import matchesProperty from 'lodash/matchesProperty';
import indexOf from 'lodash/indexOf';
import reject from 'lodash/reject';

/**
 * Internal dependencies
 */
import config from 'config';
import SignupDependencyStore from 'lib/signup/dependency-store';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import SignupProgressStore from 'lib/signup/progress-store';
import SignupFlowController from 'lib/signup/flow-controller';
import LocaleSuggestions from './locale-suggestions';
import FlowProgressIndicator from './flow-progress-indicator';
import steps from './config/steps';
import stepComponents from './config/step-components';
import flows from './config/flows';
import WpcomLoginForm from './wpcom-login-form';
import userModule from 'lib/user';
const user = userModule();
import analytics from 'lib/analytics';
import SignupProcessingScreen from 'signup/processing-screen';
import utils from './utils';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import * as oauthToken from 'lib/oauth-token';
import DocumentHead from 'components/data/document-head';
import { translate } from 'i18n-calypso';
import SignupActions from 'lib/signup/actions';

/**
 * Constants
 */
const MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED = 3000;

const Signup = React.createClass( {
	displayName: 'Signup',

	contextTypes: {
		store: React.PropTypes.object
	},

	getInitialState() {
		SignupDependencyStore.setReduxStore( this.context.store );

		return {
			login: false,
			progress: SignupProgressStore.get(),
			dependencies: this.props.signupDependencies,
			loadingScreenStartTime: undefined,
			resumingStep: undefined,
			user: user.get(),
			loginHandler: null,
			hasCartItems: false,
		};
	},

	loadProgressFromStore() {
		var newProgress = SignupProgressStore.get(),
			invalidSteps = some( newProgress, matchesProperty( 'status', 'invalid' ) ),
			waitingForServer = ! invalidSteps && this.isEveryStepSubmitted(),
			startLoadingScreen = waitingForServer && ! this.state.loadingScreenStartTime;

		this.setState( { progress: newProgress } );

		if ( this.isEveryStepSubmitted() ) {
			this.goToFirstInvalidStep();
		}

		if ( startLoadingScreen ) {
			this.setState( { loadingScreenStartTime: Date.now() } );
		}

		if ( invalidSteps ) {
			this.setState( { loadingScreenStartTime: undefined } );
		}
	},

	submitQueryDependencies() {
		if ( 'undefined' === typeof this.props.queryObject ) {
			return;
		}
		const vertical = this.props.queryObject.vertical;
		const flowSteps = flows.getFlow( this.props.flowName ).steps;
		if ( 'undefined' !== typeof vertical && -1 === flowSteps.indexOf( 'survey' ) ) {
			SignupActions.submitSignupStep(
				{	stepName: 'survey' }, [],	{ surveySiteType: 'blog', surveyQuestion: vertical }
			);
		}
	},

	componentWillMount() {
		analytics.tracks.recordEvent( 'calypso_signup_start', {
			flow: this.props.flowName,
			ref: this.props.refParameter
		} );

		this.submitQueryDependencies();

		this.signupFlowController = new SignupFlowController( {
			flowName: this.props.flowName,
			reduxStore: this.context.store,
			onComplete: function( dependencies, destination ) {
				const timeSinceLoading = this.state.loadingScreenStartTime
					? Date.now() - this.state.loadingScreenStartTime
					: undefined;
				const filteredDestination = utils.getDestination( destination, dependencies, this.props.flowName );

				if ( timeSinceLoading && timeSinceLoading < MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED ) {
					return delay(
						this.handleFlowComplete.bind( this, dependencies, filteredDestination ),
						MINIMUM_TIME_LOADING_SCREEN_IS_DISPLAYED - timeSinceLoading
					);
				}
				return this.handleFlowComplete( dependencies, filteredDestination );
			}.bind( this )
		} );

		this.loadProgressFromStore();

		if ( SignupProgressStore.get().length > 0 ) {
			// we loaded progress from local storage, attempt to resume progress
			return this.resumeProgress();
		}

		if ( this.positionInFlow() !== 0 ) {
			// no progress was resumed and we're on a non-zero step
			// redirect to the beginning of the flow
			return page.redirect(
				utils.getStepUrl(
					this.props.flowName,
					flows.getFlow( this.props.flowName ).steps[ 0 ],
					this.props.locale
				)
			);
		}

		this.checkForCartItems( this.props.signupDependencies );

		this.recordStep();
	},

	componentWillReceiveProps( { signupDependencies, stepName } ) {
		if ( this.props.stepName !== stepName ) {
			this.recordStep( stepName );
		}

		if ( stepName === this.state.resumingStep ) {
			this.setState( { resumingStep: undefined } );
		}

		this.checkForCartItems( signupDependencies );
	},

	checkForCartItems( signupDependencies ) {
		const dependenciesContainCartItem = ( dependencies ) => {
			return dependencies && ( dependencies.cartItem || dependencies.domainItem || dependencies.themeItem );
		};

		if ( dependenciesContainCartItem( signupDependencies ) ) {
			this.setState( { hasCartItems: true } );
		}
	},

	recordStep( stepName = this.props.stepName ) {
		analytics.tracks.recordEvent( 'calypso_signup_step_start', { flow: this.props.flowName, step: stepName } );
	},

	handleFlowComplete( dependencies, destination ) {
		debug( 'The flow is completed. Logging you in...' );

		analytics.tracks.recordEvent( 'calypso_signup_complete', { flow: this.props.flowName } );

		this.signupFlowController.reset();
		if ( dependencies.cartItem || dependencies.domainItem ) {
			this.handleLogin( dependencies, destination );
		} else {
			this.setState( {
				loginHandler: this.handleLogin.bind( this, dependencies, destination )
			} );
		}
	},

	handleLogin( dependencies, destination ) {
		const userIsLoggedIn = Boolean( user.get() );

		if ( userIsLoggedIn ) {
			// deferred in case the user is logged in and the redirect triggers a dispatch
			defer( function() {
				page( destination );
			}.bind( this ) );
		}

		if ( ! userIsLoggedIn && config.isEnabled( 'oauth' ) ) {
			oauthToken.setToken( dependencies.bearer_token );
			window.location.href = destination;
		}

		if ( ! userIsLoggedIn && ! config.isEnabled( 'oauth' ) ) {
			this.setState( {
				bearerToken: dependencies.bearer_token,
				username: dependencies.username,
				redirectTo: this.loginRedirectTo( destination )
			} );
		}
	},

	componentDidMount() {
		debug( 'Signup component mounted' );
		SignupProgressStore.on( 'change', this.loadProgressFromStore );
	},

	componentWillUnmount() {
		debug( 'Signup component unmounted' );
		SignupProgressStore.off( 'change', this.loadProgressFromStore );
	},

	loginRedirectTo( path ) {
		var redirectTo;

		if ( startsWith( path, 'https://' ) || startsWith( path, 'http://' ) ) {
			return path;
		}

		redirectTo = window.location.protocol + '//' + window.location.hostname; // Don't force https because of local development

		if ( window.location.port ) {
			redirectTo += ':' + window.location.port;
		}
		return redirectTo + path;
	},

	firstUnsubmittedStepName() {
		const signupProgress = SignupProgressStore.get(),
			currentSteps = flows.getFlow( this.props.flowName ).steps,
			nextStepName = currentSteps[ signupProgress.length ],
			firstInProgressStep = find( signupProgress, { status: 'in-progress' } ) || {},
			firstInProgressStepName = firstInProgressStep.stepName;

		return firstInProgressStepName || nextStepName || last( currentSteps );
	},

	resumeProgress() {
		// Update the Flows object to know that the signup flow is being resumed.
		flows.resumingFlow = true;

		const signupProgress = SignupProgressStore.get(),
			lastUpdatedStep = sortBy( signupProgress, 'lastUpdated' ).reverse()[ 0 ],
			lastUpdatedStepName = lastUpdatedStep.stepName,
			stepSectionName = lastUpdatedStep.stepSectionName,
			resumingStep = lastUpdatedStepName || this.firstUnsubmittedStepName();

		// set `resumingStep` so we don't render/animate anything until we have mounted this step
		this.setState( { resumingStep } );

		return page.redirect( utils.getStepUrl(
			this.props.flowName,
			resumingStep,
			stepSectionName,
			this.props.locale
		) );
	},

	goToNextStep() {
		if ( this.state.scrolling ) {
			return;
		}

		this.setState( { scrolling: true } );

		this.windowScroller = setInterval( () => {
			if ( window.pageYOffset > 0 ) {
				window.scrollBy( 0, -10 );
			} else {
				this.setState( { scrolling: false } );
				this.loadNextStep();
			}
		}, 1 );
	},

	loadNextStep() {
		const flowSteps = flows.getFlow( this.props.flowName, this.props.stepName ).steps,
			currentStepIndex = indexOf( flowSteps, this.props.stepName ),
			nextStepName = flowSteps[ currentStepIndex + 1 ],
			nextProgressItem = this.state.progress[ currentStepIndex + 1 ],
			nextStepSection = nextProgressItem && nextProgressItem.stepSectionName || '';
		this.goToStep( nextStepName, nextStepSection );
	},

	goToStep( stepName, stepSection ) {
		clearInterval( this.windowScroller );

		if ( ! this.isEveryStepSubmitted() && stepName ) {
			page( utils.getStepUrl( this.props.flowName, stepName, stepSection, this.props.locale ) );
		} else if ( this.isEveryStepSubmitted() ) {
			this.goToFirstInvalidStep();
		}
	},

	goToFirstInvalidStep() {
		var firstInvalidStep = find( SignupProgressStore.get(), { status: 'invalid' } );

		if ( firstInvalidStep ) {
			analytics.tracks.recordEvent( 'calypso_signup_goto_invalid_step', {
				step: firstInvalidStep.stepName,
				flow: this.props.flowName
			} );
			page( utils.getStepUrl( this.props.flowName, firstInvalidStep.stepName, this.props.locale ) );
		}
	},

	isEveryStepSubmitted() {
		var flowSteps = flows.getFlow( this.props.flowName ).steps;
		return flowSteps.length === reject( SignupProgressStore.get(), { status: 'in-progress' } ).length;
	},

	positionInFlow() {
		return indexOf( flows.getFlow( this.props.flowName ).steps, this.props.stepName );
	},

	localeSuggestions() {
		return 0 === this.positionInFlow() && ! user.get() ?
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } /> :
			null;
	},

	loginForm() {
		return this.state.bearerToken ?
			<WpcomLoginForm
				authorization={ 'Bearer ' + this.state.bearerToken }
				log={ this.state.username }
				redirectTo={ this.state.redirectTo } /> :
			null;
	},

	pageTitle() {
		const accountFlowName = 'account';
		return this.props.flowName === accountFlowName ? translate( 'Create an account' ) : translate( 'Create a site' );
	},

	currentStep() {
		let currentStepProgress = find( this.state.progress, { stepName: this.props.stepName } ),
			CurrentComponent = stepComponents[ this.props.stepName ],
			propsFromConfig = assign( {}, this.props, steps[ this.props.stepName ].props ),
			stepKey = this.state.loadingScreenStartTime ? 'processing' : this.props.stepName,
			flow = flows.getFlow( this.props.flowName ),
			hideFreePlan = ! ! (
				this.props.signupDependencies &&
				this.props.signupDependencies.domainItem &&
				this.props.signupDependencies.domainItem.is_domain_registration &&
				this.props.domainsWithPlansOnly
			);

		return (
			<div className="signup__step" key={ stepKey }>
				{ this.localeSuggestions() }
				{
					this.state.loadingScreenStartTime
					? <SignupProcessingScreen
						hasCartItems={ this.state.hasCartItems }
						steps={ this.state.progress }
						user={ this.state.user }
						loginHandler={ this.state.loginHandler }
					/>
					: <CurrentComponent
						path={ this.props.path }
						step={ currentStepProgress }
						steps={ flow.steps }
						stepName={ this.props.stepName }
						meta={ flow.meta || {} }
						goToNextStep={ this.goToNextStep }
						goToStep={ this.goToStep }
						flowName={ this.props.flowName }
						signupProgressStore={ this.state.progress }
						signupDependencies={ this.props.signupDependencies }
						stepSectionName={ this.props.stepSectionName }
						positionInFlow={ this.positionInFlow() }
						hideFreePlan={ hideFreePlan }
						{ ...propsFromConfig } />
				}
			</div>
		);
	},

	render() {
		if ( ! this.props.stepName ||
			( this.positionInFlow() > 0 && this.state.progress.length === 0 ) ||
			this.state.resumingStep ) {
			return null;
		}

		return (
			<span>
				<DocumentHead title={ this.pageTitle() } />
				{
					this.state.loadingScreenStartTime ?
					null :
					<FlowProgressIndicator
						positionInFlow={ this.positionInFlow() }
						flowName={ this.props.flowName } />
				}
				<ReactCSSTransitionGroup
					className="signup__steps"
					transitionName="signup__step"
					transitionEnterTimeout={ 500 }
					transitionLeaveTimeout={ 300 }>
					{ this.currentStep() }
				</ReactCSSTransitionGroup>
				{ this.loginForm() }
			</span>
		);
	}
} );

export default connect(
	state => ( {
		domainsWithPlansOnly: getCurrentUser( state ) ? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ) : true,
		signupDependencies: getSignupDependencyStore( state ),
	} ),
	() => ( {} ),
	undefined,
	{ pure: false } )( Signup );
