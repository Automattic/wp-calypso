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
import { generateFlows } from 'signup/config/flows-pure';
import { getPlansSlugs } from 'lib/plans';

const user = userFactory();

function getCheckoutUrl( dependencies ) {
	return `/checkout/${ dependencies.siteSlug }?signup=1`;
}

function getPlansUrl( dependencies ) {
	return `/plans/${ dependencies.siteSlug }?signup=1`;
}

function dependenciesContainCartItem( dependencies ) {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
}

function dependenciesContainPlan( dependencies ) {
	return getPlansSlugs().includes( dependencies.cartItem?.product_slug );
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
	return `/checklist/${ dependencies.siteSlug }`;
}

function getLaunchDestination( dependencies ) {
	return `/checklist/${ dependencies.siteSlug }?d=launched`;
}

function getThankYouNoSiteDestination() {
	return `/checkout/thank-you/no-site`;
}

function getChecklistThemeDestination( dependencies ) {
	return `/checklist/${ dependencies.siteSlug }?d=theme`;
}

function getEditorDestination( dependencies ) {
	return `/block-editor/page/${ dependencies.siteSlug }/home`;
}

const flows = generateFlows( {
	getSiteDestination,
	getRedirectDestination,
	getSignupDestination,
	getLaunchDestination,
	getThankYouNoSiteDestination,
	getChecklistThemeDestination,
	getEditorDestination,
} );

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, stepName => stepConfig[ stepName ].providesToken ),
	} );
}

function filterDestination( destination, dependencies ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		if ( dependenciesContainPlan( dependencies ) ) {
			// Ideally we should redirect to the checkout page, but we're adding a redirect to the plans page in between
			// (plans will redirect to checkout) to reduce the number of duplicate sites when users go back in the
			// browser trying to change a plan during checkout.
			// See https://github.com/Automattic/wp-calypso/issues/39424
			return getPlansUrl( dependencies );
		}

		return getCheckoutUrl( dependencies );
	}

	return destination;
}

function getDefaultFlowName() {
	return config.isEnabled( 'signup/onboarding-flow' ) ? 'onboarding' : 'main';
}

const Flows = {
	filterDestination,

	defaultFlowName: getDefaultFlowName(),
	excludedSteps: [],

	/**
	 * Get certain flow from the flows configuration.
	 *
	 * The returned flow is modified according to several filters.
	 *
	 * @param {string} flowName The name of the flow to return
	 * @returns {object} A flow object
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
	 * @param {string} step Name of the step to be excluded.
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

	resetExcludedSteps() {
		Flows.excludedSteps = [];
	},

	getFlows() {
		return flows;
	},
};

export default Flows;
