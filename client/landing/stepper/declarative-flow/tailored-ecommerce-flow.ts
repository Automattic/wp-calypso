import { PLAN_ECOMMERCE, PLAN_ECOMMERCE_MONTHLY } from '@automattic/calypso-products';
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
import { useSite } from '../hooks/use-site';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { SiteDetailsPlan } from '@automattic/data-stores';

export const ecommerceFlowRecurTypes = {
	YEARLY: 'yearly',
	MONTHLY: 'monthly',
};

export const ecommerceFlow: Flow = {
	name: ECOMMERCE_FLOW,
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_ecommerce', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'storeProfiler',
			'storeAddress',
			'domains',
			'designCarousel',
			'siteCreationStep',
			'processing',
			'waitForAtomic',
			'setThemeStep',
			'checkPlan',
		] as StepPath[];
	},

	useStepNavigation( _currentStepName, navigate ) {
		const flowName = this.name;
		const { setStepProgress, setPlanCartItem, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepName, flowName } );
		setStepProgress( flowProgress );
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const { selectedDesign, recurType } = useSelect( ( select ) => ( {
			selectedDesign: select( ONBOARD_STORE ).getSelectedDesign(),
			recurType: select( ONBOARD_STORE ).getEcommerceFlowRecurType(),
		} ) );
		const selectedPlan =
			recurType === ecommerceFlowRecurTypes.YEARLY ? PLAN_ECOMMERCE : PLAN_ECOMMERCE_MONTHLY;

		const locale = useLocale();
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const flags = new URLSearchParams( window.location.search ).get( 'flags' );

		const getStartUrl = () => {
			const url =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=/setup/ecommerce/storeProfiler`
					: `/start/account/user?variationName=${ flowName }&redirect_to=/setup/ecommerce/storeProfiler`;

			return url + ( flags ? `?flags=${ flags }` : '' );
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepName );
			const logInUrl = getStartUrl();
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';

			switch ( _currentStepName ) {
				case 'domains':
					recordTracksEvent( 'calypso_signup_plan_select', {
						product_slug: selectedPlan,
						from_section: 'default',
					} );

					setPlanCartItem( { product_slug: selectedPlan } );
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					// Coming from setThemeStep
					if ( providedDependencies?.selectedDesign ) {
						return navigate( 'storeAddress' );
					}

					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigate( 'setThemeStep' );
					}

					if ( providedDependencies?.siteSlug ) {
						const destination = `/setup/${ flowName }/checkPlan?siteSlug=${ siteSlug }&flags=signup/tailored-ecommerce`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( siteSlug );
						setSignupCompleteFlowName( flowName );

						// The site is coming from the checkout already Atomic (and with the new URL)
						// There's probably a better way of handling this change
						const urlParams = new URLSearchParams( {
							theme: selectedDesign?.slug || '',
							siteSlug: siteSlug.replace( '.wordpress.com', '.wpcomstaging.com' ),
							flags: 'signup/tailored-ecommerce',
						} );

						const returnUrl = encodeURIComponent( `/setup/${ flowName }/checkPlan?${ urlParams }` );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					return navigate( `checkPlan?siteSlug=${ siteSlug }` );

				case 'intro':
					resetOnboardStore();
					if ( userIsLoggedIn ) {
						return navigate( 'storeProfiler' );
					}
					return window.location.assign( logInUrl );

				case 'storeProfiler':
					return navigate( 'designCarousel' );

				case 'storeAddress':
					return window.location.assign( `${ site?.URL }/wp-admin/admin.php?page=wc-admin` );

				case 'designCarousel':
					return navigate( 'domains' );

				case 'setThemeStep':
					return navigate( 'processing' );

				case 'waitForAtomic':
					return navigate( 'processing' );

				case 'checkPlan':
					// eCommerce Plan
					if (
						[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_MONTHLY ].includes(
							( providedDependencies?.currentPlan as SiteDetailsPlan )?.product_slug
						)
					) {
						return navigate( 'waitForAtomic' );
					}

					// Not eCommerce Plan
					return window.location.assign( `/setup/site-setup/goals?siteSlug=${ siteSlug }` );
			}
			return providedDependencies;
		}

		const goBack = () => {
			switch ( _currentStepName ) {
				case 'designCarousel':
					return navigate( 'storeProfiler' );
				case 'storeAddress':
					return navigate( 'designCarousel' );
				default:
					return navigate( 'intro' );
			}
		};

		const goNext = () => {
			switch ( _currentStepName ) {
				case 'intro':
					return navigate( 'storeProfiler' );
				case 'storeProfiler':
					return navigate( 'designCarousel' );
				case 'storeAddress':
					return window.location.assign( `${ site?.URL }/wp-admin/admin.php?page=wc-admin` );
				case 'designCarousel':
					return navigate( 'domains' );
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
