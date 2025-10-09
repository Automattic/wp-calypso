import { PLAN_UPGRADE_FLOW } from '@automattic/onboarding';
import { resolveSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { FlowV2, SubmitHandler } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';

const BASE_STEPS = [ STEPS.UNIFIED_PLANS ];

/**
 * Checks if the user has access to upgrade plans for the given site
 */
async function checkUserHasAccess(): Promise< boolean > {
	// Get site slug or ID from query params
	const queryParams = getCurrentQueryParams();
	const siteSlugFromQuery = queryParams.get( 'siteSlug' );
	const siteIdFromQuery = queryParams.get( 'siteId' );

	const siteIdOrSlug = siteSlugFromQuery || siteIdFromQuery;

	if ( ! siteIdOrSlug ) {
		return false;
	}

	try {
		const site = await resolveSelect( SITE_STORE ).getSite( siteIdOrSlug );

		if ( ! site ) {
			return false;
		}

		// Check if user can manage the site using the capabilities from the site object
		return site.capabilities?.manage_options === true;
	} catch ( error ) {
		return false;
	}
}

async function initialize() {
	const hasAccess = await checkUserHasAccess();

	if ( ! hasAccess ) {
		window.location.assign( '/' );
		return false;
	}

	return stepsWithRequiredLogin( BASE_STEPS );
}

const planUpgradeFlow: FlowV2< typeof initialize > = {
	name: PLAN_UPGRADE_FLOW,
	title: __( 'Upgrade plan' ),
	isSignupFlow: false,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useStepsProps() {
		const query = useQuery();
		const selectedFeature = query.get( 'feature' ) ?? undefined;

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				// Note that this step uses this flow name to select the `plans-upgrade` intent.

				// This flag enables upgrade-specific behavior in PlansFeaturesMain
				isStepperUpgradeFlow: true,

				// This is NOT a signup flow - use logged-in behavior for current plans
				isInSignup: false,

				// Pass the feature parameter for feature-based plan filtering
				selectedFeature,
			},
		};
	},

	useStepNavigation() {
		const query = useQuery();
		const siteSlug = query.get( 'siteSlug' );
		const redirectTo = query.get( 'redirect_to' );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_PLANS.slug: {
					// User selected plan, go directly to checkout
					if ( providedDependencies?.cartItems && providedDependencies.cartItems.length > 0 ) {
						const selectedPlan = providedDependencies.cartItems[ 0 ]?.product_slug;
						if ( selectedPlan && siteSlug ) {
							// Build checkout URL with plan
							const checkoutUrl = `/checkout/${ encodeURIComponent( siteSlug ) }/${ selectedPlan }`;

							// Add redirect_to parameter if provided
							const queryParams = new URLSearchParams();
							if ( redirectTo ) {
								queryParams.set( 'redirect_to', redirectTo );
							}

							const finalUrl = queryParams.toString()
								? `${ checkoutUrl }?${ queryParams.toString() }`
								: checkoutUrl;

							window.location.assign( finalUrl );
						}
						return;
					}

					// If no cart items, something went wrong - redirect to sites
					window.location.assign( '/sites' );
					break;
				}
			}
		};

		return { submit };
	},
};

export default planUpgradeFlow;
