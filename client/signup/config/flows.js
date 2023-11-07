import config from '@automattic/calypso-config';
import {
	PREMIUM_THEME,
	DOT_ORG_THEME,
	WOOCOMMERCE_THEME,
	MARKETPLACE_THEME,
	isAssemblerSupported,
} from '@automattic/design-picker';
import { isSiteAssemblerFlow } from '@automattic/onboarding';
import { get, includes, reject } from 'lodash';
import detectHistoryNavigation from 'calypso/lib/detect-history-navigation';
import { getQueryArgs } from 'calypso/lib/query-args';
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
			ref: getQueryArgs()?.ref,
			...( [ 'domain' ].includes( flowName ) && {
				isDomainOnly: 1,
				checkoutBackUrl:
					config( 'env' ) === 'production'
						? `https://${ config( 'hostname' ) }/start/domain/domain-only`
						: `${ config( 'protocol' ) ? config( 'protocol' ) : 'https' }://${ config(
								'hostname'
						  ) }${ config( 'port' ) ? ':' + config( 'port' ) : '' }/start/domain/domain-only`,
			} ),
		},
		checkoutURL
	);
}

function dependenciesContainCartItem( dependencies ) {
	// @TODO: cartItem is now deprecated. Remove dependencies.cartItem and
	// dependencies.domainItem once all steps and flows have been updated to use cartItems
	return dependencies.cartItem || dependencies.domainItem || dependencies.cartItems;
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

function getSignupDestination( { domainItem, siteId, siteSlug, refParameter } ) {
	if ( 'no-site' === siteSlug ) {
		return '/home';
	}
	let queryParam = { siteSlug, siteId };
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

	return addQueryArgs( queryParam, '/setup' );
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

function getEmailSignupFlowDestination( { siteId, siteSlug } ) {
	return addQueryArgs(
		{ siteId },
		`/checkout/thank-you/features/email-license/${ siteSlug }/:receiptId`
	);
}

function getThankYouNoSiteDestination() {
	return `/checkout/thank-you/no-site`;
}

function getChecklistThemeDestination( {
	flowName,
	siteSlug,
	themeParameter,
	headerPatternId,
	footerPatternId,
	sectionPatternIds,
	screen,
	screenParameter,
} ) {
	if ( isSiteAssemblerFlow( flowName ) ) {
		// Check whether to go to the assembler. If not, go to the site editor directly
		if ( isAssemblerSupported() ) {
			return addQueryArgs(
				{
					theme: themeParameter,
					siteSlug: siteSlug,
					isNewSite: true,
					header_pattern_id: headerPatternId,
					footer_pattern_id: footerPatternId,
					pattern_ids: sectionPatternIds,
					screen,
					screen_parameter: screenParameter,
				},
				`/setup/with-theme-assembler`
			);
		}

		const params = new URLSearchParams( {
			canvas: 'edit',
			assembler: '1',
		} );

		return `/site-editor/${ siteSlug }?${ params }`;
	}

	return `/home/${ siteSlug }`;
}

function getWithThemeDestination( {
	siteSlug,
	themeParameter,
	styleVariation,
	themeType,
	cartItems,
} ) {
	if (
		! cartItems &&
		[ DOT_ORG_THEME, PREMIUM_THEME, MARKETPLACE_THEME, WOOCOMMERCE_THEME ].includes( themeType )
	) {
		return `/setup/site-setup/designSetup?siteSlug=${ siteSlug }`;
	}

	if ( DOT_ORG_THEME === themeType ) {
		return `/marketplace/theme/${ themeParameter }/install/${ siteSlug }`;
	}

	if ( MARKETPLACE_THEME === themeType ) {
		return `/marketplace/thank-you/${ siteSlug }?onboarding=&themes=${ themeParameter }`;
	}

	const style = styleVariation ? `&style=${ styleVariation }` : '';

	return `/setup/site-setup/designSetup?siteSlug=${ siteSlug }&theme=${ themeParameter }${ style }`;
}

function getWithPluginDestination( { siteSlug, pluginParameter, pluginBillingPeriod } ) {
	// send to the thank you page when find a billing period (marketplace)
	if ( pluginBillingPeriod ) {
		return `/marketplace/thank-you/${ siteSlug }?plugins=${ pluginParameter }`;
	}

	// otherwise send to installation page
	return `/marketplace/plugin/${ pluginParameter }/install/${ siteSlug }`;
}

function getEditorDestination( dependencies ) {
	return `/page/${ dependencies.siteSlug }/home`;
}

function getDestinationFromIntent( dependencies ) {
	const { intent, storeType, startingPoint, siteSlug } = dependencies;
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

	return getChecklistThemeDestination( dependencies );
}

function getDIFMSignupDestination( { siteSlug } ) {
	return addQueryArgs( { siteSlug }, '/start/site-content-collection' );
}

function getDIFMSiteContentCollectionDestination( { siteSlug } ) {
	return `/home/${ siteSlug }`;
}

function getHostingFlowDestination() {
	const queryArgs = getQueryArgs();

	if ( queryArgs.flow === 'new-hosted-site' ) {
		return '/setup/new-hosted-site';
	}

	if ( queryArgs.flow === 'import-hosted-site' ) {
		return '/setup/import-hosted-site';
	}

	return '/sites?hosting-flow=true';
}

const flows = generateFlows( {
	getSiteDestination,
	getRedirectDestination,
	getSignupDestination,
	getLaunchDestination,
	getDomainSignupFlowDestination,
	getEmailSignupFlowDestination,
	getChecklistThemeDestination,
	getWithThemeDestination,
	getWithPluginDestination,
	getEditorDestination,
	getDestinationFromIntent,
	getDIFMSignupDestination,
	getDIFMSiteContentCollectionDestination,
	getHostingFlowDestination,
} );

function removeUserStepFromFlow( flow ) {
	if ( ! flow ) {
		return;
	}

	return {
		...flow,
		steps: flow.steps.filter( ( stepName ) => ! stepConfig[ stepName ].providesToken ),
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
	// Check for site slug before heading to checkout.
	// Sometimes, previous visits to the signup flow will have cart items leftovers.
	// In this cast redirecting to checkout would be incorrect, and it would redirect to /checkout/undefined.
	// If a flow wants us to go to checkout, it will have `siteSlug` set.
	if ( ! dependencies.siteSlug ) {
		return destination;
	}

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
			const isUserStepOnly = flow.steps.length === 1 && stepConfig[ flow.steps[ 0 ] ].providesToken;

			// Remove the user step unless the user has just completed the step
			// and then clicked the back button.
			// If the user step is the only step in the whole flow, e.g. /start/account, don't remove it as well.
			if ( ! param && ! detectHistoryNavigation.loadedViaHistory() && ! isUserStepOnly ) {
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
