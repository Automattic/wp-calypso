/**
 * Exernal dependencies
 */
import cookie from 'cookie';
import { filter, find, includes, indexOf, isEmpty, pick, sortBy } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import steps from 'signup/config/steps-pure';
import flows from 'signup/config/flows';
import userFactory from 'lib/user';
import { abtest } from 'lib/abtest';

const user = userFactory();

const { defaultFlowName } = flows;

function isEligibleForSwapStepsTest() {
	const cookies = cookie.parse( document.cookie );
	const countryCodeFromCookie = cookies.country_code;
	const isUserFromUS = 'US' === countryCodeFromCookie;

	if ( user && user.get() && isUserFromUS && 'onboarding' === defaultFlowName ) {
		return true;
	}

	return false;
}

function getDefaultFlowName() {
	if (
		isEligibleForSwapStepsTest() &&
		'variantShowSwapped' === abtest( 'domainStepPlanStepSwap' )
	) {
		return 'onboarding-plan-first';
	}

	return defaultFlowName;
}

export function getFlowName( parameters ) {
	return parameters.flowName && isFlowName( parameters.flowName )
		? parameters.flowName
		: getDefaultFlowName();
}

function isFlowName( pathFragment ) {
	return ! isEmpty( flows.getFlow( pathFragment ) );
}

export function getStepName( parameters ) {
	return find( pick( parameters, [ 'flowName', 'stepName' ] ), isStepName );
}

function isStepName( pathFragment ) {
	return ! isEmpty( steps[ pathFragment ] );
}

export function getStepSectionName( parameters ) {
	return find( pick( parameters, [ 'stepName', 'stepSectionName' ] ), isStepSectionName );
}

function isStepSectionName( pathFragment ) {
	return ! isStepName( pathFragment );
}

export function getStepUrl( flowName, stepName, stepSectionName, localeSlug ) {
	const flow = flowName ? `/${ flowName }` : '',
		step = stepName ? `/${ stepName }` : '',
		section = stepSectionName ? `/${ stepSectionName }` : '',
		// when the user is logged in, the locale slug is meaningless in a
		// signup URL, as the page will be translated in the language the user
		// has in their settings.
		locale = localeSlug && ! user.get() ? `/${ localeSlug }` : '';

	if ( flowName === defaultFlowName ) {
		// we don't include the default flow name in the route
		return '/start' + step + section + locale;
	}

	return '/start' + flow + step + section + locale;
}

export function getValidPath( parameters ) {
	const locale = parameters.lang;
	const flowName = getFlowName( parameters );
	const currentFlowSteps = flows.getFlow( flowName ).steps;
	const stepName = getStepName( parameters ) || currentFlowSteps[ 0 ];
	const stepSectionName = getStepSectionName( parameters );

	if ( currentFlowSteps.length === 0 ) {
		return '/';
	}

	return getStepUrl( flowName, stepName, stepSectionName, locale );
}

export function getPreviousStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) - 1 ];
}

export function getNextStepName( flowName, currentStepName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps[ indexOf( flow.steps, currentStepName ) + 1 ];
}

export function getFlowSteps( flowName ) {
	const flow = flows.getFlow( flowName );
	return flow.steps;
}

export function getFlowPageTitle( flowName ) {
	const flow = flows.getFlow( flowName );
	return flow.pageTitle || translate( 'Create a site' );
}

export function getValueFromProgressStore( { signupProgress, stepName, fieldName } ) {
	const siteStepProgress = find( signupProgress, ( step ) => step.stepName === stepName );
	return siteStepProgress ? siteStepProgress[ fieldName ] : null;
}

export function getDestination( destination, dependencies, flowName ) {
	return flows.filterDestination( destination, dependencies, flowName );
}

export function getThemeForDesignType( designType ) {
	switch ( designType ) {
		case 'blog':
			return 'pub/independent-publisher-2';
		case 'grid':
			return 'pub/altofocus';
		case 'page':
			return 'pub/dara';
		case 'store':
			return 'pub/dara';
		default:
			return 'pub/twentyseventeen';
	}
}

export function getThemeForSiteGoals( siteGoals ) {
	const siteGoalsValue = siteGoals.split( ',' );

	if ( siteGoalsValue.indexOf( 'sell' ) !== -1 ) {
		return 'pub/radcliffe-2';
	}

	if ( siteGoalsValue.indexOf( 'promote' ) !== -1 ) {
		return 'pub/radcliffe-2';
	}

	if ( siteGoalsValue.indexOf( 'educate' ) !== -1 ) {
		return 'pub/twentyfifteen';
	}

	if ( siteGoalsValue.indexOf( 'showcase' ) !== -1 ) {
		return 'pub/altofocus';
	}

	return 'pub/independent-publisher-2';
}

export function getDesignTypeForSiteGoals( siteGoals, flow ) {
	const siteGoalsValue = siteGoals.split( ',' );

	//Identify stores for the store signup flow
	if ( siteGoals === 'sell' || flow === 'ecommerce' ) {
		return 'store';
	}

	if ( siteGoalsValue.indexOf( 'sell' ) !== -1 ) {
		return 'page';
	}

	if ( siteGoalsValue.indexOf( 'promote' ) !== -1 ) {
		return 'page';
	}

	if ( siteGoalsValue.indexOf( 'showcase' ) !== -1 ) {
		return 'portfolio';
	}

	return 'blog';
}

export function getFilteredSteps( flowName, progress ) {
	const flow = flows.getFlow( flowName );

	if ( ! flow ) {
		return [];
	}

	return sortBy(
		// filter steps...
		filter( progress, ( step ) => includes( flow.steps, step.stepName ) ),
		// then order according to the flow definition...
		( { stepName } ) => flow.steps.indexOf( stepName )
	);
}

export function getFirstInvalidStep( flowName, progress ) {
	return find( getFilteredSteps( flowName, progress ), { status: 'invalid' } );
}

export function getCompletedSteps( flowName, progress, options = {} ) {
	// Option to check that the current `flowName` matches the `lastKnownFlow`.
	// This is to ensure that when resuming progress, we only do so if
	// the last known flow matches the one that the user is returning to.
	if ( options.shouldMatchFlowName ) {
		return filter(
			getFilteredSteps( flowName, progress ),
			( step ) => 'in-progress' !== step.status && step.lastKnownFlow === flowName
		);
	}
	return filter(
		getFilteredSteps( flowName, progress ),
		( step ) => 'in-progress' !== step.status
	);
}

export function canResumeFlow( flowName, progress ) {
	const flow = flows.getFlow( flowName );
	const flowStepsInProgressStore = getCompletedSteps( flowName, progress, {
		shouldMatchFlowName: true,
	} );
	return flowStepsInProgressStore.length > 0 && ! flow.disallowResume;
}

export const persistSignupDestination = ( url ) => {
	const WEEK_IN_SECONDS = 3600 * 24 * 7;
	const expirationDate = new Date( new Date().getTime() + WEEK_IN_SECONDS * 1000 );
	const options = { path: '/', expires: expirationDate, sameSite: 'strict' };
	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', url, options );
};

export const retrieveSignupDestination = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_complete_destination;
};

export const clearSignupDestinationCookie = () => {
	// Set expiration to a random time in the past so that the cookie gets removed.
	const expirationDate = new Date( new Date().getTime() - 1000 );
	const options = { path: '/', expires: expirationDate };

	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', '', options );
};

export const shouldForceLogin = ( flowName ) => {
	const flow = flows.getFlow( flowName );
	return !! flow && flow.forceLogin;
};
