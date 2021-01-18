/**
 * External dependencies
 */
import { assign, get, includes, indexOf, reject } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import stepConfig from './steps';
import user from 'calypso/lib/user';
import { isEcommercePlan } from 'calypso/lib/plans';
import { generateFlows } from 'calypso/signup/config/flows-pure';
import { addQueryArgs } from 'calypso/lib/url';

function getCheckoutUrl( dependencies, localeSlug, flowName ) {
	let checkoutURL = `/checkout/${ dependencies.siteSlug }`;

	// Append the locale slug for the userless checkout page.
	if ( 'no-site' === dependencies.siteSlug && true === dependencies.allowUnauthenticated ) {
		checkoutURL += `/${ localeSlug }`;
	}

	return addQueryArgs(
		{
			signup: 1,
			...( dependencies.isPreLaunch && {
				preLaunch: 1,
			} ),
			...( dependencies.isPreLaunch &&
				! isEcommercePlan( dependencies.cartItem.product_slug ) && {
					redirect_to: `/home/${ dependencies.siteSlug }`,
				} ),
			...( dependencies.isGutenboardingCreate && { isGutenboardingCreate: 1 } ),
			...( 'domain' === flowName && { isDomainOnly: 1 } ),
		},
		checkoutURL
	);
}

function dependenciesContainCartItem( dependencies ) {
	return (
		dependencies.cartItem ||
		dependencies.domainItem ||
		dependencies.themeItem ||
		dependencies.selectedDomainUpsellItem
	);
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
	try {
		if (
			dependencies.oauth2_redirect &&
			new URL( dependencies.oauth2_redirect ).host === 'public-api.wordpress.com'
		) {
			return dependencies.oauth2_redirect;
		}
	} catch {
		return '/';
	}

	return '/';
}

function getSignupDestination( dependencies ) {
	if ( 'no-site' === dependencies.siteSlug ) {
		return '/home';
	}

	return `/home/${ dependencies.siteSlug }`;
}

function getLaunchDestination( dependencies ) {
	return `/home/${ dependencies.siteSlug }`;
}

function getThankYouNoSiteDestination() {
	return `/checkout/thank-you/no-site`;
}

function getChecklistThemeDestination( dependencies ) {
	return `/home/${ dependencies.siteSlug }`;
}

function getEditorDestination( dependencies ) {
	return `/page/${ dependencies.siteSlug }/home`;
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
		steps: reject( flow.steps, ( stepName ) => stepConfig[ stepName ].providesToken ),
	} );
}

function removeP2DetailsStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return assign( {}, flow, {
		steps: reject( flow.steps, ( stepName ) => stepName === 'p2-details' ),
	} );
}

function filterDestination( destination, dependencies, flowName, localeSlug ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies, localeSlug, flowName );
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

		if ( user() && user().get() ) {
			flow = removeUserStepFromFlow( flow );
		}

		if ( flowName === 'p2' && user() && user().get() ) {
			flow = removeP2DetailsStepFromFlow( flow );
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
		step && Flows.excludedSteps.indexOf( step ) === -1 && Flows.excludedSteps.push( step );
	},

	filterExcludedSteps( flow ) {
		if ( ! flow ) {
			return;
		}

		return assign( {}, flow, {
			steps: reject( flow.steps, ( stepName ) => includes( Flows.excludedSteps, stepName ) ),
		} );
	},

	resetExcludedSteps() {
		Flows.excludedSteps = [];
	},

	resetExcludedStep( stepName ) {
		const index = Flows.excludedSteps.indexOf( stepName );

		if ( index > -1 ) {
			Flows.excludedSteps.splice( index, 1 );
		}
	},

	getFlows() {
		return flows;
	},
};

export default Flows;
