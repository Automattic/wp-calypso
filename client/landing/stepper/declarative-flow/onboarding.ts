import { OnboardSelect } from '@automattic/data-stores';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
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

	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE );

		const { planCartItem } = useSelect(
			( select: ( key: string ) => OnboardSelect ) => ( {
				domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
				planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
			} ),
			[]
		);

		const clearUseMyDomainsQueryParams = () => {
			if (
				currentStepSlug === 'domains' ||
				( currentStepSlug === 'plans' && getQueryArg( window.location.href, 'step' ) )
			) {
				window.history.replaceState( {}, document.title, window.location.pathname );
			}
		};

		clearUseMyDomainsQueryParams();

		const [ redirectedToUseMyDomain, setRedirectedToUseMyDomain ] = useState( false );
		const [ useMyDomainQueryParams, setUseMyDomainQueryParams ] = useState( {} );

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( currentStepSlug ) {
				case 'domains':
					setSiteUrl( providedDependencies.siteUrl );
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin );

					if ( providedDependencies.navigateToUseMyDomain ) {
						setRedirectedToUseMyDomain( true );
						let useMyDomainURL = 'use-my-domain?step=domain-input';
						if ( ( providedDependencies?.domainForm as { lastQuery?: string } )?.lastQuery ) {
							useMyDomainURL = addQueryArgs( useMyDomainURL, {
								initialQuery: ( providedDependencies?.domainForm as { lastQuery?: string } )
									?.lastQuery,
							} );
						}
						return navigate( useMyDomainURL );
					}

					setRedirectedToUseMyDomain( false );
					return navigate( 'plans' );
				case 'use-my-domain':
					if ( providedDependencies?.mode && providedDependencies?.domain ) {
						return navigate(
							`use-my-domain?step=${ providedDependencies.mode }&initialQuery=${ providedDependencies.domain }`
						);
					}
					setUseMyDomainQueryParams( getQueryArgs( window.location.href ) );
					return navigate( 'plans' );
				case 'plans': {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem >;
					setPlanCartItem( cartItems?.[ 0 ] ?? null );
					if ( ! cartItems?.[ 0 ] ) {
						// Since we're removing the paid domain, it means that the user chose to continue
						// with a free domain. Because signupDomainOrigin should reflect the last domain
						// selection status before they land on the checkout page, we switch the value
						// to "free".
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.FREE );
					}
					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site', undefined, true );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'processing': {
					const destination = addQueryArgs( '/setup/site-setup/goals', {
						siteSlug: providedDependencies.siteSlug,
					} );
					persistSignupDestination( destination );
					setSignupCompleteFlowName( flowName );
					setSignupCompleteSlug( providedDependencies.siteSlug );

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
				case 'use-my-domain':
					if ( getQueryArg( window.location.href, 'step' ) === 'transfer-or-connect' ) {
						const url = addQueryArgs( 'use-my-domain', {
							step: 'domain-input',
							initialQuery: getQueryArg( window.location.href, 'initialQuery' ),
						} );
						return navigate( url );
					}

					if ( window.location.search ) {
						window.history.replaceState( {}, document.title, window.location.pathname );
					}
					return navigate( 'domains' );
				case 'plans':
					if ( redirectedToUseMyDomain ) {
						if ( Object.keys( useMyDomainQueryParams ).length ) {
							// restore query params
							const useMyDomainURL = addQueryArgs( 'use-my-domain', useMyDomainQueryParams );
							return navigate( useMyDomainURL );
						}
						return navigate( 'use-my-domain' );
					}
					return navigate( 'domains' );
				default:
					return;
			}
		};

		return { goBack, submit };
	},
};

export default onboarding;
