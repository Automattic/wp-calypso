import { addPlanToCart, addProductsToCart, AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { Flow } from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface ProvidedDependencies {
	siteSlug?: string;
	siteId?: string;
	domainItem?: MinimalRequestCartProduct;
	cartItems?: MinimalRequestCartProduct[]; // Ensure cartItems is an array
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
			STEPS.LAUNCH_BIG_SKY,
			STEPS.UNIFIED_DOMAINS,
			STEPS.UNIFIED_PLANS,
		] );
	},
	useStepNavigation( currentStep, navigate ) {
		const { siteSlug: siteSlugFromSiteData } = useSiteData();
		const { domainCartItem } = useSelect(
			( select: ( arg: string ) => OnboardSelect ) => ( {
				domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
			} ),
			[]
		);
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

					try {
						await wpcom.req.post( {
							apiNamespace: 'wpcom/v2',
							path: `/sites/${ siteId }/send-email-continue-site-build`,
							body: {
								continue_url: `https://${ siteSlug }/wp-admin/site-editor.php?canvas=edit`,
							},
						} );
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.error( 'Failed to send continue build email:', error );
					}

					// get the prompt from the get url
					const prompt = queryParams.get( 'prompt' );
					let promptParam = '';

					if ( prompt ) {
						promptParam = `&prompt=${ encodeURIComponent( prompt ) }`;
					}

					return navigate(
						`launch-big-sky?siteId=${ siteId }&siteSlug=${ siteSlug }${ promptParam }`,
						undefined,
						true
					);
				}
				case 'domains': {
					// eslint-disable-next-line no-console
					console.log( 'DOMAAAINZ STEP', providedDependencies, siteSlugFromSiteData );
					// TODO: Somehow store the chosen domain.
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
					// eslint-disable-next-line no-console
					console.log(
						'PLAAANZ STEP',
						JSON.stringify(
							{
								dependencies: providedDependencies,
								slug: siteSlugFromSiteData,
								domain: domainCartItem,
							},
							null,
							2
						)
					);

					if ( cartItems && cartItems[ 0 ] && siteSlugFromSiteData ) {
						const addToCart = await addPlanToCart(
							siteSlugFromSiteData,
							AI_SITE_BUILDER_FLOW,
							true,
							'assembler',
							cartItems[ 0 ]
						);
						// eslint-disable-next-line no-console
						console.log( 'ADD TO CART', addToCart );
					}

					// eslint-disable-next-line no-console
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
