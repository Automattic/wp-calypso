import { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { clearStepPersistedState, ONBOARDING_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { addSurvicate } from 'calypso/lib/analytics/survicate';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { pathToUrl } from 'calypso/lib/url';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
	clearSignupCompleteSlug,
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
	clearSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { useSelector, useDispatch as useReduxDispatch } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { State } from '../../../../../../packages/data-stores/src/plans/reducer';
import { isPlanProductFree } from '../../../../../../packages/data-stores/src/plans/selectors';
import { useFlowLocale } from '../../../hooks/use-flow-locale';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { getOnboardingPostCheckoutDestination } from '../../helpers/get-onboarding-post-checkout-destination';
import { withLocale } from '../../helpers/with-locale';
import { usePurchasePlanNotification } from '../../internals/hooks/use-purchase-plan-notification';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type ProvidedDependencies, type SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';

function initialize() {
	const steps = [
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.POST_CHECKOUT_ONBOARDING,
		STEPS.SETUP_YOUR_SITE_AI,
	];

	return [ ...stepsWithRequiredLogin( steps ), STEPS.PLAYGROUND ];
}

const onboarding: FlowV2< typeof initialize > = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;

		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const locale = useFlowLocale();
		const { signupDomainOrigin, planCartItem } = useSelect(
			( select ) => ( {
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			} ),
			[]
		);
		const coupon = useQuery().get( 'coupon' );

		const { setShouldShowNotification } = usePurchasePlanNotification();

		const playgroundId = useQuery().get( 'playground' );

		/**
		 * Returns [destination, backDestination] for the post-checkout destination.
		 */
		const getPostCheckoutDestination = async (
			providedDependencies: ProvidedDependencies,
			planCartItem: MinimalRequestCartProduct | null
		): Promise< [ string, string | null ] > => {
			if ( ! providedDependencies.hasExternalTheme && providedDependencies.hasPluginByGoal ) {
				return [ `/home/${ providedDependencies.siteSlug }`, null ];
			}

			if ( playgroundId ) {
				// Check if the user selected the free plan
				const isFree =
					! planCartItem || isPlanProductFree( {} as unknown as State, planCartItem?.product_id );

				if ( isFree ) {
					// Redirect free plan users to a home page
					return [ `/home/${ providedDependencies.siteSlug }`, null ];
				}

				return [
					addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), {
						siteSlug: providedDependencies.siteSlug,
						siteId: providedDependencies.siteId,
						playground: playgroundId,
					} ),
					null,
				];
			}

			return getOnboardingPostCheckoutDestination( {
				flowName,
				locale,
				siteSlug: providedDependencies.siteSlug as string,
			} );
		};

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains':
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigate( 'plans' );
				case 'use-my-domain': {
					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStepSlug );
					}

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setHideFreePlan( true );
						setDomainCartItem( providedDependencies.domainCartItem );
					}

					return navigate( 'plans' );
				}
				case 'plans': {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...products ] = cartItems ?? [];

					setPlanCartItem( pickedPlan );

					if ( ! pickedPlan ) {
						// Since we're removing the paid domain, it means that the user chose to continue
						// with a free domain. Because signupDomainOrigin should reflect the last domain
						// selection status before they land on the checkout page, this value can be
						// 'free' or 'choose-later'
						if ( signupDomainOrigin === 'choose-later' ) {
							setSignupDomainOrigin( signupDomainOrigin );
						} else {
							setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.FREE );
						}
					}

					// Make sure to put the rest of products into the cart, e.g. the storage add-ons.
					setProductCartItems( products.filter( ( product ) => product !== null ) );

					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site', undefined, false );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'post-checkout-onboarding': {
					setShouldShowNotification( providedDependencies?.siteId as number );
					return navigate( 'processing' );
				}
				case 'setup-your-site-ai': {
					const setupChoice = providedDependencies?.setupChoice;
					const siteSlug = providedDependencies?.siteSlug as string;
					const siteId = providedDependencies?.siteId as number | string | undefined;

					switch ( setupChoice ) {
						case 'build-with-ai':
							window.location.assign(
								addQueryArgs( `/setup/${ SITE_SETUP_FLOW }/${ STEPS.LAUNCH_BIG_SKY.slug }`, {
									siteSlug,
									siteId,
									fromPostCheckoutSetupSite: '1',
								} )
							);
							return;
						case 'blank-site':
							window.location.assign( `/sites/${ siteSlug }` );
							return;
						default:
							return;
					}
				}
				case 'processing': {
					const [ destination, backDestination ] = await getPostCheckoutDestination(
						providedDependencies,
						planCartItem
					);
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						persistSignupDestination( destination );
						setSignupCompleteFlowName( flowName );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						if ( providedDependencies.goToCheckout ) {
							const siteSlug = providedDependencies.siteSlug as string;

							/**
							 * If the user comes from the Playground onboarding flow,
							 * redirect the user back to Playground to start the import.
							 */
							const playgroundId = getQueryArg( window.location.href, 'playground' );
							const redirectTo: string =
								playgroundId &&
								! isPlanProductFree( {} as unknown as State, planCartItem?.product_id )
									? addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), {
											siteSlug,
											siteId: providedDependencies.siteId,
											playground: playgroundId,
									  } )
									: addQueryArgs(
											withLocale( '/setup/onboarding/post-checkout-onboarding', locale ),
											{
												siteSlug,
											}
									  );

							// replace the location to delete processing step from history.
							window.location.replace(
								addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
									redirect_to: redirectTo,
									signup: 1,
									checkoutBackUrl: pathToUrl( backDestination ?? '' ),
									coupon,
								} )
							);
						} else if ( providedDependencies?.postCheckoutBigSkyVariation === 'big_sky' ) {
							return navigate( 'setup-your-site-ai' );
						} else {
							// replace the location to delete processing step from history.
							window.location.replace( destination );
						}
					} else {
						// TODO: Handle errors
						// navigate( 'error' );
					}
					return;
				}
				case 'playground':
					return navigate( 'domains' );
				default:
					return;
			}
		};
		return { submit };
	},
	useSideEffect( currentStepSlug ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const isLoggedIn = useSelector( isUserLoggedIn );

		/**
		 * Clears every state we're persisting during the flow
		 * when entering it. This is to ensure that the user
		 * starts on a clean slate.
		 */
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( null ) );
				clearStepPersistedState( this.name );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();
			}
		}, [ currentStepSlug, reduxDispatch, resetOnboardStore ] );

		/**
		 * Load Survicate and set visitor traits on each step navigation.
		 *
		 * This runs on every step change to ensure:
		 * - Survicate script loads successfully (retries if initial load failed)
		 * - Visitor traits are updated when user authentication state changes
		 * - Analytics tracking works correctly throughout the onboarding flow
		 */
		useEffect( () => {
			if ( isLoggedIn ) {
				addSurvicate();
			}
		}, [ isLoggedIn, currentStepSlug ] );

		// Preload the visual split experiment
		useEffect( () => {
			loadExperimentAssignment( 'calypso_plans_page_visual_separation_2025_09_v2' );
		}, [] );
	},
};

export default onboarding;
