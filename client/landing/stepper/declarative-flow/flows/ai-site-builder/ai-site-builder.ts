import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { addPlanToCart, addProductsToCart, AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { resolveSelect, useDispatch as useWpDataDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { Flow } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface ProvidedDependencies {
	siteSlug?: string;
	siteId?: string;
	domainItem?: MinimalRequestCartProduct;
	cartItems?: MinimalRequestCartProduct[]; // Ensure cartItems is an array
}

const SiteIntent = Onboard.SiteIntent;
const deletePage = async ( siteId: string, pageId: number ): Promise< boolean > => {
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
		useEffect( () => {
			if ( siteId ) {
				dispatch( setSelectedSiteId( parseInt( siteId ) ) );
			}
		}, [ siteId ] );
	},
	initialize() {
		// stepsWithRequiredLogin will take care of redirecting to the login step if the user is not logged in.
		return stepsWithRequiredLogin( [
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.UNIFIED_DOMAINS,
			STEPS.UNIFIED_PLANS,
		] );
	},
	useStepNavigation( currentStep, navigate ) {
		const { siteSlug: siteSlugFromSiteData } = useSiteData();
		const { setDesignOnSite, setStaticHomepageOnSite, setIntentOnSite } =
			useWpDataDispatch( SITE_STORE );

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
					const { siteSlug, siteId } = providedDependencies;

					if ( ! siteId || ! siteSlug ) {
						// eslint-disable-next-line no-console
						console.error( 'No siteId or siteSlug', providedDependencies );
						return;
					}
					// get the prompt from the get url
					const prompt = queryParams.get( 'prompt' );
					let promptParam = '';

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
					}

					window.location.replace(
						`${ siteURL }/wp-admin/site-editor.php?canvas=edit&referrer=${ AI_SITE_BUILDER_FLOW }${ promptParam }`
					);

					return;
				}
				case 'domains': {
					if ( providedDependencies.domainItem && siteSlugFromSiteData ) {
						addProductsToCart( siteSlugFromSiteData, AI_SITE_BUILDER_FLOW, [
							providedDependencies.domainItem,
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

					window.location.assign(
						`/checkout/${ encodeURIComponent( siteSlugFromSiteData || '' ) }`
					);
				}

				default:
					return;
			}
		}

		return { submit };
	},
};

export default aiSiteBuilder;
