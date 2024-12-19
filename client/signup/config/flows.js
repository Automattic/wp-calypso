import { getPlan, TYPE_ECOMMERCE, TYPE_BUSINESS } from '@automattic/calypso-products/';
import {
	PREMIUM_THEME,
	DOT_ORG_THEME,
	BUNDLED_THEME,
	MARKETPLACE_THEME,
	isAssemblerSupported,
} from '@automattic/design-picker';
import { isOnboardingGuidedFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { isURL } from '@wordpress/url';
import { get, includes, reject } from 'lodash';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { getQueryArgs } from 'calypso/lib/query-args';
import { addQueryArgs, pathToUrl } from 'calypso/lib/url';
import { generateFlows } from 'calypso/signup/config/flows-pure';
import stepConfig from './steps';

function getCheckoutUrl( dependencies, localeSlug, flowName, destination ) {
	let checkoutURL = `/checkout/${ dependencies.siteSlug }`;

	// Append the locale slug for the userless checkout page.
	if ( 'no-site' === dependencies.siteSlug && true === dependencies.allowUnauthenticated ) {
		checkoutURL += `/${ localeSlug }`;
	}

	const isDomainOnly = [ 'domain', 'domain-for-gravatar' ].includes( flowName );

	// checkoutBackUrl is required to be a complete URL, and will be further sanitized within the checkout package.
	// Due to historical reason, `destination` can be either a path or a complete URL.
	// Thus, if it is determined as not an URL, we assume it as a path here. We can surely make it more comprehensive,
	// but the required effort and computation cost might outweigh the gain.
	//
	// TODO:
	// the domain only flow has special rule. Ideally they should also be configurable in flows-pure.
	const checkoutBackUrl = isURL( destination )
		? destination
		: pathToUrl( isDomainOnly ? `/start/${ flowName }/domain-only` : destination );

	return addQueryArgs(
		{
			signup: 1,
			ref: getQueryArgs()?.ref,
			...( dependencies.coupon && { coupon: dependencies.coupon } ),
			...( isDomainOnly && { isDomainOnly: 1 } ),
			checkoutBackUrl: addQueryArgs( { skippedCheckout: 1 }, checkoutBackUrl ),
		},
		checkoutURL
	);
}

function dependenciesContainCartItem( dependencies ) {
	// @TODO: cartItem is now deprecated. Remove dependencies.cartItem and
	// dependencies.domainItem once all steps and flows have been updated to use cartItems
	return dependencies.cartItem || dependencies.domainItem || dependencies.cartItems;
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

function getSignupDestination( { domainItem, siteId, siteSlug, refParameter, flowName, ...rest } ) {
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

	// For guided flow, in the variant where the goals are answered in the first step, redirect to the site-setup-wg (without goals).
	// NOTE: we may need a better way to detect the variant where goals are answered in the first step.
	// The `segmentationSurveyAnswers` are persisted and can affect the following visits of the flow.
	if (
		isOnboardingGuidedFlow( flowName ) &&
		rest.segmentationSurveyAnswers?.[ 'what-are-your-goals' ]
	) {
		return addQueryArgs( queryParam, '/setup/site-setup-wg' );
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

	// `getThankYouPageUrl` appends a receipt ID to this slug even if it doesn't contain the
	// `:receipt_id` placeholder
	return '/checkout/thank-you/no-site';
}

function getEmailSignupFlowDestination( { siteId, siteSlug } ) {
	return addQueryArgs(
		{ siteId },
		`/checkout/thank-you/features/email-license/${ siteSlug }/:receiptId`
	);
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
		[ DOT_ORG_THEME, PREMIUM_THEME, MARKETPLACE_THEME, BUNDLED_THEME ].includes( themeType )
	) {
		return `/setup/site-setup/designSetup?siteSlug=${ siteSlug }`;
	}

	if ( DOT_ORG_THEME === themeType ) {
		return `/marketplace/theme/${ themeParameter }/install/${ siteSlug }`;
	}

	const style = styleVariation ? `&styleVariation=${ styleVariation }` : '';

	if ( [ MARKETPLACE_THEME, PREMIUM_THEME, BUNDLED_THEME ].includes( themeType ) ) {
		return `/marketplace/thank-you/${ siteSlug }?onboarding=&themes=${ themeParameter }${ style }`;
	}

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

function getHostingFlowDestination( { stepperHostingFlow } ) {
	return `/setup/${ stepperHostingFlow }`;
}

function getEntrepreneurFlowDestination( { redirect_to } ) {
	return redirect_to || '/setup/entrepreneur/trialAcknowledge';
}

function getGuidedOnboardingFlowDestination( dependencies ) {
	const { onboardingSegment, siteSlug, siteId, domainItem, cartItems, refParameter } = dependencies;

	if ( ! onboardingSegment ) {
		return getSignupDestination( dependencies );
	}

	if ( 'no-site' === siteSlug ) {
		return '/home';
	}

	let queryParams = { siteSlug, siteId };

	if ( domainItem ) {
		queryParams = { siteId };
	}

	if ( refParameter ) {
		queryParams.ref = refParameter;
	}

	const planSlug = getPlanCartItem( cartItems )?.product_slug;
	const planType = getPlan( planSlug )?.type;

	// Blog and Merchant setup without Entrepreneur/Ecommerce Plan
	if (
		( onboardingSegment === 'blogger' || onboardingSegment === 'merchant' ) &&
		planType !== TYPE_ECOMMERCE
	) {
		return addQueryArgs( queryParams, `/setup/site-setup-wg/options` );
	}

	// Not Blog, Merchant, nor Developer/Agency without Entrepreneur/Ecommerce Plan
	if (
		onboardingSegment !== 'blogger' &&
		onboardingSegment !== 'merchant' &&
		onboardingSegment !== 'developer-or-agency' &&
		planType !== TYPE_ECOMMERCE
	) {
		return addQueryArgs( queryParams, `/setup/site-setup-wg/design-choices` );
	}

	// Entrepreneur/Ecommerce Plan
	if ( planType === TYPE_ECOMMERCE ) {
		return `/checkout/thank-you/${ siteSlug }`;
	}

	// Developer or Agency with Creator/Business Plan
	if ( onboardingSegment === 'developer-or-agency' && planType === TYPE_BUSINESS ) {
		queryParams.initiate_transfer_context = 'guided';
		queryParams.redirect_to = `/home/${ siteSlug }`;
		return addQueryArgs( queryParams, '/setup/transferring-hosted-site' );
	}

	return addQueryArgs( queryParams, `/setup/site-setup-wg/design-choices` );
}

const flows = generateFlows( {
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
	getEntrepreneurFlowDestination,
	getGuidedOnboardingFlowDestination,
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
	// In this case, redirecting to checkout would be incorrect, and it would redirect to /checkout/undefined.
	// If a flow wants us to go to checkout, it will have `siteSlug` set.
	if ( ! dependencies.siteSlug ) {
		return destination;
	}

	if ( dependenciesContainCartItem( dependencies ) ) {
		return getCheckoutUrl( dependencies, localeSlug, flowName, destination );
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
			const isUserStepOnly = flow.steps.length === 1 && stepConfig[ flow.steps[ 0 ] ].providesToken;

			// Remove the user step unless it is the only step in the whole flow, e.g., `/start/account`
			if ( ! isUserStepOnly ) {
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
