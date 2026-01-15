import { Onboard } from '@automattic/data-stores';
import { addPlanToCart, addProductsToCart, AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { resolveSelect, useDispatch as useWpDataDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { FlowV2, SubmitHandler } from '../../internals/types';

const SiteIntent = Onboard.SiteIntent;
const deletePage = async ( siteId: string | number, pageId: number ): Promise< boolean > => {
	try {
		await wpcomRequest( {
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
	// stepsWithRequiredLogin will take care of redirecting to the login step if the user is not logged in.
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
				setGardenPartnerName( 'wpcom' );
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
		const { gardenName } = useSelect(
			( select ) => ( {
				gardenName: ( select( ONBOARD_STORE ) as any ).getGardenName(),
				gardenPartnerName: ( select( ONBOARD_STORE ) as any ).getGardenPartnerName(),
			} ),
			[]
		);

		const { addBlogSticker } = useAddBlogStickerMutation( {
			onError: () => {
				// Fail silently - blog sticker addition is not essential for site creation
			},
		} );

		const queryParams = useQuery();

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

					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						if ( providedDependencies.siteCreated ) {
							const { siteSlug, siteId } = providedDependencies;
							// We are setting up big sky now.
							if ( ! siteId || ! siteSlug ) {
								return;
							}
							// get the prompt from the get url
							const prompt = queryParams.get( 'prompt' );
							let promptParam = '';

							const source = queryParams.get( 'source' );
							const specId = queryParams.get( 'spec_id' );
							const triggerBackendBuild = queryParams.get( 'trigger_backend_build' ) === '1';
							let sourceParam = '';
							let specIdParam = '';

							const pendingActions = [
								resolveSelect( SITE_STORE ).getSite( siteId ), // To get the URL.
							];

							if ( ! gardenName ) {
								// Add blog sticker - this runs independently and errors are handled by the mutation's onError callback (only for non-garden sites)
								addBlogSticker( siteId, 'big-sky-free-trial' );

								// Create a new home page if one is not set yet (only for non-garden sites)
								pendingActions.push(
									wpcomRequest( {
										path: '/sites/' + siteId + '/pages',
										method: 'POST',
										apiNamespace: 'wp/v2',
										body: {
											title: 'Home',
											status: 'publish',
											content: '<!-- wp:paragraph -->\n<p>Hello world!</p>\n<!-- /wp:paragraph -->',
										},
									} )
								);
							}

							// Only apply design and delete page for non-garden sites
							if ( ! gardenName ) {
								pendingActions.push( deletePage( siteId || '', 1 ) );
							}
							pendingActions.push( setIntentOnSite( siteSlug, SiteIntent.AIAssembler ) );

							// Execute operations individually to identify which one fails
							const results = [];
							try {
								// Execute all actions sequentially with logging
								for ( let i = 0; i < pendingActions.length; i++ ) {
									const result = await pendingActions[ i ];
									results.push( result );
								}
							} catch ( error ) {
								return;
							}

							// Defensive check for site data (always first)
							const siteData = results[ 0 ];
							if ( ! siteData || ! siteData.URL ) {
								return;
							}
							const siteURL = siteData.URL;

							// Handle page creation result (only exists for non-garden sites)
							if ( ! gardenName && results.length > 1 ) {
								const pageCreationResult = results[ 1 ];
								if ( pageCreationResult && pageCreationResult.id ) {
									const homePagePostId = pageCreationResult.id;
									await setStaticHomepageOnSite( siteId, homePagePostId );
								}
							}

							if ( prompt ) {
								promptParam = `&prompt=${ encodeURIComponent( prompt ) }`;
							} else if ( window.sessionStorage.getItem( 'stored_ai_prompt' ) ) {
								promptParam = `&prompt=${ encodeURIComponent(
									window.sessionStorage.getItem( 'stored_ai_prompt' ) || ''
								) }`;
								window.sessionStorage.removeItem( 'stored_ai_prompt' );
							}

							if ( source ) {
								sourceParam = `&source=${ encodeURIComponent( source ) }`;
							}
							if ( specId ) {
								specIdParam = `&spec_id=${ encodeURIComponent( specId ) }`;
							}

							if ( triggerBackendBuild ) {
								window.location.replace( `${ siteURL }/wp-admin/` );
							} else {
								window.location.replace(
									`${ siteURL }/wp-admin/site-editor.php?canvas=edit&ai-step=spec&referrer=${ AI_SITE_BUILDER_FLOW }${ promptParam }${ sourceParam }${ specIdParam }`
								);
							}
						} else if ( providedDependencies.isLaunched ) {
							const site = await resolveSelect( SITE_STORE ).getSite(
								providedDependencies.siteSlug
							);
							let bigSkyUrl = `${ site.URL }/wp-admin/site-editor.php?canvas=edit&p=%2F`;
							const checkout = queryParams.get( 'checkout' );
							if ( checkout ) {
								bigSkyUrl += '&checkout=success';
							}
							window.location.replace( bigSkyUrl );
						}
					}
					return;
				}
				case 'domains': {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
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

					if ( cartItems && cartItems[ 0 ] && siteSlugFromSiteData ) {
						await addPlanToCart(
							siteSlugFromSiteData,
							AI_SITE_BUILDER_FLOW,
							true,
							'assembler',
							cartItems[ 0 ]
						);
					}

					// Flow is plan => domain and we are on plans: go to domains
					if ( queryParams.get( 'flow' ) === 'plan-domain' ) {
						return navigate( 'domains' );
					}

					await goToCheckout();
				}

				case 'site-launch': {
					navigate( 'processing', undefined, true );
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default aiSiteBuilder;
