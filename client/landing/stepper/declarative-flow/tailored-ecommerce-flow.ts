import { PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, ECOMMERCE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const ecommerceFlow: Flow = {
	name: ECOMMERCE_FLOW,
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_ecommerce', { flow: this.name } );
		}, [] );

		return [
			'domains',
			'siteCreationStep',
			'processing',
			'wooInstallPlugins',
			'intro',
			'storeProfiler',
			'designCarousel',
		] as StepPath[];
	},

	useStepNavigation( _currentStepName, navigate ) {
		const flowName = this.name;
		const { setStepProgress, setPlanCartItem } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepName, flowName } );
		setStepProgress( flowProgress );
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();

		const getStartUrl = () => {
			return locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=/setup/storeProfiler?flow=${ flowName }`
				: `/start/account/user?variationName=${ flowName }&redirect_to=/setup/storeProfiler?flow=${ flowName }`;
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepName );
			const logInUrl = getStartUrl();

			switch ( _currentStepName ) {
				case 'domains':
					recordTracksEvent( 'calypso_signup_plan_select', {
						product_slug: PLAN_ECOMMERCE,
						from_section: 'default',
					} );

					setPlanCartItem( { product_slug: PLAN_ECOMMERCE } );
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					// Coming from designCarousel Step
					if ( providedDependencies?.selectedDesign ) {
						window.location.assign( `/home/${ providedDependencies.siteSlug }` );
						return;
					}

					// Coming from wooInstallPlugins Step
					if ( providedDependencies?.finishedInstallPlugins ) {
						return navigate( 'intro' );
					}

					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/intro?siteSlug=${ providedDependencies.siteSlug }&flow=${ flowName }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						// The site is coming from the checkout already Atomic (and with the new URL)
						// There's probably a better way of handling this change
						const returnUrl = encodeURIComponent(
							`/setup/wooInstallPlugins?siteSlug=${ (
								providedDependencies?.siteSlug as string
							 )?.replace( 'wordpress.com', 'wpcomstaging.com' ) }&flow=${ flowName }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					return navigate(
						`intro?flow=${ flowName }&siteSlug=${ providedDependencies?.siteSlug }`
					);

				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'storeProfiler' );
					}
					return window.location.assign( logInUrl );

				case 'storeProfiler':
					return navigate( 'designCarousel' );

				case 'designCarousel':
					return navigate( 'processing' );

				case 'wooInstallPlugins':
					return navigate( 'processing' );
			}
			return providedDependencies;
		}

		const goBack = () => {
			switch ( _currentStepName ) {
				case 'designCarousel':
					return navigate( 'storeProfiler' );
				default:
					return navigate( 'intro' );
			}
			return;
		};

		const goNext = () => {
			switch ( _currentStepName ) {
				case 'intro':
					return navigate( 'storeProfiler' );
				case 'storeProfiler':
					return navigate( 'designCarousel' );
				case 'designCarousel':
					return navigate( 'designCarousel' );
				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
