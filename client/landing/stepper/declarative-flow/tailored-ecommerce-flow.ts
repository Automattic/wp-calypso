import { PLAN_ECOMMERCE, PLAN_ECOMMERCE_MONTHLY } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
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
import CheckPlan from './internals/steps-repository/check-plan';
import DesignCarousel from './internals/steps-repository/design-carousel';
import DomainsStep from './internals/steps-repository/domains';
import Intro from './internals/steps-repository/intro';
import ProcessingStep from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import StoreAddress from './internals/steps-repository/store-address';
import StoreProfiler from './internals/steps-repository/store-profiler';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { SiteDetailsPlan } from '@automattic/data-stores';

const ecommerceFlow: Flow = {
	name: ECOMMERCE_FLOW,
	useSteps() {
		const recurType = useSelect( ( select ) =>
			select( ONBOARD_STORE ).getEcommerceFlowRecurType()
		);

		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name, recur: recurType } );
			recordFullStoryEvent( 'calypso_signup_start_ecommerce', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'storeProfiler', component: StoreProfiler },
			{ slug: 'storeAddress', component: StoreAddress },
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'designCarousel', component: DesignCarousel },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'checkPlan', component: CheckPlan },
		];
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
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();

			if ( recurType !== ecommerceFlowRecurTypes.YEARLY ) {
				flowParams.set( 'recur', recurType );
				hasFlowParams = true;
			}
			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/ecommerce/storeProfiler` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );
			const url =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&redirect_to=${ redirectTarget }`
					: `/start/account/user?variationName=${ flowName }&redirect_to=${ redirectTarget }`;

			return url + ( flags ? `&flags=${ flags }` : '' );
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

					setPlanCartItem( {
						product_slug: selectedPlan,
						extra: { headstart_theme: selectedDesign?.recipe?.stylesheet },
					} );
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigate( 'storeAddress' );
					}

					if ( providedDependencies?.siteSlug ) {
						const destination = `/setup/${ flowName }/checkPlan?siteSlug=${ siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( siteSlug );
						setSignupCompleteFlowName( flowName );

						// The site is coming from the checkout already Atomic (and with the new URL)
						// There's probably a better way of handling this change
						const urlParams = new URLSearchParams( {
							theme: selectedDesign?.slug || '',
							siteSlug: siteSlug.replace( '.wordpress.com', '.wpcomstaging.com' ),
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

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default ecommerceFlow;
