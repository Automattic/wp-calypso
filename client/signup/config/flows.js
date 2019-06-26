/** @format */

/**
 * External dependencies
 */
import { assign, get, includes, indexOf, reject } from 'lodash';

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

function getRedirectDestination( dependencies ) {
	if (
		dependencies.oauth2_redirect &&
		dependencies.oauth2_redirect.startsWith( 'https://public-api.wordpress.com' )
	) {
		return dependencies.oauth2_redirect;
	}

	return '/';
}

function getSignupDestination( dependencies ) {
	return abtest( 'improvedOnboarding' ) === 'main'
		? `/checklist/${ dependencies.siteSlug }`
		: `/view/${ dependencies.siteSlug }`;
}

function getThankYouNoSiteDestination() {
	return `/checkout/thank-you/no-site`;
}

function getThankYouDestination( dependencies ) {
	return `/checkout/thank-you/${ dependencies.siteSlug }/:receiptId`;
}

const flows = generateFlows( {
	getSiteDestination,
	getRedirectDestination,
	getSignupDestination,
	getThankYouNoSiteDestination,
	getThankYouDestination,
} );

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken ),
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

function filterDestination( destination, dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies );
	}

	return destination;
}

const Flows = {
	filterFlowName,
	filterDestination,

	defaultFlowName: config.isEnabled( 'signup/onboarding-flow' )
		? abtest( 'improvedOnboarding' )
		: 'main',
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
	getFlow( flowName ) {
		let flow = Flows.getFlows()[ flowName ];

		// if the flow couldn't be found, return early
		if ( ! flow ) {
			return flow;
		}

		if ( user && user.get() ) {
			flow = removeUserStepFromFlow( flow );
		}

		return Flows.filterExcludedSteps( flow );
	},

	getNextStepNameInFlow( flowName, currentStepName = '' ) {
		const flow = Flows.getFlows()[ flowName ];

		if ( ! flow ) {
			return false;
		}
		const flowSteps = flow.steps;
		const currentStepIndex = indexOf( flowSteps, currentStepName );
		const nextIndex = currentStepIndex + 1;
		const nextStepName = get( flowSteps, nextIndex );

		return nextStepName;
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
