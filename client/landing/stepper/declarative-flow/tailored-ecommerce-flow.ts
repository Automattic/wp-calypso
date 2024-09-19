import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import { ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSite } from '../hooks/use-site';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import getQuantityFromStorageType from '../utils/get-quantity-from-storage-slug';
import { STEPS } from './internals/steps';
import { AssertConditionState } from './internals/types';
import type { Flow, ProvidedDependencies, AssertConditionResult } from './internals/types';
import type {
	OnboardSelect,
	SiteDetailsPlan,
	SiteSelect,
	UserSelect,
} from '@automattic/data-stores';

function getPlanFromRecurType( recurType: string ) {
	switch ( recurType ) {
		case ecommerceFlowRecurTypes.YEARLY:
			return PLAN_ECOMMERCE;
		case ecommerceFlowRecurTypes.MONTHLY:
			return PLAN_ECOMMERCE_MONTHLY;
		case ecommerceFlowRecurTypes[ '2Y' ]:
			return PLAN_ECOMMERCE_2_YEARS;
		case ecommerceFlowRecurTypes[ '3Y' ]:
			return PLAN_ECOMMERCE_3_YEARS;
		default:
			return PLAN_ECOMMERCE;
	}
}

const ecommerceFlow: Flow = {
	name: ECOMMERCE_FLOW,
	isSignupFlow: true,
	useSignupStartEventProps() {
		const recur = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getEcommerceFlowRecurType(),
			[]
		);

		return { recur };
	},
	useSteps() {
		const steps = [
			{
				slug: 'storeProfiler',
				asyncComponent: () => import( './internals/steps-repository/store-profiler' ),
			},
			STEPS.DOMAINS,
			{
				slug: 'designCarousel',
				asyncComponent: () => import( './internals/steps-repository/design-carousel' ),
			},
			{
				// Note: the slug for STEPS.SITE_CREATION_STEP is 'create-site'
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			STEPS.PROCESSING,
			STEPS.WAIT_FOR_PLUGIN_INSTALL,
			STEPS.WAIT_FOR_ATOMIC,
			{
				slug: 'checkPlan',
				asyncComponent: () => import( './internals/steps-repository/check-plan' ),
			},
		];

		return stepsWithRequiredLogin( steps );
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'ecommerce requires a logged in user',
			};
		}

		return result;
	},

	useStepNavigation( _currentStepName, navigate ) {
		const flowName = this.name;
		const {
			setPlanCartItem,
			setProductCartItems,
			setPluginsToVerify,
			resetCouponCode,
			resetStorageAddonSlug,
		} = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const recurType = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getEcommerceFlowRecurType(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);
		const storageAddonSlug = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStorageAddonSlug(),
			[]
		);
		const selectedPlan = getPlanFromRecurType( recurType );

		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );

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

					if ( storageAddonSlug && recurType !== ecommerceFlowRecurTypes.MONTHLY ) {
						setProductCartItems( [
							{
								product_slug: PRODUCT_1GB_SPACE,
								quantity: getQuantityFromStorageType( storageAddonSlug ),
								volume: 1,
								extra: { feature_slug: storageAddonSlug },
							},
						] );
						resetStorageAddonSlug();
					}
					return navigate( 'createSite' );

				case 'createSite':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.finishedWaitingForAtomic ) {
						return navigate( 'waitForPluginInstall', { siteId, siteSlug } );
					}

					if ( providedDependencies?.pluginsInstalled ) {
						return window.location.assign( `${ site?.URL }/wp-admin/admin.php?page=wc-admin` );
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
						const couponCodeParam = couponCode ? `coupon=${ couponCode }` : '';
						resetCouponCode();

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1&${ couponCodeParam }`
						);
					}
					return navigate( `checkPlan?siteSlug=${ siteSlug }` );

				case 'storeProfiler':
					return navigate( 'designCarousel' );

				case 'designCarousel':
					return navigate( 'domains' );

				case 'waitForAtomic':
					return navigate( 'processing' );

				case 'waitForPluginInstall':
					return navigate( 'processing' );

				case 'checkPlan':
					// eCommerce Plan
					if (
						[
							PLAN_ECOMMERCE,
							PLAN_ECOMMERCE_MONTHLY,
							PLAN_ECOMMERCE_2_YEARS,
							PLAN_ECOMMERCE_3_YEARS,
						].includes( ( providedDependencies?.currentPlan as SiteDetailsPlan )?.product_slug )
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
					return navigate( 'storeProfiler' );
			}
		};

		const goNext = () => {
			switch ( _currentStepName ) {
				case 'storeProfiler':
					return navigate( 'designCarousel' );
				case 'designCarousel':
					return navigate( 'domains' );
				default:
					return navigate( 'storeProfiler' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default ecommerceFlow;
