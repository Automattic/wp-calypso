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
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
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
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors/get-products-list';
import { STEPS } from '../../internals/steps';
import { getLaunchSiteSteps } from './get-launch-site-steps';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { OnboardActions, OnboardSelect, SiteSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { Store } from 'redux';

// Mirrors the event legacy signup records when it auto-skips a step, keyed by the legacy step names.
function recordExcludedStep( step: 'domains-launch' | 'plans-launch', value: string ) {
	recordTracksEvent( 'calypso_signup_actions_exclude_step', {
		flow: LAUNCH_SITE_FLOW,
		step,
		value,
	} );
}

async function initialize( reduxStore: Store ) {
	// Logged-out users are sent to log in, which comes back with a page load that runs this again.
	if ( ! isUserLoggedIn( reduxStore.getState() ) ) {
		return stepsWithRequiredLogin( getLaunchSiteSteps( null, null ) );
	}

	const siteSlug = getCurrentQueryParams().get( 'siteSlug' );
	const site = siteSlug
		? await resolveSelect( SITE_STORE )
				.getSite( siteSlug )
				.catch( () => undefined )
		: undefined;

	if ( ! site ) {
		window.location.replace( '/sites' );
		return false;
	}

	// Unknown domains keep the domain step.
	const domains: { domain: string; wpcom_domain: boolean }[] | null | undefined =
		await resolveSelect( SITE_STORE )
			.getSiteDomains( site.ID )
			.catch( () => null );
	const steps = getLaunchSiteSteps( site, domains );

	if ( ! steps.includes( STEPS.DOMAIN_SEARCH ) ) {
		recordExcludedStep(
			'domains-launch',
			( domains ?? [] )
				.filter( ( domain ) => ! domain.wpcom_domain )
				.map( ( domain ) => domain.domain )
				.join( ', ' )
		);
	}

	if ( ! steps.includes( STEPS.UNIFIED_PLANS ) ) {
		recordExcludedStep( 'plans-launch', site.plan?.product_slug ?? '' );
	}

	return stepsWithRequiredLogin( steps );
}

/**
 * The slugs of the steps `initialize` kept. Stepper stores the resolved steps on the flow, although
 * their type mirrors `initialize`'s promise.
 */
function getStepSlugs( flow: FlowV2< typeof initialize > ): string[] {
	const steps: unknown = flow.getSteps?.();

	return Array.isArray( steps ) ? steps.map( ( step: { slug: string } ) => step.slug ) : [];
}

function getHostname( url: string | undefined ) {
	try {
		return url ? new URL( url ).hostname : undefined;
	} catch {
		return undefined;
	}
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
	// Records `calypso_signup_start`, as legacy signup did for this flow.
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: false,
	initialize,

	useLoginParams() {
		return { customLoginPath: '/log-in' };
	},

	useSideEffect( currentStepSlug ) {
		const { resetOnboardStore, setSiteUrl } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { siteSlug } = useLaunchParams();
		const siteUrl = useSelect(
			( select ) =>
				siteSlug ? ( select( SITE_STORE ) as SiteSelect ).getSite( siteSlug )?.URL : undefined,
			[ siteSlug ]
		);

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

		// The plans step names this address as the one a paid domain redirects to on the Free plan.
		// Legacy signup took it from the site, not from the domain picked.
		useEffect( () => {
			if ( ! currentStepSlug || ! siteSlug ) {
				return;
			}

			const siteHostname = getHostname( siteUrl ?? `https://${ siteSlug }` );

			if ( siteHostname ) {
				setSiteUrl( siteHostname );
			}
		}, [ currentStepSlug, siteSlug, siteUrl, setSiteUrl ] );
	},

	useStepsProps() {
		const launchParams = useLaunchParams();
		const isPlansFirstStep = ! getStepSlugs( this ).includes( STEPS.DOMAIN_SEARCH.slug );

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
		const stepSlugs = getStepSlugs( this );
		const productsList = useSelector( getProductsList );
		const recordSignupComplete = useRecordSignupComplete( LAUNCH_SITE_FLOW );
		const { getDomainCartItem, getDomainCartItems, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
				getDomainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setDomainCartItem, setDomainCartItems, setPlanCartItem, setSignupDomainOrigin } =
			useDispatch( ONBOARD_STORE ) as OnboardActions;

		const goPastDomains = () => {
			return navigate(
				stepSlugs.includes( STEPS.UNIFIED_PLANS.slug )
					? STEPS.UNIFIED_PLANS.slug
					: STEPS.LAUNCH_SITE.slug
			);
		};

		const addPrivacyIfSupported = ( item: MinimalRequestCartProduct ) =>
			supportsPrivacyProtectionPurchase( item.product_slug, Object.values( productsList ?? {} ) )
				? updatePrivacyForDomain( item, true )
				: item;

		const getDomainItems = () => {
			const domainCartItems = getDomainCartItems() ?? [];
			// Only the single domain item survives a refresh.
			const domainCartItem = getDomainCartItem();

			return domainCartItems.length > 0 || ! domainCartItem ? domainCartItems : [ domainCartItem ];
		};

		const getLaunchCartItems = () => {
			const planCartItem = getPlanCartItem();

			return [ ...getDomainItems(), ...( planCartItem ? [ planCartItem ] : [] ) ].map(
				addPrivacyIfSupported
			);
		};

		// The site is already live, so nothing here may keep the user from moving on.
		const finishLaunch = async () => {
			const destination = getLaunchDestination( launchParams );
			let cartItems: MinimalRequestCartProduct[] | null;

			try {
				cartItems = getLaunchCartItems();
			} catch {
				// Unknown contents: let checkout show whatever the cart already holds.
				cartItems = null;
			}

			try {
				recordSignupComplete( {} );
			} catch {
				// Analytics must not change where the user goes.
			}

			if ( cartItems?.length === 0 ) {
				return window.location.replace( destination );
			}

			try {
				if ( cartItems ) {
					await addProductsToCart( launchParams.siteSlug, LAUNCH_SITE_FLOW, cartItems );
				}
			} catch {
				// Checkout opens on whatever made it into the cart.
			}

			// Checkout reads these to send the user on once they have paid.
			persistSignupDestination( destination );
			setSignupCompleteSlug( launchParams.siteSlug );
			setSignupCompleteFlowName( LAUNCH_SITE_FLOW );

			return window.location.replace( getLaunchCheckoutUrl( launchParams ) );
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

					setDomainCartItem( providedDependencies?.domainItem );
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

					// Without a domain to buy, drop any picked earlier in the domain search.
					const domainCartItem =
						providedDependencies && 'domainCartItem' in providedDependencies
							? providedDependencies.domainCartItem
							: undefined;

					setDomainCartItem( domainCartItem );
					setDomainCartItems( domainCartItem ? [ domainCartItem ] : [] );

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
