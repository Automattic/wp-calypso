import { isEnabled } from '@automattic/calypso-config';
import { englishLocales } from '@automattic/i18n-utils';
import { get, includes, reject } from 'lodash';
import detectHistoryNavigation from 'calypso/lib/detect-history-navigation';
import { addQueryArgs } from 'calypso/lib/url';
import { generateFlows } from 'calypso/signup/config/flows-pure';
import stepConfig from './steps';

function getCheckoutUrl( dependencies, localeSlug, flowName ) {
	let checkoutURL = `/checkout/${ dependencies.siteSlug }`;

	// Append the locale slug for the userless checkout page.
	if ( 'no-site' === dependencies.siteSlug && true === dependencies.allowUnauthenticated ) {
		checkoutURL += `/${ localeSlug }`;
	}

	return addQueryArgs(
		{
			signup: 1,
			...( [ 'domain', 'add-domain' ].includes( flowName ) && { isDomainOnly: 1 } ),
		},
		checkoutURL
	);
}

function dependenciesContainCartItem( dependencies ) {
	return dependencies.cartItem || dependencies.domainItem || dependencies.themeItem;
}

function getAddOnsStep( steps ) {
	if ( isEnabled( 'signup/add-ons' ) ) {
		return [ ...steps, 'add-ons' ];
	}
	return steps;
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
		} else if ( dependencies.redirect ) {
			return dependencies.redirect;
		}
	} catch {
		return '/';
	}

	return '/';
}

function getSignupDestination( { domainItem, siteId, siteSlug, refParameter }, localeSlug ) {
	if ( 'no-site' === siteSlug ) {
		return '/home';
	}
	let queryParam = { siteSlug };
	if ( domainItem ) {
		// If the user is purchasing a domain then the site's primary url might change from
		// `siteSlug` to something else during the checkout process, which means the
		// `/start/setup-site?siteSlug=${ siteSlug }` url would become invalid. So in this
		// case we use the ID because we know it won't change depending on whether the user
		// successfully completes the checkout process or not.
		queryParam = { siteId };
	}

	// Add referral param to query args
	if ( refParameter ) {
		queryParam.ref = refParameter;
	}

	if ( isEnabled( 'signup/stepper-flow' ) ) {
		return addQueryArgs( queryParam, '/setup' );
	}

	// Initially ship to English users only, then ship to all users when translations complete
	if ( englishLocales.includes( localeSlug ) || isEnabled( 'signup/hero-flow-non-en' ) ) {
		queryParam.loading_ellipsis = 1;
		return addQueryArgs( queryParam, '/start/setup-site' );
	}

	return `/home/${ siteSlug }`;
}

function getLaunchDestination( dependencies ) {
	return `/home/${ dependencies.siteSlug }`;
}

function getDomainSignupFlowDestination( { domainItem, cartItem, siteId, designType, siteSlug } ) {
	if ( domainItem && cartItem && designType !== 'existing-site' ) {
		return addQueryArgs( { siteId }, '/start/setup-site' );
	} else if ( designType === 'existing-site' ) {
		return `/checkout/thank-you/${ siteSlug }`;
	}

	return getThankYouNoSiteDestination();
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

function getDestinationFromIntent( dependencies ) {
	const { intent, storeType, startingPoint, siteSlug, isFSEActive } = dependencies;

	// If the user skips starting point, redirect them to My Home
	if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
		if ( startingPoint !== 'write' ) {
			window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
		}

		return `/post/${ siteSlug }`;
	}

	if ( intent === 'sell' && storeType === 'power' ) {
		return addQueryArgs(
			{
				back_to: `/start/setup-site/store-features?siteSlug=${ siteSlug }`,
				siteSlug: siteSlug,
			},
			`/start/woocommerce-install`
		);
	}

	if ( ! isFSEActive && intent === 'sell' ) {
		return `/page/${ dependencies.siteSlug }/home`;
	}

	if ( isFSEActive && intent !== 'write' ) {
		return `/site-editor/${ dependencies.siteSlug }`;
	}

	return getChecklistThemeDestination( dependencies );
}

function getDIFMSignupDestination( { siteSlug } ) {
	return addQueryArgs( { siteSlug }, '/start/site-content-collection' );
}

function getDIFMSiteContentCollectionDestination( { siteSlug } ) {
	return `/home/${ siteSlug }`;
}

const flows = generateFlows( {
	getSiteDestination,
	getRedirectDestination,
	getSignupDestination,
	getLaunchDestination,
	getThankYouNoSiteDestination,
	getDomainSignupFlowDestination,
	getChecklistThemeDestination,
	getEditorDestination,
	getDestinationFromIntent,
	getDIFMSignupDestination,
	getDIFMSiteContentCollectionDestination,
	getAddOnsStep,
} );

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return {
		...flow,
		steps: reject( flow.steps, ( stepName ) => stepConfig[ stepName ].providesToken ),
	};
}

function removeP2DetailsStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return {
		...flow,
		steps: reject( flow.steps, ( stepName ) => stepName === 'p2-details' ),
	};
}

function filterDestination( destination, dependencies, flowName, localeSlug ) {
	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies, localeSlug, flowName );
	}

	return destination;
}

function getDefaultFlowName() {
	return 'onboarding';
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
	 * @typedef {import('../types').Flow} Flow
	 * @param {string} flowName The name of the flow to return
	 * @param {boolean} isUserLoggedIn Whether the user is logged in
	 * @returns {Flow} A flow object
	 */
	getFlow( flowName, isUserLoggedIn ) {
		let flow = Flows.getFlows()[ flowName ];

		// if the flow couldn't be found, return early
		if ( ! flow ) {
			return flow;
		}

		if ( isUserLoggedIn ) {
			const urlParams = new URLSearchParams( window.location.search );
			const param = urlParams.get( 'user_completed' );
			// Remove the user step unless the user has just completed the step
			// and then clicked the back button.
			if ( ! param && ! detectHistoryNavigation.loadedViaHistory() ) {
				flow = removeUserStepFromFlow( flow );
			}
		}

		if ( flowName === 'p2v1' && isUserLoggedIn ) {
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
		const currentStepIndex = flowSteps.indexOf( currentStepName );
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

	excludeSteps( steps ) {
		steps.forEach( ( step ) => Flows.excludeStep( step ) );
	},

	filterExcludedSteps( flow ) {
		if ( ! flow ) {
			return;
		}

		return {
			...flow,
			steps: reject( flow.steps, ( stepName ) => includes( Flows.excludedSteps, stepName ) ),
		};
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
