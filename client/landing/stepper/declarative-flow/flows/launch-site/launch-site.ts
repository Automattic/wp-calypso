import { DomainSuggestion, OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { LAUNCH_SITE_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { launchSiteApi } from 'calypso/lib/signup/step-actions';
import {
	persistSignupDestination,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProvidedDependencies } from '../../internals/types';
import type { FlowV2 } from '../../internals/types';

const launchSite: FlowV2 = {
	name: LAUNCH_SITE_FLOW,
	__experimentalUseSessions: true,
	isSignupFlow: false,
	async initialize() {
		const { resetOnboardStore } = dispatch( ONBOARD_STORE ) as OnboardActions;

		await resetOnboardStore();

		return stepsWithRequiredLogin( [
			STEPS.UNIFIED_DOMAINS,
			STEPS.UNIFIED_PLANS,
			STEPS.PROCESSING,
		] );
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const siteSlug = useSiteSlug()!;
		const { setPendingAction } = useDispatch( ONBOARD_STORE );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case STEPS.UNIFIED_DOMAINS.slug: {
					await setSiteUrl( providedDependencies.siteUrl as string );
					await setDomain( providedDependencies.suggestion as DomainSuggestion );
					await setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					await setDomainCartItems(
						providedDependencies.domainCart as MinimalRequestCartProduct[]
					);
					await setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem > | null;
					const [ pickedPlan, ...extraProducts ] = cartItems ?? [];

					if ( ! pickedPlan ) {
						throw new Error( 'No product slug found' );
					}

					await setPlanCartItem( pickedPlan );
					await setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );

					setPendingAction( async () => {
						await launchSiteApi( { siteSlug } );

						return {
							siteSlug,
						};
					} );
					return navigate( 'processing' );
				}

				case 'processing': {
					const homeUrl = `/home/${ siteSlug }`;

					const checkoutUrl = addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
						redirect_to: homeUrl,
					} );

					persistSignupDestination( homeUrl );
					setSignupCompleteSlug( siteSlug );
					setSignupCompleteFlowName( flowName );

					return window.location.replace( checkoutUrl );

					// handle site creation error.
					return navigate( 'error' );
				}
			}
		}

		const goBack = () => {
			return;
		};

		return { goBack, submit };
	},
};

export default launchSite;
