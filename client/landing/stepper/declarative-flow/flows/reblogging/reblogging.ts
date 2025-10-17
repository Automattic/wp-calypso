import { OnboardActions } from '@automattic/data-stores';
import { REBLOGGING_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { getQueryArg, addQueryArgs, getQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { Flow, ProvidedDependencies } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const reblogging: Flow = {
	name: REBLOGGING_FLOW,
	get title() {
		return translate( 'Reblogging' );
	},
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.DOMAIN_SEARCH,
			STEPS.USE_MY_DOMAIN,
			STEPS.PLANS,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
		] );
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const {
			setSiteUrl,
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setSignupDomainOrigin,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		triggerGuidesForStep( flowName, _currentStepSlug );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'domains': {
					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL );
					}

					const suggestion = providedDependencies.suggestion as DomainSuggestion;

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( suggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );
					setHideFreePlan( ! suggestion.is_free );

					return navigate( 'plans' );
				}

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
						return navigate( destination as typeof _currentStepSlug );
					}

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setHideFreePlan( true );
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setDomainCartItem( providedDependencies.domainCartItem as MinimalRequestCartProduct );
					}

					return navigate( 'plans' );
				}

				case 'plans':
					return navigate( 'create-site' );

				case 'create-site':
					return navigate( 'processing' );

				case 'processing': {
					const postToShare = getQueryArg( window.location.search, 'blog_post' );
					const processDestination = addQueryArgs( `/post/${ providedDependencies?.siteSlug }`, {
						url: postToShare,
					} );

					if ( providedDependencies?.goToCheckout ) {
						persistSignupDestination( processDestination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent( processDestination );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					return window.location.assign( processDestination );
				}
			}
			return providedDependencies;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goToStep, submit };
	},
};

export default reblogging;
