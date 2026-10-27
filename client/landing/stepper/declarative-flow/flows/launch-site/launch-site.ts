import { DomainProductSlugs, fetchShoppingCart, launchSite } from '@automattic/api-core';
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
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';
import { getSingleMappingDomain } from 'calypso/landing/stepper/utils/get-single-mapping-domain';
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
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { getLaunchSiteSteps } from './get-launch-site-steps';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { OnboardActions, OnboardSelect, SiteSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type { Store } from 'redux';

// The cart endpoint occasionally leaves a request unanswered while asking again succeeds at once,
// so `findCartKeyFromSiteSlug` makes short attempts. The user waits on the processing screen.
const CART_READ_ATTEMPTS = 3;
const CART_READ_ATTEMPT_TIMEOUT_MS = 1000;

// The site's cart, or null when it doesn't answer in time.
function readCart( siteId: number ): Promise< ResponseCart | null > {
	let timer: ReturnType< typeof setTimeout > | undefined;
	const timeout = new Promise< null >( ( resolve ) => {
		timer = setTimeout( () => resolve( null ), CART_READ_ATTEMPT_TIMEOUT_MS );
	} );

	return Promise.race( [ fetchShoppingCart( siteId ), timeout ] ).finally( () =>
		clearTimeout( timer )
	);
}

/**
 * The connection for `domain` as the site's cart holds it, or null. Adding to the cart swallows its
 * own failures, so this reads back the cart checkout will open, which is keyed by site ID.
 */
async function findMappingInCart( siteId: number, domain: string ): Promise< string | null > {
	try {
		for ( let attempt = 1; attempt <= CART_READ_ATTEMPTS; attempt++ ) {
			const cart = await readCart( siteId );

			if ( cart ) {
				const mapping = cart.products.find(
					( product ) =>
						product.product_slug === DomainProductSlugs.DOMAIN_MAPPING &&
						product.meta.toLowerCase() === domain.toLowerCase()
				);

				return mapping?.meta ?? null;
			}
		}
	} catch {
		// An error answer, unlike silence, won't change by asking again.
	}

	return null;
}

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
	const siteSlug = query.get( 'siteSlug' ) ?? '';
	const siteUrl = useSelect(
		( select ) =>
			siteSlug ? ( select( SITE_STORE ) as SiteSelect ).getSite( siteSlug )?.URL : undefined,
		[ siteSlug ]
	);

	return {
		siteSlug,
		siteUrl,
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
		const { siteSlug, siteUrl } = useLaunchParams();

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
		const { getDomainCartItem, getDomainCartItems, getPlanCartItem, getProductCartItems } =
			useSelect(
				( select ) => ( {
					getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
					getDomainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems,
					getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
					getProductCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getProductCartItems,
				} ),
				[]
			);
		const {
			setDomainCartItem,
			setDomainCartItems,
			setPendingAction,
			setPlanCartItem,
			setProductCartItems,
			setProgressTitle,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const siteId = useSelect(
			( select ) =>
				launchParams.siteSlug
					? ( select( SITE_STORE ) as SiteSelect ).getSite( launchParams.siteSlug )?.ID
					: undefined,
			[ launchParams.siteSlug ]
		);

		// The processing step runs the launch and submits its result.
		const launch = () => {
			setProgressTitle( __( 'Your site will be live shortly.' ) );
			setPendingAction( async () => {
				if ( ! siteId ) {
					throw new Error( 'Unknown site' );
				}

				await launchSite( siteId );

				return { siteSlug: launchParams.siteSlug };
			} );

			return navigate( STEPS.PROCESSING.slug );
		};

		const goPastDomains = () => {
			return stepSlugs.includes( STEPS.UNIFIED_PLANS.slug )
				? navigate( STEPS.UNIFIED_PLANS.slug )
				: launch();
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

		// The onboarding store is shared with other flows and survives a visit that skips this flow's
		// root, so only pick up what this flow's own steps could have chosen.
		const getLaunchDomainItems = () =>
			stepSlugs.includes( STEPS.DOMAIN_SEARCH.slug ) ? getDomainItems() : [];

		const getLaunchCartItems = () => {
			const domainItems = getLaunchDomainItems();
			const hasPlansStep = stepSlugs.includes( STEPS.UNIFIED_PLANS.slug );
			const planCartItem = hasPlansStep ? getPlanCartItem() : null;
			const productCartItems = hasPlansStep ? ( getProductCartItems() ?? [] ) : [];

			return [
				...domainItems.map( addPrivacyIfSupported ),
				...( planCartItem ? [ planCartItem ] : [] ),
				...productCartItems,
			];
		};

		// The site is already live, so nothing here may keep the user from moving on.
		const finishLaunch = async () => {
			const launchDestination = getLaunchDestination( launchParams );
			let cartItems: MinimalRequestCartProduct[] | null;
			let mappingDomain: string | null = null;

			try {
				cartItems = getLaunchCartItems();
				mappingDomain = getSingleMappingDomain( getLaunchDomainItems() );
			} catch {
				// Unknown contents: let checkout show whatever the cart already holds.
				cartItems = null;
			}

			if ( cartItems?.length === 0 ) {
				return window.location.replace( launchDestination );
			}

			try {
				if ( cartItems ) {
					await addProductsToCart( launchParams.siteSlug, LAUNCH_SITE_FLOW, cartItems );
				}
			} catch {
				// Checkout opens on whatever made it into the cart.
			}

			// A connected domain still has to be pointed at the site once it is paid for, but only
			// send the user to its setup when the connection really is in the cart.
			const connectedDomain =
				mappingDomain && siteId ? await findMappingInCart( siteId, mappingDomain ) : null;
			const destination = connectedDomain
				? buildDashboardLink( 'dotcom', `/domains/${ connectedDomain }/domain-connection-setup` )
				: launchDestination;

			// Checkout reads these to send the user on once they have paid. A later checkout without a
			// `redirect_to` falls back to the cookie, and paying clears it only when it matches the
			// destination. The connection setup needs no fallback, so drop the cookie rather than leave
			// one behind for a later purchase to land on.
			if ( connectedDomain ) {
				clearSignupDestinationCookie();
			} else {
				persistSignupDestination( launchDestination );
			}
			setSignupCompleteSlug( launchParams.siteSlug );
			setSignupCompleteFlowName( LAUNCH_SITE_FLOW );

			return window.location.replace( getLaunchCheckoutUrl( launchParams, destination ) );
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
					const [ planCartItem, ...productCartItems ] = providedDependencies?.cartItems ?? [];

					setPlanCartItem( planCartItem ?? null );
					// Storage add-ons picked alongside the plan.
					setProductCartItems( productCartItems );

					return launch();
				}

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies?.processingResult === ProcessingResult.FAILURE ) {
						return navigate( STEPS.ERROR.slug );
					}

					// Nothing was queued: the flow started here (no domain or plan step) or was refreshed.
					if ( providedDependencies?.processingResult === ProcessingResult.NO_ACTION ) {
						return launch();
					}

					return finishLaunch();
				}
			}
		};

		// Explicit rather than `history.back()`, so Back works the same when the user lands on a
		// use-my-domain screen directly or after a refresh.
		const goBack = () => {
			switch ( currentStepSlug ) {
				case STEPS.USE_MY_DOMAIN.slug: {
					const mode = getQueryArgs( window.location.href ).step;

					if ( mode === useMyDomainInputMode.transferOrConnect ) {
						return navigate(
							addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
								step: useMyDomainInputMode.domainInput,
							} ) as typeof currentStepSlug
						);
					}

					if ( mode && mode !== useMyDomainInputMode.domainInput ) {
						return navigate(
							addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
								step: useMyDomainInputMode.transferOrConnect,
							} ) as typeof currentStepSlug
						);
					}

					return navigate( STEPS.DOMAIN_SEARCH.slug );
				}

				case STEPS.UNIFIED_PLANS.slug:
					return navigate( STEPS.DOMAIN_SEARCH.slug );
			}
		};

		return { submit, goBack };
	},
};

export default launchSiteFlow;
