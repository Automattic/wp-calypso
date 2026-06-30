import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import {
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_PAID_ONLY_FLOW,
	clearStepPersistedState,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { resolveSelect, useDispatch as useWpDataDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	persistSignupDestination,
	retrieveSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
	setSignupCompleteSlug,
	wasSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

const deletePage = async ( siteId: string | number, pageId: number ): Promise< boolean > => {
	try {
		await wpcom.req.post( {
			path: '/sites/' + siteId + '/pages/' + pageId,
			method: 'DELETE',
			apiNamespace: 'wp/v2',
		} );
		return true;
	} catch ( error ) {
		// fail silently here, just log an error and return false, Big Sky will still launch
		return false;
	}
};

function initialize() {
	// On a fresh start, clear stale signup-complete values so the create-site step doesn't
	// mistake them for an existing site. On a checkout re-entry (browser back from checkout), keep
	// them so create-site reuses the already-created site instead of creating a duplicate — see
	// `isManageSiteFlow` in the create-site step.
	const isCheckoutReEntry = Boolean(
		wasSignupCheckoutPageUnloaded() &&
			retrieveSignupDestination() &&
			getSignupCompleteFlowName() === AI_SITE_BUILDER_PAID_ONLY_FLOW
	);

	if ( ! isCheckoutReEntry ) {
		clearStepPersistedState( AI_SITE_BUILDER_PAID_ONLY_FLOW );
		clearSignupDestinationCookie();
		clearSignupCompleteFlowName();
		clearSignupCompleteSlug();
		clearSignupCompleteSiteID();
	}

	return stepsWithRequiredLogin( [
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.ERROR,
	] as const );
}

const aiSiteBuilderPaidOnly: FlowV2< typeof initialize > = {
	name: AI_SITE_BUILDER_PAID_ONLY_FLOW,
	/**
	 * Should it fire calypso_signup_start event?
	 */
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSideEffect() {
		const dispatch = useDispatch();
		const queryParams = useQuery();
		const siteId = queryParams.get( 'siteId' );
		const prompt = queryParams.get( 'prompt' );

		useEffect( () => {
			if ( siteId ) {
				dispatch( setSelectedSiteId( parseInt( siteId ) ) );
			}
		}, [ siteId, dispatch ] );

		useEffect( () => {
			if ( prompt && prompt.length > 0 ) {
				window.sessionStorage.setItem( 'stored_ai_prompt', prompt );
			}
		}, [ prompt ] );
	},
	initialize,
	useStepNavigation( _, navigate ) {
		const { setStaticHomepageOnSite, setIntentOnSite } = useWpDataDispatch( SITE_STORE );
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useWpDataDispatch( ONBOARD_STORE ) as OnboardActions;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);

		const { addBlogSticker } = useAddBlogStickerMutation( {
			onError: () => {
				// Fail silently - blog sticker addition is not essential for site creation
			},
		} );

		const queryParams = useQuery();

		// Resolve the AI prompt from the URL, falling back to the value stashed in sessionStorage
		// by useSideEffect. Clears the stored value once consumed.
		const resolvePrompt = (): string | null => {
			const promptFromQuery = queryParams.get( 'prompt' );
			if ( promptFromQuery ) {
				return promptFromQuery;
			}
			const storedPrompt = window.sessionStorage.getItem( 'stored_ai_prompt' );
			if ( storedPrompt ) {
				window.sessionStorage.removeItem( 'stored_ai_prompt' );
				return storedPrompt;
			}
			return null;
		};

		// Prepares the newly created site for Big Sky (intent + home page) and returns its URL.
		const setupBigSkySite = async (
			siteId: string | number,
			siteSlug: string
		): Promise< string | null > => {
			// Runs independently; errors are handled by the mutation's onError callback.
			addBlogSticker( siteId, 'big-sky-free-trial' );

			const pendingActions = [
				resolveSelect( SITE_STORE ).getSite( siteId ), // To get the URL.
				wpcom.req.post(
					{
						path: '/sites/' + siteId + '/pages',
						apiNamespace: 'wp/v2',
					},
					{},
					{
						title: 'Home',
						status: 'publish',
						content: '<!-- wp:paragraph -->\n<p>Hello world!</p>\n<!-- /wp:paragraph -->',
					}
				),
				deletePage( siteId, 1 ),
				setIntentOnSite( siteSlug, SiteIntent.AIAssembler ),
			];

			// Execute operations individually to identify which one fails.
			const results = [];
			try {
				for ( let i = 0; i < pendingActions.length; i++ ) {
					const result = await pendingActions[ i ];
					results.push( result );
				}
			} catch ( error ) {
				return null;
			}

			const siteData = results[ 0 ];
			if ( ! siteData || ! siteData.URL ) {
				return null;
			}

			const pageCreationResult = results[ 1 ];
			if ( pageCreationResult && pageCreationResult.id ) {
				await setStaticHomepageOnSite( siteId, pageCreationResult.id );
			}

			return siteData.URL;
		};

		const submit: SubmitHandler< typeof initialize > = async function ( submittedStep ) {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains': {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}
					if ( providedDependencies.navigateToUseMyDomain ) {
						throw new Error( 'Navigation to use my domain is not supported for this flow' );
					}

					// The site does not exist yet, so stash the domain selection in the onboard store;
					// the create-site step adds it to the cart.
					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigate( 'plans' );
				}

				case 'plans': {
					const [ pickedPlan, ...extraProducts ] = providedDependencies.cartItems ?? [];
					if ( ! pickedPlan ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( pickedPlan );
					setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );
					setSignupCompleteFlowName( AI_SITE_BUILDER_PAID_ONLY_FLOW );

					return navigate( 'create-site' );
				}

				// The create-site step starts creating the site (with the plan + domain in the cart)
				// and adds the promise of that operation to the store's pendingAction field.
				case 'create-site': {
					// Drop create-site from history so back from processing doesn't recreate the site.
					return navigate( 'processing', undefined, true );
				}

				case 'processing': {
					if ( providedDependencies.processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					// Browser-back to processing after the checkout page unloaded leaves no in-memory
					// pending action, so the step reports NO_ACTION. Resume on the site's plans page
					// rather than stalling on an empty processing screen.
					if ( providedDependencies.processingResult === ProcessingResult.NO_ACTION ) {
						const reentrySiteSlug = getSignupCompleteSlug();
						if ( reentrySiteSlug ) {
							window.location.assign( `/plans/${ reentrySiteSlug }` );
						}
						return;
					}

					if (
						providedDependencies.processingResult !== ProcessingResult.SUCCESS ||
						! providedDependencies.siteCreated ||
						! providedDependencies.goToCheckout
					) {
						return;
					}

					// The "manage site" re-entry path (browser back from checkout) returns siteSlug but
					// not siteId, so fall back to the values persisted at checkout setup.
					const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
					const siteSlug = providedDependencies.siteSlug || getSignupCompleteSlug();
					if ( ! siteId || ! siteSlug ) {
						return;
					}

					const siteURL = await setupBigSkySite( siteId, siteSlug );
					if ( ! siteURL ) {
						return;
					}

					const prompt = resolvePrompt();
					const source = queryParams.get( 'source' );
					const specId = queryParams.get( 'spec_id' );

					const specDestination = addQueryArgs( `${ siteURL }/wp-admin/site-editor.php`, {
						canvas: 'edit',
						'ai-step': 'spec',
						referrer: AI_SITE_BUILDER_FLOW,
						checkout: 'success',
						...( prompt && { prompt } ),
						...( source && { source } ),
						...( specId && { spec_id: specId } ),
					} );

					// Business and Commerce purchases trigger an Atomic transfer. Wait for it to finish
					// (via transferring-hosted-site) before handing off to Big Sky, so the user doesn't
					// land in wp-admin while the site is still transferring. Simple plans
					// (Personal/Premium) go straight to the Site Spec.
					const planSlug = planCartItem?.product_slug ?? '';
					const needsAtomicTransferWait = isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
					const redirectAfterCheckout = needsAtomicTransferWait
						? addQueryArgs( '/setup/transferring-hosted-site', {
								siteId: String( siteId ),
								siteSlug,
								redirect_to: specDestination,
						  } )
						: specDestination;

					persistSignupDestination( redirectAfterCheckout );
					setSignupCompleteSlug( siteSlug );
					setSignupCompleteSiteID( String( siteId ) );
					setSignupCompleteFlowName( AI_SITE_BUILDER_PAID_ONLY_FLOW );

					// Intentionally no checkoutBackUrl: it is allowlisted against the site's own host, so
					// pointing it at the editor would let a user cancel checkout and land in Big Sky
					// without paying. An explicit cancel_to to the plans page keeps them in
					// the paid funnel instead.
					window.location.assign(
						addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
							redirect_to: redirectAfterCheckout,
							cancel_to: `/plans/${ siteSlug }`,
							signup: 1,
							'big-sky-checkout': 1,
						} )
					);
					return;
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default aiSiteBuilderPaidOnly;
