import { OnboardSelect } from '@automattic/data-stores';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { Flow, ProvidedDependencies } from './internals/types';

const onboarding: Flow = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	useSteps() {
		return stepsWithRequiredLogin( [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/unified-domains' ),
			},
			{
				slug: 'plans',
				asyncComponent: () => import( './internals/steps-repository/unified-plans' ),
			},
			{
				slug: 'create-site',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		] );
	},

	useSideEffect() {
		useEffect( () => {
			clearSignupDestinationCookie();
		}, [] );
	},

	useStepNavigation( currentStepSlug, navigate ) {
		const { setDomain, setDomainCartItem, setDomainCartItems, setPlanCartItem } =
			useDispatch( ONBOARD_STORE );

		const { planCartItem } = useSelect(
			( select: ( key: string ) => OnboardSelect ) => ( {
				domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
				planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
			} ),
			[]
		);

		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( currentStepSlug ) {
				case 'domains':
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					return navigate( 'plans' );
				case 'plans': {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem >;
					setPlanCartItem( cartItems?.[ 0 ] ?? null );
					return navigate( 'create-site', undefined, true );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'processing': {
					const destination = addQueryArgs( '/setup/site-setup/goals', {
						siteSlug: providedDependencies.siteSlug,
					} );
					persistSignupDestination( destination );
					if ( providedDependencies.goToCheckout ) {
						const siteSlug = providedDependencies.siteSlug as string;

						// replace the location to delete processing step from history.
						window.location.replace(
							addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
								redirect_to: destination,
								signup: 1,
							} )
						);
					} else {
						// replace the location to delete processing step from history.
						window.location.replace( destination );
					}
				}
				default:
					return;
			}
		};

		const goBack = () => {
			switch ( currentStepSlug ) {
				case 'plans':
					return navigate( 'domains' );
				default:
					return;
			}
		};

		return { goBack, submit };
	},
};

export default onboarding;
