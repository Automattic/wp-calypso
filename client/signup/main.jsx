import config from '@automattic/calypso-config';
import {
	isDomainRegistration,
	isDomainTransfer,
	isDomainMapping,
	isPlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { isBlankCanvasDesign } from '@automattic/design-picker';
import { camelToSnakeCase } from '@automattic/js-utils';
import * as oauthToken from '@automattic/oauth-token';
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
	startsWith,
} from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import { startedInHostingFlow } from 'calypso/landing/stepper/utils/hosting-flow';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import {
	recordSignupStart,
	recordSignupComplete,
	recordSignupStep,
	recordSignupInvalidStep,
	recordSignupProcessingScreen,
	recordSignupPlanChange,
	SIGNUP_DOMAIN_ORIGIN,
} from 'calypso/lib/analytics/signup';
import {
	isWooOAuth2Client,
	isGravatarOAuth2Client,
	isPartnerPortalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import SignupFlowController from 'calypso/lib/signup/flow-controller';
import FlowProgressIndicator from 'calypso/signup/flow-progress-indicator';
import SignupHeader from 'calypso/signup/signup-header';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import {
	isUserLoggedIn,
	getCurrentUser,
	currentUserHasFlag,
	getCurrentUserSiteCount,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { submitSignupStep, removeStep, addStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
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
import ProcessingScreen from './processing-screen';
import {
	persistSignupDestination,
	setDomainsDependencies,
	clearDomainsDependencies,
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
} from './utils';
import WpcomLoginForm from './wpcom-login-form';

import './style.scss';

const debug = debugModule( 'calypso:signup' );

function dependenciesContainCartItem( dependencies ) {
	// @TODO: cartItem is now deprecated. Remove dependencies.cartItem and
	// dependencies.domainItem once all steps and flows have been updated to use cartItems
	return !! (
		dependencies &&
		( dependencies.cartItem || dependencies.domainItem || dependencies.cartItems )
	);
}

function showProgressIndicator( flowName ) {
	const flow = flows.getFlow( flowName );
	return ! flow.hideProgressIndicator;
}

class Signup extends Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool,
		isLoggedIn: PropTypes.bool,
		isEmailVerified: PropTypes.bool,
		submitSignupStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object,
		siteDomains: PropTypes.array,
		sitePlanName: PropTypes.string,
		sitePlanSlug: PropTypes.string,
		isPaidPlan: PropTypes.bool,
		flowName: PropTypes.string,
		stepName: PropTypes.string,
		pageTitle: PropTypes.string,
		stepSectionName: PropTypes.string,
		hostingFlow: PropTypes.bool.isRequired,
	};

	state = {
		controllerHasReset: false,
		shouldShowLoadingScreen: false,
		resumingStep: undefined,
		previousFlowName: null,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		let providedDependencies = this.getDependenciesInQuery();

		// Prevent duplicate sites, check pau2Xa-1Io-p2#comment-6759.
		// Note that there are in general three ways of touching this code that can be obscured:
		// 1. signup as a new user through any of the /start/* flows.
		// 2. log in and go through a /start/* flow to add a new site under the logged-in account.
		// 3. signup as a new user, and then navigate back by the browser's back button.
		// *Only* in the 3rd conditon will isManageSiteFlow be true.
		if ( this.props.isManageSiteFlow ) {
			providedDependencies = {
				...providedDependencies,
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
		this.completeFlowAfterLoggingIn();

		// Resume from the current window location if there is stored, completed step progress.
		// However, if the step is removed, e.g. the user step is removed after logging-in, it can't be resumed.
		if (
			canResumeFlow( this.props.flowName, this.props.progress, this.props.isLoggedIn ) &&
			! this.isCurrentStepRemovedFromFlow()
		) {
			return;
		}

		if ( this.getPositionInFlow() !== 0 ) {
			// Flow is not resumable; redirect to the beginning of the flow.
			// Set `resumingStep` to prevent flash of incorrect step before the redirect.
			const destinationStep = flows.getFlow( this.props.flowName, this.props.isLoggedIn )
				.steps[ 0 ];
			this.setState( { resumingStep: destinationStep } );
			const locale = ! this.props.isLoggedIn ? this.props.locale : '';
			return page.redirect(
				getStepUrl(
					this.props.flowName,
					destinationStep,
					undefined,
					locale,
					this.getCurrentFlowSupportedQueryParams()
				)
			);
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
	}

	componentWillUnmount() {
		this.signupFlowController.cleanup();
	}

	componentDidMount() {
		debug( 'Signup component mounted' );

		if ( flows.getFlow( this.props.flowName, this.props.isLoggedIn )?.enableHotjar ) {
			addHotJarScript();
		}

		recordSignupStart( this.props.flowName, this.props.refParameter, this.getRecordProps() );

		// User-social is recorded as user, to avoid messing up the tracks funnels that we have
		if ( ! this.state.shouldShowLoadingScreen ) {
			recordSignupStep(
				this.props.flowName,
				this.props.stepName === 'user-social' ? 'user' : this.props.stepName,
				this.getRecordProps()
			);
		}
		this.preloadNextStep();
	}

	componentDidUpdate( prevProps ) {
		const { flowName, stepName, sitePlanName, sitePlanSlug, signupDependencies } = this.props;

		if (
			( flowName !== prevProps.flowName || stepName !== prevProps.stepName ) &&
			! this.state.shouldShowLoadingScreen
		) {
			// User-social is recorded as user, to avoid messing up the tracks funnels that we have
			recordSignupStep(
				flowName,
				stepName === 'user-social' ? 'user' : stepName,
				this.getRecordProps()
			);
		}

		if ( stepName !== prevProps.stepName ) {
			this.preloadNextStep();
			// `scrollToTop` here handles cases where the viewport may fall slightly below the top of the page when the next step is rendered
			this.scrollToTop();
		}

		if ( sitePlanSlug && prevProps.sitePlanSlug && sitePlanSlug !== prevProps.sitePlanSlug ) {
			recordSignupPlanChange(
				flowName,
				stepName === 'user-social' ? 'user' : stepName,
				prevProps.sitePlanName,
				prevProps.sitePlanSlug,
				sitePlanName,
				sitePlanSlug
			);
		}

		// Clear domains dependencies when the domains data is updated.
		if (
			stepName === 'domains' &&
			signupDependencies.domainItem !== prevProps.signupDependencies.domainItem
		) {
			clearDomainsDependencies();
		}
	}

	getRecordPropsFromFlow = () => {
		const requiredDeps = this.getCurrentFlowSupportedQueryParams();

		const flow = flows.getFlow( this.props.flowName, this.props.isLoggedIn );
		const optionalDependenciesInQuery = flow?.optionalDependenciesInQuery ?? [];
		const optionalDeps = this.extractFlowDependenciesFromQuery( optionalDependenciesInQuery );

		const deps = { ...requiredDeps, ...optionalDeps };

		const snakeCaseDeps = {};

		for ( const depsKey in deps ) {
			snakeCaseDeps[ camelToSnakeCase( depsKey ) ] = deps[ depsKey ];
		}

		return snakeCaseDeps;
	};

	getRecordProps() {
		const { signupDependencies, hostingFlow, queryObject, wccomFrom, oauth2Client } = this.props;
		const mainFlow = queryObject?.main_flow;

		let theme = get( signupDependencies, 'selectedDesign.theme' );

		if ( ! theme && signupDependencies.themeParameter ) {
			theme = signupDependencies.themeParameter;
		}

		const deps = this.getRecordPropsFromFlow();

		return {
			...deps,
			theme,
			intent: get( signupDependencies, 'intent' ),
			starting_point: get( signupDependencies, 'startingPoint' ),
			is_in_hosting_flow: hostingFlow,
			wccom_from: wccomFrom,
			oauth2_client_id: oauth2Client?.id,
			...( mainFlow ? { flow: mainFlow } : {} ),
		};
	}

	scrollToTop() {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}

	completeFlowAfterLoggingIn() {
		const flowName = this.props.flowName;
		// reader also has a user step at the end, but this change doesn't fix that flow.
		const eligbleFlows = [ 'domain' ];
		if ( ! eligbleFlows.includes( flowName ) || ! this.props.progress ) {
			return;
		}
		const stepName = this.props.stepName;

		const step = this.props.progress[ stepName ];
		if ( step && step.status === 'pending' && this.props.isLoggedIn ) {
			// By removing and adding the step, we trigger the `SignupFlowController` store listener
			// to process the signup flow.
			this.props.removeStep( step );
			this.props.addStep( step );
		}
	}

	handlePostFlowCallbacks = async ( dependencies ) => {
		const flow = flows.getFlow( this.props.flowName, this.props.isLoggedIn );

		if ( flow.postCompleteCallback ) {
			const siteId = dependencies && dependencies.siteId;
			await flow.postCompleteCallback( { siteId, flowName: this.props.flowName } );
		}
	};

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

		// Persist current domains data in the onboarding flow.
		if ( this.props.flowName === 'onboarding' ) {
			const { domainItem, siteUrl, domainCart } = dependencies;
			const { stepSectionName } = this.props;

			setDomainsDependencies( {
				step: {
					stepName: 'domains',
					domainItem,
					siteUrl,
					isPurchasingItem: true,
					stepSectionName,
					domainCart,
				},
				dependencies: { domainItem, siteUrl, domainCart },
			} );
		}

		this.handleFlowComplete( dependencies, filteredDestination );

		this.handleLogin( dependencies, filteredDestination );

		await this.handlePostFlowCallbacks( dependencies );

		this.handleDestination( dependencies, filteredDestination, this.props.flowName );
	};

	updateShouldShowLoadingScreen = ( progress = this.props.progress ) => {
		if (
			isWooOAuth2Client( this.props.oauth2Client ) ||
			this.props.isGravatar ||
			isPartnerPortalOAuth2Client( this.props.oauth2Client )
		) {
			// We don't want to show the loading screen for the Woo signup, Automattic Partner Portal, and Gravatar signup flow.
			return;
		}

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
		}

		if ( hasInvalidSteps ) {
			this.setState( { shouldShowLoadingScreen: false } );
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

		const { existingSiteCount } = this.props;

		const isNewUser = !! ( dependencies && dependencies.is_new_account );
		const siteId = dependencies && dependencies.siteId;
		const hasCartItems = dependenciesContainCartItem( dependencies );
		// @TODO: cartItem is now deprecated. Remove this once all steps and flows have been
		// updated to use cartItems
		const cartItem = get( dependencies, 'cartItem' );
		const cartItems = get( dependencies, 'cartItems' );
		const domainItem = get( dependencies, 'domainItem' );
		const selectedDesign = get( dependencies, 'selectedDesign' );
		const intent = get( dependencies, 'intent' );
		const startingPoint = get( dependencies, 'startingPoint' );
		const signupDomainOrigin = get( dependencies, 'signupDomainOrigin' );
		const planProductSlug = cartItems?.length
			? cartItems.find( ( item ) => isPlan( item ) )?.product_slug
			: cartItem?.product_slug;

		const debugProps = {
			existingSiteCount,
			isNewUser,
			hasCartItems,
			flow: this.props.flowName,
			siteId,
			theme: selectedDesign?.theme,
			intent,
			startingPoint,
		};

		// In case of the flow just serves as a bridge to a Stepper flow, do not fire
		// the signup completion event. Theoretically speaking this can be applied to other scenarios,
		// but it's not recommended outside of this, hence the name toStepper. See Automattic/growth-foundations#72 for more context.
		if ( ! dependencies.toStepper ) {
			debug( 'Tracking signup completion.', debugProps );
			const isMapping = domainItem && isDomainMapping( domainItem );
			const isTransfer = domainItem && isDomainTransfer( domainItem );
			const signupDomainOriginValue =
				isTransfer || isMapping
					? SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN
					: signupDomainOrigin ?? SIGNUP_DOMAIN_ORIGIN.NOT_SET;

			recordSignupComplete( {
				flow: this.props.flowName,
				siteId,
				isNewUser,
				hasCartItems,
				planProductSlug,
				domainProductSlug:
					undefined !== domainItem && domainItem.is_domain_registration
						? domainItem.product_slug
						: undefined,
				// Record the following values so that we can know the user completed which branch under the hero flow
				theme: selectedDesign?.theme,
				intent,
				startingPoint,
				isBlankCanvas: isBlankCanvasDesign( dependencies.selectedDesign ),
				isMapping: isMapping,
				isTransfer: isTransfer,
				signupDomainOrigin: signupDomainOriginValue,
				framework: 'start',
			} );
		}
	};

	handleDestination( dependencies, destination, flowName ) {
		if ( this.props.isLoggedIn ) {
			// don't use page.js for external URLs (eg redirect to new site after signup)
			if ( /^https?:\/\//.test( destination ) ) {
				return ( window.location.href = destination );
			}

			// deferred in case the user is logged in and the redirect triggers a dispatch
			defer( () => {
				debug( `Redirecting you to "${ destination }"` );
				// Experimental: added the flowName check to restrict this functionality only for the 'website-design-services' flow.
				if ( destination?.startsWith( '/checkout/' ) && 'website-design-services' === flowName ) {
					page( destination );
					return;
				}
				window.location.href = destination;
			} );

			return;
		}

		// When this state is available, it will be the login form component's job to handle the redirect.
		if ( ! this.state.redirectTo ) {
			window.location.href = destination;
		}
	}

	handleLogin( dependencies, destination, resetSignupFlowController = true ) {
		const { isLoggedIn: userIsLoggedIn, progress } = this.props;

		debug( `Logging you in to "${ destination }"` );
		if ( resetSignupFlowController ) {
			this.signupFlowController.reset();

			if ( ! this.state.controllerHasReset ) {
				this.setState( { controllerHasReset: true } );
			}
		}

		const isRegularOauth2ClientSignup =
			dependencies.oauth2_client_id && ! progress?.[ 'oauth2-user' ]?.service; // service is set for social signup (e.g. Google, Apple)
		// If the user is not logged in, we need to log them in first.
		// And if it's regular oauth client signup, we perform the oauth login because the WPCC user creation code automatically logs the user in.
		// There’s no need to turn the bearer token into a cookie. If we log user in again, it will cause an activation error.
		// However, we need to skip this to perform a regular login for social sign in.
		if ( ! userIsLoggedIn && ( config.isEnabled( 'oauth' ) || isRegularOauth2ClientSignup ) ) {
			debug( `Handling oauth login` );
			oauthToken.setToken( dependencies.bearer_token );
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
				return;
			}

			if ( this.state.bearerToken !== bearerToken && this.state.username !== username ) {
				debug( 'Performing regular login' );
				this.setState( {
					bearerToken: dependencies.bearer_token,
					username: dependencies.username,
					redirectTo: this.loginRedirectTo( destination ),
				} );

				return;
			}
		}
	}

	loginRedirectTo = ( path ) => {
		if ( startsWith( path, 'https://' ) || startsWith( path, 'http://' ) ) {
			return path;
		}

		return window.location.origin + path;
	};

	extractFlowDependenciesFromQuery = ( dependencies ) => {
		const queryObject = this.props.initialContext?.query ?? {};

		const result = {};
		for ( const dependencyKey of dependencies ) {
			const value = queryObject[ dependencyKey ];
			if ( value != null ) {
				result[ dependencyKey ] = value;
			}
		}

		return result;
	};

	getDependenciesInQuery = () => {
		const flow = flows.getFlow( this.props.flowName, this.props.isLoggedIn );
		const requiredDependenciesInQuery = flow?.providesDependenciesInQuery ?? [];

		return this.extractFlowDependenciesFromQuery( requiredDependenciesInQuery );
	};

	getCurrentFlowSupportedQueryParams = () => {
		const queryObject = this.props.initialContext?.query ?? {};
		const dependenciesInQuery = this.getDependenciesInQuery( queryObject );

		// TODO
		// siteSlug and siteId are currently both being used as either just a query parameter in some area or dependencies data recognized by the signup framework.
		// The confusion caused by this naming conflict could lead to the breakage that first introduced by
		// https://github.com/Automattic/wp-calypso/commit/1d5968a3df62f849c58ea1d0854f472021214ff3 and then fixed by https://github.com/Automattic/wp-calypso/pull/70760
		// For now, we simply make sure they are considered as dependency data when they are explicitly designated.
		// It works, but the code could have been cleaner if there is no naming conflict.
		// We should do a query parameter audit to make sure each query parameter means one and only one thing, and then seek for a future-proof solution.
		const { siteId, siteSlug, flags } = queryObject;

		return {
			siteId,
			siteSlug,
			flags,
			...dependenciesInQuery,
		};
	};

	// `flowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToStep = ( stepName, stepSectionName, flowName = this.props.flowName ) => {
		// The `stepName` might be undefined after the user finish the last step but the value of
		// `isEveryStepSubmitted` is still false. Thus, check the `stepName` here to avoid going
		// to invalid step.
		if ( stepName && ! this.isEveryStepSubmitted() ) {
			const locale = ! this.props.isLoggedIn ? this.props.locale : '';
			page(
				getStepUrl(
					flowName,
					stepName,
					stepSectionName,
					locale,
					this.getCurrentFlowSupportedQueryParams()
				)
			);
		} else if ( this.isEveryStepSubmitted() ) {
			this.goToFirstInvalidStep();
		}
	};

	// `nextFlowName` is an optional parameter used to redirect to another flow, i.e., from `main`
	// to `ecommerce`. If not specified, the current flow (`this.props.flowName`) continues.
	goToNextStep = ( nextFlowName = this.props.flowName ) => {
		const { steps: flowSteps } = flows.getFlow( nextFlowName, this.props.isLoggedIn );
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
				getStepUrl(
					this.props.flowName,
					firstInvalidStep.stepName,
					'',
					locale,
					this.getCurrentFlowSupportedQueryParams()
				)
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

	renderProcessingScreen() {
		const domainItem = get( this.props, 'signupDependencies.domainItem', {} );
		const hasPaidDomain = isDomainRegistration( domainItem );
		const destination = this.signupFlowController.getDestination();

		return (
			<ProcessingScreen
				flowName={ this.props.flowName }
				hasPaidDomain={ hasPaidDomain }
				isDestinationSetupSiteFlow={ destination.startsWith( '/setup' ) }
			/>
		);
	}

	renderCurrentStep() {
		const { stepName, flowName } = this.props;

		const flow = flows.getFlow( flowName, this.props.isLoggedIn );
		const flowStepProps = flow?.props?.[ stepName ] || {};

		const currentStepProgress = find( this.props.progress, { stepName } );
		const CurrentComponent = this.props.stepComponent;
		const propsFromConfig = {
			...omit( this.props, 'locale' ),
			...steps[ stepName ].props,
			...flowStepProps,
		};
		const stepKey = this.state.shouldShowLoadingScreen ? 'processing' : stepName;
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

		// If a coupon is provided as a query dependency, then hide the free plan.
		// It's assumed here that the coupon applies to paid plans at the minimum, and
		// in this scenario it wouldn't be necessary to show a free plan.
		const hideFreePlan = this.props.signupDependencies.coupon ?? false;

		return (
			<div className="signup__step" key={ stepKey }>
				<div className={ `signup__step is-${ stepName }` }>
					{ shouldRenderLocaleSuggestions && (
						<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
					) }
					{ this.state.shouldShowLoadingScreen ? (
						this.renderProcessingScreen()
					) : (
						<CurrentComponent
							path={ this.props.path }
							step={ currentStepProgress }
							initialContext={ this.props.initialContext }
							steps={ flow.steps }
							stepName={ stepName }
							meta={ flow.meta || {} }
							goToNextStep={ this.goToNextStep }
							goToStep={ this.goToStep }
							previousFlowName={ this.state.previousFlowName }
							flowName={ flowName }
							signupDependencies={ this.props.signupDependencies }
							stepSectionName={ this.props.stepSectionName }
							positionInFlow={ this.getPositionInFlow() }
							hideFreePlan={ hideFreePlan }
							queryParams={ this.getCurrentFlowSupportedQueryParams() }
							{ ...propsForCurrentStep }
						/>
					) }
				</div>
			</div>
		);
	}

	isCurrentStepRemovedFromFlow() {
		return ! includes(
			flows.getFlow( this.props.flowName, this.props.isLoggedIn ).steps,
			this.props.stepName
		);
	}

	shouldWaitToRender() {
		const isStepRemovedFromFlow = this.isCurrentStepRemovedFromFlow();
		const isDomainsForSiteEmpty =
			this.props.isLoggedIn &&
			this.props.signupDependencies.siteSlug &&
			0 === this.props.siteDomains.length;
		const isImportingFlow = this.props.flowName === 'from' && this.props.stepName === 'importing';

		if ( isStepRemovedFromFlow ) {
			return true;
		}

		// siteDomains is sometimes empty, so we need to force update.
		if ( isDomainsForSiteEmpty && ! isImportingFlow && this.props.siteId ) {
			return <QuerySiteDomains siteId={ this.props.siteId } />;
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

		const showPageHeader = ! this.props.isGravatar;

		return (
			<>
				<div className={ `signup is-${ kebabCase( this.props.flowName ) }` }>
					<DocumentHead title={ this.props.pageTitle } />
					{ showPageHeader && (
						<SignupHeader
							progressBar={ {
								flowName: this.props.flowName,
								stepName: this.props.stepName,
							} }
							shouldShowLoadingScreen={ this.state.shouldShowLoadingScreen }
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
					<div className="signup__steps">{ this.renderCurrentStep() }</div>
					{ this.state.bearerToken && (
						<WpcomLoginForm
							authorization={ 'Bearer ' + this.state.bearerToken }
							log={ this.state.username }
							redirectTo={ this.state.redirectTo }
						/>
					) }
				</div>
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
		const oauth2Client = getCurrentOAuth2Client( state );
		const hostingFlow = startedInHostingFlow( state );

		return {
			domainsWithPlansOnly: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) // this is intentional, not a mistake
				: true,
			isDomainOnlySite: isDomainOnlySite( state, siteId ),
			progress: getSignupProgress( state ),
			signupDependencies,
			isLoggedIn: isUserLoggedIn( state ),
			isEmailVerified: isCurrentUserEmailVerified( state ),
			existingSiteCount: getCurrentUserSiteCount( state ),
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			sitePlanName: getSitePlanName( state, siteId ),
			sitePlanSlug: getSitePlanSlug( state, siteId ),
			siteDomains,
			siteId,
			localeSlug: getCurrentLocaleSlug( state ),
			oauth2Client,
			isGravatar: isGravatarOAuth2Client( oauth2Client ),
			wccomFrom: getWccomFrom( state ),
			hostingFlow,
		};
	},
	{
		submitSignupStep,
		removeStep,
		addStep,
	}
)( Signup );
