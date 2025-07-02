import { Onboard, OnboardActions, UserSelect, Visibility } from '@automattic/data-stores';
import { ONBOARDING_AFF_PM_FLOW } from '@automattic/onboarding';
import { dispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import {
	clearSignupDestinationCookie,
	setSignupCompleteFlowName,
	persistSignupDestination,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE, USER_STORE } from '../../../stores';
import { usePurchasePlanNotification } from '../../internals/hooks/use-purchase-plan-notification';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler, ProvidedDependencies } from '../../internals/types';

function initialize() {
	const { setHidePlansFeatureComparison, setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;

	// Set up the flow defaults
	setHidePlansFeatureComparison( false ); // Show plan comparisons for conversion
	clearSignupDestinationCookie();
	setIntent( Onboard.SiteIntent.Build ); // Default to build intent

	// Minimal flow: plans -> siteless checkout -> post-checkout processing
	// No login required - authentication will happen during checkout
	// Need processing and post-checkout steps for Commerce plan atomic conversion
	return [ STEPS.UNIFIED_PLANS, STEPS.POST_CHECKOUT_ONBOARDING, STEPS.PROCESSING, STEPS.ERROR ];
}

const onboardingAffPmFlow: FlowV2< typeof initialize > = {
	name: ONBOARDING_AFF_PM_FLOW,

	isSignupFlow: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const { setSignupDomainOrigin } = dispatch( ONBOARD_STORE ) as OnboardActions;
		const { setShouldShowNotification } = usePurchasePlanNotification();

		/**
		 * Get post-checkout destination for affiliate-pm flow (simplified version)
		 */
		const getPostCheckoutDestination = async (
			providedDependencies: ProvidedDependencies
		): Promise< string > => {
			// For affiliate-pm, we want to go to the site home page after setup
			if ( providedDependencies.siteSlug ) {
				return addQueryArgs( `/home/${ providedDependencies.siteSlug }`, { ref: flowName } );
			}
			// Fallback to generic home if no siteSlug
			return '/';
		};

		/**
		 * Handle step submissions for the AFF PM flow
		 */
		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'plans': {
					// Set domain origin as not set since this flow skips domain selection
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.NOT_SET );

					// Create minimal siteParams for post-checkout site creation
					const siteParams = {
						blog_name: '', // Will be auto-generated from username if empty
						blog_title: translate( 'My Site' ), // Default site title
						public: Visibility.PublicNotIndexed, // Coming soon by default
						options: {
							site_creation_flow: flowName, // Track which flow created the site
							wpcom_public_coming_soon: 1, // Launch as coming soon
						},
						find_available_url: true, // Auto-find available URL since no domain was selected
						validate: false,
					};

					// Save siteParams to localStorage for checkout to use
					try {
						window.localStorage.setItem( 'siteParams', JSON.stringify( siteParams ) );
					} catch ( error ) {
						// Silently fail if localStorage is not available
					}

					// Redirect directly to siteless checkout with selected plan
					if ( providedDependencies?.cartItems?.length ) {
						// Set completion tracking for post-checkout site creation
						setSignupCompleteFlowName( flowName );

						// Set the post-checkout destination to go through affiliate-pm flow steps
						// Use our own flow's post-checkout step instead of borrowing from regular onboarding
						persistSignupDestination( `/setup/${ flowName }/post-checkout-onboarding` );

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
				}

				case 'post-checkout-onboarding':
					setShouldShowNotification( providedDependencies?.siteId as number );
					return navigate( 'processing' );

				case 'processing': {
					// Handle final redirect after site setup is complete
					const destination = await getPostCheckoutDestination( providedDependencies );
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						// Replace the location to delete processing step from history
						window.location.replace( destination );
					} else {
						// Handle errors by navigating to error step
						return navigate( 'error' );
					}
					return;
				}

				default:
					// This shouldn't happen in this flow
					return navigate( 'error' );
			}
		};

		return { submit };
	},
};

export default onboardingAffPmFlow;
