import { useSelect } from '@wordpress/data';
import { useParams } from 'react-router-dom';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	AssertConditionResult,
	AssertConditionState,
	FlowV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useCanUserManageOptions } from 'calypso/landing/stepper/hooks/use-user-can-manage-options';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import type { SiteSelect } from '@automattic/data-stores';

const BASE_STEPS = [ STEPS.UNIFIED_PLANS ];

function initialize() {
	return stepsWithRequiredLogin( BASE_STEPS );
}

const planUpgradeFlow: FlowV2< typeof initialize > = {
	name: 'plan-upgrade',
	isSignupFlow: false,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useAssertConditions(): AssertConditionResult {
		const { siteSlug, siteId } = useSiteData();
		const fetchingSiteError = useSelect(
			( select ) => ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
			[]
		);

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! siteSlug && ! siteId ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'plan-upgrade did not provide the site slug or site id it is configured to.',
			};
		}

		if ( fetchingSiteError ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: fetchingSiteError.message,
			};
		}

		const { canManageOptions, isLoading } = useCanUserManageOptions();

		if ( isLoading ) {
			result = { state: AssertConditionState.CHECKING };
		}

		if ( ! isLoading && ( canManageOptions === false || canManageOptions === null ) ) {
			// Redirect to sites page since user doesn't have permission for this specific site
			window.location.assign( '/sites' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'You need manage_options capability to upgrade plans for this site.',
			};
		}

		return result;
	},

	useStepNavigation() {
		const { siteSlug } = useSiteData();
		const urlParams = useParams< { siteSlug?: string } >();
		const siteSlugFromParam = useSiteSlugParam();
		const query = useQuery();
		const redirectTo = query.get( 'redirect_to' );

		// Use URL path parameter first, then query parameter fallback
		const finalSiteSlug = siteSlug || urlParams.siteSlug || siteSlugFromParam;

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_PLANS.slug: {
					// User selected plan, go directly to checkout
					if ( providedDependencies?.cartItems && providedDependencies.cartItems.length > 0 ) {
						const selectedPlan = providedDependencies.cartItems[ 0 ]?.product_slug;
						if ( selectedPlan && finalSiteSlug ) {
							// Build checkout URL with plan
							const checkoutUrl = `/checkout/${ encodeURIComponent(
								finalSiteSlug
							) }/${ selectedPlan }`;

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
