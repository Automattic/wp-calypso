import config from '@automattic/calypso-config';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import {
	addProductsToCart,
	AI_SITE_BUILDER_FLOW,
	clearStepPersistedState,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { resolveSelect, useDispatch as useWpDataDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { AI_SITE_BUILDER_PAID_ONLY_FLAG } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
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

/**
 * The Site Spec step (CIAB mode) re-enters this flow with `create_garden_site` /
 * `early_created_site` to finish provisioning a garden site. That path must keep the
 * legacy behavior even when the paid-only flag is on, so it is excluded from the paid flow.
 */
function isCiabReentry( params: URLSearchParams ): boolean {
	return params.has( 'create_garden_site' ) || params.has( 'early_created_site' );
}

function isPaidOnlyEntry( params: URLSearchParams ): boolean {
	return config.isEnabled( AI_SITE_BUILDER_PAID_ONLY_FLAG ) && ! isCiabReentry( params );
}

function initialize() {
	// stepsWithRequiredLogin will take care of redirecting to the login step if the user is not logged in.
	if ( isPaidOnlyEntry( getCurrentQueryParams() ) ) {
		// Start from a clean slate so a stale signup-complete cookie from a previous run
		// doesn't make the create-site step skip site creation.
		clearStepPersistedState( AI_SITE_BUILDER_FLOW );
		clearSignupDestinationCookie();
		clearSignupCompleteFlowName();
		clearSignupCompleteSlug();
		clearSignupCompleteSiteID();

		return stepsWithRequiredLogin( [
			STEPS.DOMAIN_SEARCH,
			STEPS.UNIFIED_PLANS,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.ERROR,
		] as const );
	}

	return stepsWithRequiredLogin( [
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.ERROR,
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_LAUNCH,
		STEPS.PROCESSING,
	] as const );
}

const aiSiteBuilder: FlowV2< typeof initialize > = {
	name: AI_SITE_BUILDER_FLOW,
	/**
	 * Should it fire calypso_signup_start event?
	 */
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSideEffect() {
		const dispatch = useDispatch();
		const { setGardenName, setGardenPartnerName } = useWpDataDispatch( ONBOARD_STORE );
		const queryParams = useQuery();
		const siteId = queryParams.get( 'siteId' );
		const prompt = queryParams.get( 'prompt' );
		const createGardenSite = queryParams.get( 'create_garden_site' );

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

		useEffect( () => {
			// Set the garden values based on the query parameter
			// The parameter should be exactly "1" to enable garden site creation
			if ( createGardenSite === '1' ) {
				setGardenName( 'commerce' );
				setGardenPartnerName( 'woo' );
			} else {
				setGardenName( null );
				setGardenPartnerName( null );
			}
		}, [ createGardenSite, setGardenName, setGardenPartnerName ] );
	},
	initialize,
	useStepNavigation( _, navigate ) {
		const { siteSlug: siteSlugFromSiteData, siteId: siteIdFromSiteData } = useSiteData();
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
		const { gardenName, planCartItem } = useSelect(
			( select ) => ( {
				gardenName: ( select( ONBOARD_STORE ) as any ).getGardenName(),
				gardenPartnerName: ( select( ONBOARD_STORE ) as any ).getGardenPartnerName(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			} ),
			[]
		);

		const { addBlogSticker } = useAddBlogStickerMutation( {
			onError: () => {
				// Fail silently - blog sticker addition is not essential for site creation
			},
		} );

		const queryParams = useQuery();
		const isPaid = isPaidOnlyEntry( queryParams );

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

		// Prepares the newly created site for Big Sky (intent, home page) and returns its URL.
		// In the paid flow gardenName is always null, so the non-garden branches run as today.
		const setupBigSkySite = async (
			siteId: string | number,
			siteSlug: string
		): Promise< string | null > => {
			const pendingActions = [
				resolveSelect( SITE_STORE ).getSite( siteId ), // To get the URL.
			];

			if ( ! gardenName ) {
				// Add blog sticker - this runs independently and errors are handled by the mutation's onError callback (only for non-garden sites)
				addBlogSticker( siteId, 'big-sky-free-trial' );

				// Create a new home page if one is not set yet (only for non-garden sites)
				pendingActions.push(
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
					)
				);

				pendingActions.push( deletePage( siteId || '', 1 ) );
			}
			pendingActions.push( setIntentOnSite( siteSlug, SiteIntent.AIAssembler ) );

			// Execute operations individually to identify which one fails
			const results = [];
			try {
				for ( let i = 0; i < pendingActions.length; i++ ) {
					const result = await pendingActions[ i ];
					results.push( result );
				}
			} catch ( error ) {
				return null;
			}

			// Defensive check for site data (always first)
			const siteData = results[ 0 ];
			if ( ! siteData || ! siteData.URL ) {
				return null;
			}

			// Handle page creation result (only exists for non-garden sites)
			if ( ! gardenName && results.length > 1 ) {
				const pageCreationResult = results[ 1 ];
				if ( pageCreationResult && pageCreationResult.id ) {
					await setStaticHomepageOnSite( siteId, pageCreationResult.id );
				}
			}

			return siteData.URL;
		};

		const goToCheckout = async () => {
			const site = await resolveSelect( SITE_STORE ).getSite( siteIdFromSiteData );
			const bigSkyUrl = `${ site.URL }/wp-admin/site-editor.php?canvas=edit&p=%2F`;
			const siteLaunchUrl = addQueryArgs( '/setup/ai-site-builder/site-launch', {
				siteId: siteIdFromSiteData,
				checkout: 'success',
			} );
			window.location.assign(
				addQueryArgs( `/checkout/${ encodeURIComponent( siteSlugFromSiteData || '' ) }`, {
					redirect_to:
						queryParams.get( 'redirect' ) === 'site-launch'
							? siteLaunchUrl
							: addQueryArgs( bigSkyUrl, {
									checkout: 'success',
							  } ),
					checkoutBackUrl: addQueryArgs( bigSkyUrl, {
						checkout: 'cancel',
					} ),
					signup: 1,
					'big-sky-checkout': 1,
				} )
			);
		};

		const submit: SubmitHandler< typeof initialize > = async function ( submittedStep ) {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				// The create-site step will start creating a site and will add the promise of that operation to pendingAction field in the store.
				case 'create-site': {
					// Go to the processing step and pass `true` to remove it from history. So clicking back will not go back to the create-site step.
					return navigate( 'processing', undefined, true );
				}
				// The processing step will wait the aforementioned promise to be resolved and then will submit to you whatever the promise resolves to.
				// Which will be the created site { "siteId": "242341575", "siteSlug": "something.wordpress.com", "goToCheckout": false, "siteCreated": true }
				case 'processing': {
					if ( providedDependencies.processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					if ( providedDependencies.processingResult !== ProcessingResult.SUCCESS ) {
						return;
					}

					if ( providedDependencies.siteCreated ) {
						// The "manage site" re-entry path (browser back from checkout) returns siteSlug
						// but not siteId, so fall back to the values persisted at checkout setup.
						const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
						const siteSlug = providedDependencies.siteSlug || getSignupCompleteSlug();
						// We are setting up big sky now.
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

						// The Big Sky Site Spec editor URL that both the paid checkout redirect and the
						// non-garden legacy redirect send the user to.
						const specEditorArgs = {
							canvas: 'edit',
							'ai-step': 'spec',
							referrer: AI_SITE_BUILDER_FLOW,
							...( prompt && { prompt } ),
							...( source && { source } ),
							...( specId && { spec_id: specId } ),
						};

						// Paid flow: a plan is in the cart, so send the user through checkout and land
						// them on the Big Sky Site Spec once payment succeeds.
						if ( isPaid && providedDependencies.goToCheckout ) {
							const specDestination = addQueryArgs( `${ siteURL }/wp-admin/site-editor.php`, {
								...specEditorArgs,
								checkout: 'success',
							} );
							const checkoutBackUrl = addQueryArgs( `${ siteURL }/wp-admin/site-editor.php`, {
								...specEditorArgs,
								checkout: 'cancel',
							} );

							// Business and Commerce purchases trigger an Atomic transfer. Wait for it to
							// finish (via transferring-hosted-site) before handing off to Big Sky, so the
							// user doesn't land in wp-admin while the site is still transferring. Simple
							// plans (Personal/Premium) go straight to the Site Spec.
							const planSlug = planCartItem?.product_slug ?? '';
							const needsAtomicTransferWait =
								isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
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
							setSignupCompleteFlowName( AI_SITE_BUILDER_FLOW );

							window.location.assign(
								addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
									redirect_to: redirectAfterCheckout,
									checkoutBackUrl,
									signup: 1,
									'big-sky-checkout': 1,
								} )
							);
							return;
						}

						/**
						 * Legacy redirect behavior after site creation:
						 *
						 * The `trigger_backend_build` parameter controls where the user is redirected
						 * after site creation. The default behavior differs based on site type:
						 *
						 * NON-GARDEN SITES (no create_garden_site param):
						 *   - Default: site-editor.php (triggerBackendBuild=false)
						 *   - With trigger_backend_build=1: /wp-admin/
						 *   - With trigger_backend_build=0: site-editor.php
						 *
						 * GARDEN SITES (create_garden_site=1):
						 *   - Default: /wp-admin/ (triggerBackendBuild=true)
						 *   - With trigger_backend_build=1: /wp-admin/
						 *   - With trigger_backend_build=0: site-editor.php
						 */
						const triggerBackendBuildParam = queryParams.get( 'trigger_backend_build' );
						const triggerBackendBuild = gardenName
							? triggerBackendBuildParam !== '0' // Garden sites: default to /wp-admin/, opt-out with =0
							: triggerBackendBuildParam === '1'; // Non-garden: default to site-editor, opt-in with =1

						if ( triggerBackendBuild ) {
							const ph = queryParams.get( '_ph' );
							window.location.replace(
								addQueryArgs( `${ siteURL }/wp-admin/`, {
									...( ph && { _ph: ph } ),
								} )
							);
						} else {
							window.location.replace(
								addQueryArgs( `${ siteURL }/wp-admin/site-editor.php`, specEditorArgs )
							);
						}
					} else if ( providedDependencies.isLaunched ) {
						const site = await resolveSelect( SITE_STORE ).getSite( providedDependencies.siteSlug );
						let bigSkyUrl = `${ site.URL }/wp-admin/site-editor.php?canvas=edit&p=%2F`;
						const checkout = queryParams.get( 'checkout' );
						if ( checkout ) {
							bigSkyUrl += '&checkout=success';
						}
						window.location.replace( bigSkyUrl );
					}
					return;
				}
				case 'domains': {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					// Paid flow: the site does not exist yet, so stash the domain selection in the
					// onboard store; the create-site step adds it to the cart.
					if ( isPaid ) {
						if ( providedDependencies.navigateToUseMyDomain ) {
							throw new Error( 'Navigation to use my domain is not supported for this flow' );
						}

						setSiteUrl( providedDependencies.siteUrl as string );
						setDomain( providedDependencies.suggestion as DomainSuggestion );
						setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
						setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
						setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );
						return navigate( 'plans' );
					}

					if ( providedDependencies.domainItem && siteSlugFromSiteData ) {
						addProductsToCart( siteSlugFromSiteData, AI_SITE_BUILDER_FLOW, [
							providedDependencies.domainItem as MinimalRequestCartProduct,
						] ).then( ( res ) => {
							// eslint-disable-next-line no-console
							console.log( 'ADD TO CART', res );
						} );
					}

					// Flow is plan => domain and we are on domains: go to checkout
					if ( queryParams.get( 'flow' ) === 'plan-domain' ) {
						await goToCheckout();
						return;
					}

					return navigate( 'plans' );
				}

				case 'plans': {
					const { cartItems } = providedDependencies;

					// Paid flow: stash the picked plan + add-ons in the onboard store; the create-site
					// step creates the site and adds them to the cart before checkout.
					if ( isPaid ) {
						const [ pickedPlan, ...extraProducts ] = cartItems ?? [];
						if ( ! pickedPlan ) {
							throw new Error( 'No product slug found' );
						}
						setPlanCartItem( pickedPlan );
						setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );
						setSignupCompleteFlowName( AI_SITE_BUILDER_FLOW );
						return navigate( 'create-site' );
					}

					if ( cartItems && cartItems[ 0 ] && siteSlugFromSiteData ) {
						await addProductsToCart( siteSlugFromSiteData, AI_SITE_BUILDER_FLOW, [
							cartItems[ 0 ],
						] );
					}

					// Flow is plan => domain and we are on plans: go to domains
					if ( queryParams.get( 'flow' ) === 'plan-domain' ) {
						return navigate( 'domains' );
					}

					await goToCheckout();
					return;
				}

				case 'site-launch': {
					navigate( 'processing', undefined, true );
					return;
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default aiSiteBuilder;
