import {
	addProductsToCart,
	clearStepPersistedState,
	LAUNCH_SITE_FLOW,
} from '@automattic/onboarding';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	supportsPrivacyProtectionPurchase,
	updatePrivacyForDomain,
} from 'calypso/lib/cart-values/cart-items';
import {
	getLaunchCheckoutUrl,
	getLaunchDestination,
	getLaunchReturnUrl,
	type LaunchParams,
} from 'calypso/lib/site-launch/destination';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors/get-products-list';
import { STEPS } from '../../internals/steps';
import { getLaunchSiteSteps } from './get-launch-site-steps';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

// Mirrors the event legacy signup records when it auto-skips a step, keyed by the legacy step names.
function recordExcludedStep( step: 'domains-launch' | 'plans-launch', value: string ) {
	recordTracksEvent( 'calypso_signup_actions_exclude_step', {
		flow: LAUNCH_SITE_FLOW,
		step,
		value,
	} );
}

// `initialize` runs once per page load; navigation needs to know which of the optional steps it kept.
let flowStepSlugs: string[] = [];

async function initialize() {
	const siteSlug = getCurrentQueryParams().get( 'siteSlug' );
	const site = siteSlug
		? await resolveSelect( SITE_STORE )
				.getSite( siteSlug )
				.catch( () => undefined )
		: undefined;

	if ( ! site ) {
		window.location.assign( '/sites' );
		return false;
	}

	const domains: { domain: string; wpcom_domain: boolean }[] | undefined = await resolveSelect(
		SITE_STORE
	).getSiteDomains( site.ID );
	const steps = getLaunchSiteSteps( site, domains );

	flowStepSlugs = steps.map( ( step ) => step.slug );

	if ( ! flowStepSlugs.includes( STEPS.DOMAIN_SEARCH.slug ) ) {
		recordExcludedStep(
			'domains-launch',
			( domains ?? [] )
				.filter( ( domain ) => ! domain.wpcom_domain )
				.map( ( domain ) => domain.domain )
				.join( ', ' )
		);
	}

	if ( ! flowStepSlugs.includes( STEPS.UNIFIED_PLANS.slug ) ) {
		recordExcludedStep( 'plans-launch', site.plan?.product_slug ?? '' );
	}

	return stepsWithRequiredLogin( steps );
}

function useLaunchParams(): LaunchParams {
	const query = useQuery();

	return {
		siteSlug: query.get( 'siteSlug' ) ?? '',
		backTo: query.get( 'back_to' ),
		redirectTo: query.get( 'redirect_to' ),
		ref: query.get( 'ref' ),
		coupon: query.get( 'coupon' ),
		dashboard: query.get( 'dashboard' ),
	};
}

const launchSiteFlow: FlowV2< typeof initialize > = {
	name: LAUNCH_SITE_FLOW,
	title: __( 'Launch your site' ),
	isSignupFlow: false,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useSideEffect( currentStepSlug ) {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE ) as OnboardActions;

		useQueryProductsList();

		// Only at the flow root: a mid-flow refresh must keep the user's selections.
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				clearStepPersistedState( LAUNCH_SITE_FLOW );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();
			}
		}, [ currentStepSlug, resetOnboardStore ] );
	},

	useStepsProps() {
		const launchParams = useLaunchParams();
		const isPlansFirstStep = ! flowStepSlugs.includes( STEPS.DOMAIN_SEARCH.slug );

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				isInSignup: true,
				isLaunchPage: true,
				isCustomDomainAllowedOnFreePlan: true,
				deemphasizeFreePlan: true,
				...( isPlansFirstStep && {
					wrapperProps: {
						goBack: () => window.location.assign( getLaunchReturnUrl( launchParams ) ),
					},
				} ),
			},
		};
	},

	useStepNavigation( currentStepSlug, navigate ) {
		const launchParams = useLaunchParams();
		const productsList = useSelector( getProductsList );
		const { getDomainCartItems, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setDomainCartItems, setPlanCartItem, setSignupDomainOrigin } = useDispatch(
			ONBOARD_STORE
		) as OnboardActions;

		const goPastDomains = () => {
			return navigate(
				flowStepSlugs.includes( STEPS.UNIFIED_PLANS.slug )
					? STEPS.UNIFIED_PLANS.slug
					: STEPS.LAUNCH_SITE.slug
			);
		};

		const addPrivacyIfSupported = ( item: MinimalRequestCartProduct ) =>
			supportsPrivacyProtectionPurchase( item.product_slug, Object.values( productsList ?? {} ) )
				? updatePrivacyForDomain( item, true )
				: item;

		const finishLaunch = async () => {
			const planCartItem = getPlanCartItem();
			const cartItems = [
				...( getDomainCartItems() ?? [] ),
				...( planCartItem ? [ planCartItem ] : [] ),
			].map( addPrivacyIfSupported );
			const destination = getLaunchDestination( launchParams );

			if ( cartItems.length === 0 ) {
				return window.location.assign( destination );
			}

			await addProductsToCart( launchParams.siteSlug, LAUNCH_SITE_FLOW, cartItems );

			// Checkout reads these to send the user on once they have paid.
			persistSignupDestination( destination );
			setSignupCompleteSlug( launchParams.siteSlug );
			setSignupCompleteFlowName( LAUNCH_SITE_FLOW );

			return window.location.assign( getLaunchCheckoutUrl( launchParams ) );
		};

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( providedDependencies?.navigateToUseMyDomain ) {
						const useMyDomainURL = addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
							...getQueryArgs( window.location.href ),
							step: 'domain-input',
							...( providedDependencies.lastQuery !== undefined && {
								initialQuery: providedDependencies.lastQuery,
							} ),
						} );

						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

					setDomainCartItems( providedDependencies?.domainCart ?? [] );
					setSignupDomainOrigin( providedDependencies?.signupDomainOrigin );

					return goPastDomains();
				}

				case STEPS.USE_MY_DOMAIN.slug: {
					if ( providedDependencies && 'mode' in providedDependencies ) {
						const destination = addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );

						return navigate( destination as typeof currentStepSlug );
					}

					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setDomainCartItems( [ providedDependencies.domainCartItem ] );
					}

					return goPastDomains();
				}

				case STEPS.UNIFIED_PLANS.slug: {
					setPlanCartItem( providedDependencies?.cartItems?.[ 0 ] ?? null );

					return navigate( STEPS.LAUNCH_SITE.slug );
				}

				case STEPS.LAUNCH_SITE.slug:
					return finishLaunch();
			}
		};

		return { submit };
	},
};

export default launchSiteFlow;
