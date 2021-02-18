/**
 * External dependencies
 */
import { filter, find, includes, indexOf, isEmpty, pick, sortBy } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import steps from 'calypso/signup/config/steps-pure';
import flows from 'calypso/signup/config/flows';
import user from 'calypso/lib/user';

const { defaultFlowName } = flows;

function getDefaultFlowName() {
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
	const flow = flowName ? `/${ flowName }` : '';
	const step = stepName ? `/${ stepName }` : '';
	const section = stepSectionName ? `/${ stepSectionName }` : '';
	// when the user is logged in, the locale slug is meaningless in a
	// signup URL, as the page will be translated in the language the user
	// has in their settings.
	const locale = localeSlug && ! user().get() ? `/${ localeSlug }` : '';

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

export function getDestination( destination, dependencies, flowName, localeSlug ) {
	return flows.filterDestination( destination, dependencies, flowName, localeSlug );
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

export const shouldForceLogin = ( flowName ) => {
	const flow = flows.getFlow( flowName );
	return !! flow && flow.forceLogin;
};
