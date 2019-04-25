/** @format */

/**
 * External dependencies
 */
import { assign, includes, reject } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import stepConfig from './steps';
import userFactory from 'lib/user';
import { abtest } from 'lib/abtest';
import { generateFlows } from './flows-pure';

const user = userFactory();

function getCheckoutUrl( dependencies ) {
	return '/checkout/' + dependencies.siteSlug;
}

function dependenciesContainCartItem( dependencies ) {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
}

function getSiteDestination( dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	let protocol = 'https';

	/**
	 * It is possible that non-wordpress.com sites are not HTTPS ready.
	 *
	 * Redirect them
	 */
	if ( ! dependencies.siteSlug.match( /wordpress\.[a-z]+$/i ) ) {
		protocol = 'http';
	}

	return protocol + '://' + dependencies.siteSlug;
}

function getPostsDestination( dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	return '/posts/' + dependencies.siteSlug;
}

function getRedirectDestination( dependencies ) {
	if (
		dependencies.oauth2_redirect &&
		dependencies.oauth2_redirect.startsWith( 'https://public-api.wordpress.com' )
	) {
		return dependencies.oauth2_redirect;
	}

	return '/';
}

function getChecklistDestination( dependencies ) {
	return '/checklist/' + dependencies.siteSlug;
}

const flows = generateFlows( {
	getPostsDestination,
	getSiteDestination,
	getRedirectDestination,
	getChecklistDestination,
} );

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken ),
	} );
}

function replaceStepInFlow( flow, oldStepName, newStepName ) {
	// no change
	if ( ! includes( flow.steps, oldStepName ) ) {
		return flow;
	}

	return assign( {}, flow, {
		steps: flow.steps.map( stepName => ( stepName === oldStepName ? newStepName : stepName ) ),
	} );
}

/**
 * Properly filter the current flow.
 *
 * Called by `getFlowName` in 'signup/utils.js' to allow conditional filtering of the current
 * flow for AB tests.
 *
 * @example
 * function filterFlowName( flowName ) {
 *   const defaultFlows = [ 'main', 'website' ];
 *   if ( ! user.get() && includes( defaultFlows, flowName ) ) {
 *     return 'filtered-flow-name';
 *   }
 *   return flowName;
 * }
 * // If user is logged out and the current flow is 'main' or 'website' switch to 'filtered-flow-name' flow.
 *
 * @param  {string} flowName Current flow name.
 * @return {string}          New flow name.
 */
function filterFlowName( flowName ) {
	return flowName;
}

function filterDestination( destination ) {
	return destination;
}

const Flows = {
	filterFlowName,
	filterDestination,

	defaultFlowName: config.isEnabled( 'signup/onboarding-flow' )
		? abtest( 'improvedOnboarding' )
		: 'main',
	resumingFlow: false,
	excludedSteps: [],

	/**
	 * Get certain flow from the flows configuration.
	 *
	 * The returned flow is modified according to several filters.
	 *
	 * `currentStepName` is the current step in the signup flow. It is used
	 * to determine if any AB variations should be assigned after it is completed.
	 * Example use case: To determine if a new signup step should be part of the flow or not.
	 *
	 * @param {String} flowName The name of the flow to return
	 * @param {String} currentStepName The current step. See description above
	 * @returns {Object} A flow object
	 */
	getFlow( flowName, currentStepName = '' ) {
		let flow = Flows.getFlows()[ flowName ];

		// if the flow couldn't be found, return early
		if ( ! flow ) {
			return flow;
		}

		if ( user && user.get() ) {
			flow = removeUserStepFromFlow( flow );
		}

		Flows.preloadABTestVariationsForStep( flowName, currentStepName );

		return Flows.filterExcludedSteps( Flows.getABTestFilteredFlow( flowName, flow ) );
	},

	/**
	 * Make `getFlow()` call to exclude the given steps.
	 * The main usage at the moment is to serve as a quick solution to remove steps that have been pre-fulfilled
	 * without explicit user inputs, e.g. query arguments.
	 *
	 * @param {String} step Name of the step to be excluded.
	 */
	excludeStep( step ) {
		step && Flows.excludedSteps.push( step );
	},

	filterExcludedSteps( flow ) {
		if ( ! flow ) {
			return;
		}

		return assign( {}, flow, {
			steps: reject( flow.steps, stepName => includes( Flows.excludedSteps, stepName ) ),
		} );
	},

	getFlows() {
		return flows;
	},

	isValidFlow( flowName ) {
		return Boolean( Flows.getFlows()[ flowName ] );
	},

	/**
	 * Preload AB Test variations after a certain step has been completed.
	 *
	 * This gives the option to set the AB variation as late as possible in the
	 * signup flow.
	 *
	 * Currently only the default flow is whitelisted.
	 *
	 * @param {String} flowName The current flow
	 * @param {String} stepName The step that is being completed right now
	 */
	preloadABTestVariationsForStep() {
		/**
		 * In cases where the flow is being resumed, the flow must not be changed from what the user
		 * has seen before.
		 *
		 * E.g. A user is resuming signup from before the test was added. There is no need
		 * to add a step somewhere back in the line.
		 */
		if ( Flows.resumingFlow ) {
			return;
		}

		/**
		 * If there is need to test the first step in a flow,
		 * the best way to do it is to check for:
		 *
		 * 	if ( Flow.defaultFlowName === flowName && '' === stepName ) { ... }
		 *
		 * This will be fired at the beginning of the signup flow.
		 */
	},

	/**
	 * Return a flow that is modified according to the ABTest rules.
	 *
	 * Useful when testing new steps in the signup flows.
	 *
	 * Example usage: Inject or remove a step in the flow if a user is part of an ABTest.
	 *
	 * @param {String} flowName The current flow name
	 * @param {Object} flow The flow object
	 *
	 * @return {Object} A filtered flow object
	 */
	getABTestFilteredFlow( flowName, flow ) {
		if (
			'onboarding-for-business' === flowName &&
			'remove' === abtest( 'removeDomainsStepFromOnboarding' )
		) {
			flow = Flows.removeStepFromFlow( 'domains-with-preview', flow );
			flow = replaceStepInFlow(
				flow,
				'site-information-title-with-preview',
				'site-information-without-domains'
			);

			return flow;
		}

		return flow;
	},

	/**
	 * Insert a step into the flow.
	 *
	 * @param {String} stepName The step to insert into the flow
	 * @param {Object} flow The flow that the step will be inserted into
	 * @param {String} afterStep After which step to insert the new step.
	 * 							 If left blank, the step will be added in the beginning.
	 *
	 * @returns {Object} A flow object with inserted step
	 */
	insertStepIntoFlow( stepName, flow, afterStep = '' ) {
		if ( -1 === flow.steps.indexOf( stepName ) ) {
			const steps = flow.steps.slice();
			const afterStepIndex = steps.indexOf( afterStep );

			/**
			 * Only insert the step if
			 * `afterStep` is empty ( insert at start )
			 * or if `afterStep` is found in the flow. ( insert after `afterStep` )
			 */
			if ( afterStepIndex > -1 || '' === afterStep ) {
				steps.splice( afterStepIndex + 1, 0, stepName );
				return {
					...flow,
					steps,
				};
			}
		}

		return flow;
	},

	removeStepFromFlow( stepName, flow ) {
		return {
			...flow,
			steps: flow.steps.filter( step => {
				return step !== stepName;
			} ),
		};
	},
};

export default Flows;
