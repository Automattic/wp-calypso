import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
} from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSite } from '../hooks/use-site';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import CheckPlan from './internals/steps-repository/check-plan';
import DesignCarousel from './internals/steps-repository/design-carousel';
import DomainsStep from './internals/steps-repository/domains';
import ProcessingStep from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import StoreProfiler from './internals/steps-repository/store-profiler';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import WaitForPluginInstall from './internals/steps-repository/wait-for-plugin-install';
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
			return PLAN_ECOMMERCE_MONTHLY;
	}
}

const ecommerceFlow: Flow = {
	name: ECOMMERCE_FLOW,
	useSteps() {
		const recurType = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getEcommerceFlowRecurType(),
			[]
		);

		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name, recur: recurType } );
		}, [] );

		return [
			{ slug: 'storeProfiler', component: StoreProfiler },
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'designCarousel', component: DesignCarousel },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'waitForPluginInstall', component: WaitForPluginInstall },
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'checkPlan', component: CheckPlan },
		];
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const flags = new URLSearchParams( window.location.search ).get( 'flags' );
		const flowName = this.name;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const { recurType } = useSelect(
			( select ) => ( {
				recurType: ( select( ONBOARD_STORE ) as OnboardSelect ).getEcommerceFlowRecurType(),
			} ),
			[]
		);

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
			const logInUrl = getLoginUrl( {
				variationName: flowName,
				redirectTo: redirectTarget,
				locale,
			} );

			return logInUrl + ( flags ? `&flags=${ flags }` : '' );
		};

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/blog/blogger-intent route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/blog/<locale> starting points and /setup/blog/blogger-intent/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'store-setup requires a logged in user',
			};
		}

		return result;
	},

	useStepNavigation( _currentStepName, navigate ) {
		const flowName = this.name;
		const { setStepProgress, setPlanCartItem, setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		setPluginsToVerify( [ 'woocommerce' ] );
		const flowProgress = useFlowProgress( { stepName: _currentStepName, flowName } );
		setStepProgress( flowProgress );
		const { selectedDesign, recurType } = useSelect(
			( select ) => ( {
				selectedDesign: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
				recurType: ( select( ONBOARD_STORE ) as OnboardSelect ).getEcommerceFlowRecurType(),
			} ),
			[]
		);
		const selectedPlan = getPlanFromRecurType( recurType );

		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepName );
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
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
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

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
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
