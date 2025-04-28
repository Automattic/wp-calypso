import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { addPlanToCart, addProductsToCart, AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { resolveSelect, useDispatch as useWpDataDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { Flow } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface ProvidedDependencies {
	siteSlug?: string;
	siteId?: string;
	domainItem?: MinimalRequestCartProduct;
	cartItems?: MinimalRequestCartProduct[]; // Ensure cartItems is an array
	siteCreated?: boolean;
	isLaunched?: boolean;
	processingResult?: ProcessingResult;
}

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
		// eslint-disable-next-line no-console
		console.error( `Failed to delete page ${ pageId } for site ${ siteId }:`, error );
		return false;
	}
};

function initialize() {
	// stepsWithRequiredLogin will take care of redirecting to the login step if the user is not logged in.
	return stepsWithRequiredLogin( [
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.ERROR,
		STEPS.UNIFIED_DOMAINS,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_LAUNCH,
		STEPS.PROCESSING,
	] );
}

const aiSiteBuilder: Flow = {
	name: AI_SITE_BUILDER_FLOW,
	/**
	 * Should it fire calypso_signup_start event?
	 */
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSideEffect() {
		const dispatch = useDispatch();
		const siteId = useQuery().get( 'siteId' );
		const prompt = useQuery().get( 'prompt' );
		useEffect( () => {
			if ( siteId ) {
				dispatch( setSelectedSiteId( parseInt( siteId ) ) );
			}
		}, [ siteId ] );
		useEffect( () => {
			if ( prompt && prompt.length > 0 ) {
				window.sessionStorage.setItem( 'stored_ai_prompt', prompt );
			}
		}, [ prompt ] );
	},
	initialize,
	useStepNavigation( currentStep, navigate ) {
		const { siteSlug: siteSlugFromSiteData, siteId: siteIdFromSiteData } = useSiteData();
		const { setDesignOnSite, setStaticHomepageOnSite, setIntentOnSite } =
			useWpDataDispatch( SITE_STORE );

		const { addBlogSticker } = useAddBlogStickerMutation();

		const queryParams = useQuery();
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
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
								// eslint-disable-next-line no-console
								console.error( 'No siteId or siteSlug', providedDependencies );
								return;
							}
							// get the prompt from the get url
							const prompt = queryParams.get( 'prompt' );
							let promptParam = '';

							addBlogSticker( siteId, 'big-sky-free-trial' );

							const pendingActions = [
								resolveSelect( SITE_STORE ).getSite( siteId ), // To get the URL.
							];

							// Create a new home page if one is not set yet.
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

							pendingActions.push(
								setDesignOnSite( siteSlug, getAssemblerDesign(), { enableThemeSetup: true } )
							);
							pendingActions.push( setIntentOnSite( siteSlug, SiteIntent.AIAssembler ) );

							// Delete the existing boilerplate about page, always has a page ID of 1
							pendingActions.push( deletePage( siteId || '', 1 ) );
							const results = await Promise.all( pendingActions );
							const siteURL = results[ 0 ].URL;

							const homePagePostId = results[ 1 ].id;
							await setStaticHomepageOnSite( siteId, homePagePostId );

							if ( prompt ) {
								promptParam = `&prompt=${ encodeURIComponent( prompt ) }`;
							} else if ( window.sessionStorage.getItem( 'stored_ai_prompt' ) ) {
								promptParam = `&prompt=${ encodeURIComponent(
									window.sessionStorage.getItem( 'stored_ai_prompt' ) || ''
								) }`;
								window.sessionStorage.removeItem( 'stored_ai_prompt' );
							}
							window.location.replace(
								`${ siteURL }/wp-admin/site-editor.php?canvas=edit&referrer=${ AI_SITE_BUILDER_FLOW }${ promptParam }`
							);
						} else if ( providedDependencies.isLaunched ) {
							const site = await resolveSelect( SITE_STORE ).getSite(
								providedDependencies.siteSlug
							);
							window.location.replace( site.URL );
						}
					}
					return;
				}
				case 'domains': {
					if ( providedDependencies.domainItem && siteSlugFromSiteData ) {
						addProductsToCart( siteSlugFromSiteData, AI_SITE_BUILDER_FLOW, [
							providedDependencies.domainItem as MinimalRequestCartProduct,
						] ).then( ( res ) => {
							// eslint-disable-next-line no-console
							console.log( 'ADD TO CART', res );
						} );
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

					const site = await resolveSelect( SITE_STORE ).getSite( siteIdFromSiteData );
					const bigSkyUrl = `${ site.URL }/wp-admin/site-editor.php?canvas=edit&p=%2F`;
					const siteLaunchUrl = addQueryArgs( '/setup/ai-site-builder/site-launch', {
						siteId: siteIdFromSiteData,
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
				}

				case 'site-launch': {
					navigate( 'processing', undefined, true );
				}

				default:
					return;
			}
		}

		return { submit };
	},
};

export default aiSiteBuilder;
