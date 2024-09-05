import { OnboardSelect } from '@automattic/data-stores';
import { addPlanToCart, addProductsToCart, ONBOARDING_FLOW } from '@automattic/onboarding';
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
	__experimentalUseBuiltinAuth: true,
	useSteps() {
		return stepsWithRequiredLogin( [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/unified-domains' ),
			},
			{
				slug: 'use-my-domain',
				asyncComponent: () => import( './internals/steps-repository/use-my-domain' ),
			},
			{
				slug: 'plans',
				asyncComponent: () => import( './internals/steps-repository/plans' ),
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
		const flowName = this.name;

		const { setDomain, setDomainCartItems } = useDispatch( ONBOARD_STORE );

		const { domainCartItem, planCartItem } = useSelect(
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
					setDomainCartItems( providedDependencies.domainCart );
					if ( providedDependencies.navigateToUseMyDomain ) {
						return navigate( 'use-my-domain' );
					}
					return navigate( 'plans' );
				case 'use-my-domain':
					return navigate( 'plans' );
				case 'plans':
					return navigate( 'create-site', undefined, true );
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'processing': {
					const destination = addQueryArgs( '/setup/site-setup/goals', {
						siteSlug: providedDependencies.siteSlug,
					} );
					persistSignupDestination( destination );
					if ( providedDependencies.goToCheckout ) {
						const siteSlug = providedDependencies.siteSlug as string;

						if ( planCartItem && siteSlug && flowName ) {
							await addPlanToCart( siteSlug, flowName, true, '', planCartItem );
						}

						if ( domainCartItem && siteSlug && flowName ) {
							await addProductsToCart( siteSlug, flowName, [ domainCartItem ] );
						}

						resetOnboardStore();

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
				case 'use-my-domain':
					return navigate( 'domains' );
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
