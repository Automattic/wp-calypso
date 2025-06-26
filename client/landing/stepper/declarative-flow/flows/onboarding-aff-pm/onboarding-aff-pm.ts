import { Onboard, OnboardActions, UserSelect } from '@automattic/data-stores';
import { ONBOARDING_AFF_PM_FLOW } from '@automattic/onboarding';
import { dispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import {
	clearSignupDestinationCookie,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE, USER_STORE } from '../../../stores';
import { STEPS } from '../../internals/steps';
import type { FlowV2, SubmitHandler } from '../../internals/types';

function initialize() {
	const { setHidePlansFeatureComparison, setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;

	// Set up the flow defaults
	setHidePlansFeatureComparison( false ); // Show plan comparisons for conversion
	clearSignupDestinationCookie();
	setIntent( Onboard.SiteIntent.Build ); // Default to build intent

	// Minimal flow: plans -> siteless checkout
	// No login required - authentication will happen during checkout
	// No processing step needed since we go directly to checkout
	return [ STEPS.UNIFIED_PLANS, STEPS.ERROR ];
}

const onboardingAffPmFlow: FlowV2< typeof initialize > = {
	name: ONBOARDING_AFF_PM_FLOW,
	get title() {
		return translate( 'Get Started with WordPress.com' );
	},
	isSignupFlow: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		/**
		 * Handle step submissions for the AFF PM flow
		 */
		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'plans':
					// Redirect directly to siteless checkout with selected plan
					if ( providedDependencies?.cartItems?.length ) {
						// Set completion tracking for post-checkout site creation
						setSignupCompleteFlowName( flowName );

						// Get the selected plan from cartItems
						const planItem = providedDependencies.cartItems.find( ( item ) => item.product_slug );

						if ( planItem ) {
							// Use dedicated affiliate-pm siteless checkout with plan in URL (similar to Jetpack/Akismet)
							// Don't add signup=1 for logged-in users to avoid account creation conflicts
							const urlParams = new URLSearchParams();
							urlParams.set( 'flow', flowName );

							// Only add signup=1 for logged-out users
							if ( ! userIsLoggedIn ) {
								urlParams.set( 'signup', '1' );
							}

							const checkoutUrl = `/checkout/affiliate-pm/${
								planItem.product_slug
							}?${ urlParams.toString() }`;
							return window.location.replace( checkoutUrl );
						}
					}

					// Fallback to error if no plan selected
					return navigate( 'error' );

				default:
					// This shouldn't happen in this minimal flow
					return navigate( 'error' );
			}
		};

		return { submit };
	},

	useStepsProps() {
		// Get acquisition source from URL params to differentiate PM vs Affiliate
		const urlParams = new URLSearchParams( window.location.search );
		const isAffiliate =
			urlParams.get( 'ref' )?.includes( 'affiliate' ) ||
			urlParams.get( 'utm_source' )?.includes( 'affiliate' );

		return {
			plans: {
				// Hide all plans except Business and Commerce
				hideFreePlan: true,
				hidePersonalPlan: true,
				hidePremiumPlan: true,
				hideBusinessPlan: false,
				hideEcommercePlan: false,
				// Hide coupon input for PM, show for affiliate
				hideCouponInput: ! isAffiliate,
				// Use affiliate intent to ensure proper plan filtering
				intent: 'plans-affiliate',
				intervalType: 'yearly', // Default to yearly for better value perception
			},
		};
	},
};

export default onboardingAffPmFlow;
