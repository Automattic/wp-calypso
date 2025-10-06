import { PLAN_UPGRADE_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	AssertConditionResult,
	AssertConditionState,
	FlowV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { SITE_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import type { SiteSelect, UserSelect } from '@automattic/data-stores';

const BASE_STEPS = [ STEPS.UNIFIED_PLANS ];

function initialize() {
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
		const selectedFeature = query.get( 'feature' );

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

	useAssertConditions(): AssertConditionResult {
		const { site, siteSlug, siteId } = useSiteData();

		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const fetchingSiteError = useSelect(
			( select ) => ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
			[]
		);

		const { isAdmin, isFetching } = useIsSiteAdmin();

		// Track how long we've been waiting for site data
		const [ waitingTooLong, setWaitingTooLong ] = useState( false );

		useEffect( () => {
			if ( ( siteSlug || siteId ) && ! site ) {
				// Set a timeout - if no site after 5 seconds, give up
				const timeoutId = setTimeout( () => {
					setWaitingTooLong( true );
				}, 5000 );

				return () => clearTimeout( timeoutId );
			}
			setWaitingTooLong( false );
		}, [ siteSlug, siteId, site ] );

		// All hooks called - now we can use conditional logic
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! userIsLoggedIn ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'User must be logged in to access plan upgrade flow.',
			};
		} else if ( ! siteSlug && ! siteId ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'plan-upgrade did not provide the site slug or site id it is configured to.',
			};
		} else if ( fetchingSiteError ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: fetchingSiteError.message,
			};
		} else if ( waitingTooLong ) {
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'Site not found or you do not have access to this site.',
			};
		} else if ( isFetching || ! site || isAdmin === null ) {
			// Still loading site data or waiting for admin check
			result = { state: AssertConditionState.CHECKING };
		} else if ( isAdmin === false ) {
			// Site loaded and user is definitely not admin
			window.location.assign( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'You need to be an admin to upgrade plans for this site.',
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
