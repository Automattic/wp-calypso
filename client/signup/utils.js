import { translate } from 'i18n-calypso';
import { filter, find, includes, isEmpty, pick, sortBy } from 'lodash';
import { addQueryArgs } from 'calypso/lib/url';
import flows from 'calypso/signup/config/flows';
import { getStepModuleName } from 'calypso/signup/config/step-components';
import steps from 'calypso/signup/config/steps-pure';

const { defaultFlowName } = flows;

function getDefaultFlowName() {
	return defaultFlowName;
}

export function getFlowName( parameters, isUserLoggedIn ) {
	return parameters.flowName && isFlowName( parameters.flowName, isUserLoggedIn )
		? parameters.flowName
		: getDefaultFlowName();
}

function isFlowName( pathFragment, isUserLoggedIn ) {
	return ! isEmpty( flows.getFlow( pathFragment, isUserLoggedIn ) );
}

export function getStepName( parameters ) {
	return find( pick( parameters, [ 'flowName', 'stepName' ] ), isStepName );
}

export function isFirstStepInFlow( flowName, stepName, isUserLoggedIn ) {
	const { steps: stepsBelongingToFlow } = flows.getFlow( flowName, isUserLoggedIn );
	return stepsBelongingToFlow.indexOf( stepName ) === 0;
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

export function getStepUrl(
	flowName,
	stepName,
	stepSectionName,
	localeSlug,
	params = {},
	frameworkParam = null
) {
	const flow = flowName ? `/${ flowName }` : '';
	const step = stepName ? `/${ stepName }` : '';
	const section = stepSectionName ? `/${ stepSectionName }` : '';
	const locale = localeSlug ? `/${ localeSlug }` : '';
	const framework =
		frameworkParam ||
		( typeof window !== 'undefined' && window.location.pathname.startsWith( '/setup' )
			? '/setup'
			: '/start' );

	const url =
		flowName === defaultFlowName && framework === '/start'
			? // we don't include the default flow name in the route in /start
			  framework + step + section + locale
			: framework + flow + step + section + locale;
	return addQueryArgs( params, url );
}

export function getValidPath( parameters, isUserLoggedIn ) {
	const locale = parameters.lang;
	const flowName = getFlowName( parameters, isUserLoggedIn );
	const currentFlowSteps = flows.getFlow( flowName, isUserLoggedIn ).steps;
	const stepName = getStepName( parameters ) || currentFlowSteps[ 0 ];
	const stepSectionName = getStepSectionName( parameters );

	if ( currentFlowSteps.length === 0 ) {
		return '/';
	}

	return getStepUrl( flowName, stepName, stepSectionName, locale );
}

export function getPreviousStepName( flowName, currentStepName, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	return flow.steps[ flow.steps.indexOf( currentStepName ) - 1 ];
}

export function getNextStepName( flowName, currentStepName, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	return flow.steps[ flow.steps.indexOf( currentStepName ) + 1 ];
}

export function getFlowSteps( flowName, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	return flow.steps;
}

export function getFlowPageTitle( flowName, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	return flow.pageTitle || translate( 'Create a site' );
}

export function getFlowDestination(
	flowName,
	isUserLoggedIn,
	dependencies,
	localeSlug,
	goesThroughCheckout
) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	return typeof flow?.destination === 'function'
		? flow.destination( { flowName, ...dependencies }, localeSlug, goesThroughCheckout )
		: flow?.destination;
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

export function getFilteredSteps( flowName, progress, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );

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

export function getFirstInvalidStep( flowName, progress, isUserLoggedIn ) {
	return find( getFilteredSteps( flowName, progress, isUserLoggedIn ), { status: 'invalid' } );
}

export function getCompletedSteps( flowName, progress, options = {}, isUserLoggedIn ) {
	// Option to check that the current `flowName` matches the `lastKnownFlow`.
	// This is to ensure that when resuming progress, we only do so if
	// the last known flow matches the one that the user is returning to.
	if ( options.shouldMatchFlowName ) {
		return filter(
			getFilteredSteps( flowName, progress, isUserLoggedIn ),
			( step ) => 'in-progress' !== step.status && step.lastKnownFlow === flowName
		);
	}
	return filter(
		getFilteredSteps( flowName, progress, isUserLoggedIn ),
		( step ) => 'in-progress' !== step.status
	);
}

export function canResumeFlow( flowName, progress, isUserLoggedIn ) {
	const flow = flows.getFlow( flowName, isUserLoggedIn );
	const flowStepsInProgressStore = getCompletedSteps(
		flowName,
		progress,
		{
			shouldMatchFlowName: true,
		},
		isUserLoggedIn
	);
	return flowStepsInProgressStore.length > 0 && ! flow.disallowResume;
}

export const shouldForceLogin = ( flowName, userLoggedIn ) => {
	const flow = flows.getFlow( flowName, userLoggedIn );
	return !! flow && flow.forceLogin;
};

/**
 * Derive if the "plans" step actually will be visible to the customer in a given flow after the domain step
 * i.e. Check "launch-site" flow while having a purchased paid plan
 * @param  {Object} flowSteps steps in the current flow
 * @returns {boolean} true indicates that "plans" step will be one of the next steps in the flow
 */
export const isPlanSelectionAvailableLaterInFlow = ( flowSteps ) => {
	/**
	 * Caveat here even though "plans" step maybe available in a flow it might not be active
	 * i.e. Check flow "domain"
	 */

	const plansIndex = flowSteps.findIndex( ( stepName ) =>
		[ 'plans', 'plans-pm' ].includes( getStepModuleName( stepName ) )
	);
	const domainsIndex = flowSteps.findIndex(
		( stepName ) => getStepModuleName( stepName ) === 'domains'
	);
	const isPlansStepExistsInFutureOfFlow = plansIndex > 0 && plansIndex > domainsIndex;

	return isPlansStepExistsInFutureOfFlow;
};
