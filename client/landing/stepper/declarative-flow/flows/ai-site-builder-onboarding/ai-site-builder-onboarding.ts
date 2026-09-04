import config from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { AI_SITE_BUILDER_ONBOARDING_FLOW, clearStepPersistedState } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, dispatch, resolveSelect, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { pathToUrl } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	clearSignupDestinationCookie,
	clearSignupCompleteFlowName,
	clearSignupCompleteSlug,
	clearSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from '../../../stores';
import { getBuildWowSiteSpecUrl } from '../../../utils/build-wow';
import { planSupportsBuildWow } from '../../../utils/build-wow-plans';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { Store } from 'redux';

const SiteIntent = Onboard.SiteIntent;

/**
 * The build-wow site spec, entered straight from checkout. The build-wow
 * endpoint provisions the Atomic site and queues the build when the spec is
 * confirmed there, so no site preparation is needed on the way in. A spec_id
 * carried from entry confirms that spec on arrival instead of asking again.
 */
function getBuildWowDestination( {
	siteSlug,
	siteId,
	ref,
	source,
	prompt,
	specId,
}: {
	siteSlug: string;
	siteId: number | string;
	ref: string | null;
	source: string | null;
	prompt: string;
	specId: string | null;
} ): string {
	const specUrl = getBuildWowSiteSpecUrl( { siteSlug, siteId, ref, source, prompt } );

	return specId ? addQueryArgs( specUrl, { spec_id: specId } ) : specUrl;
}

async function initialize( reduxStore: Store ) {
	const { resetOnboardStore } = dispatch( ONBOARD_STORE ) as OnboardActions;

	await resetOnboardStore();
	// @ts-expect-error We're using the thunk middleware but TS doesn't know that.
	reduxStore.dispatch( setSelectedSiteId( null ) );
	clearStepPersistedState( AI_SITE_BUILDER_ONBOARDING_FLOW );
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
	] );
}

const aiSiteBuilderOnboarding: FlowV2< typeof initialize > = {
	name: AI_SITE_BUILDER_ONBOARDING_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useSideEffect() {
		const prompt = useQuery().get( 'prompt' );
		useEffect( () => {
			if ( prompt && prompt.length > 0 ) {
				window.sessionStorage.setItem( 'stored_ai_prompt', prompt );
			}
		}, [ prompt ] );
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { setStaticHomepageOnSite, setIntentOnSite } = useDispatch( SITE_STORE );

		const query = useQuery();
		const flowName = this.name;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		/**
		 * Prepare the freshly created site for Big Sky and return the site editor
		 * URL that launches the Site Spec experience: publish a Home page, set it
		 * as the static homepage, and set the AI Assembler intent so the editor
		 * opens on a real page rather than the index template. Reuse an existing
		 * Home page if the site was already prepared so a re-entry doesn't create
		 * duplicates.
		 */
		async function prepareSiteEditorDestination( {
			site,
			siteId,
			siteSlug,
			prompt,
			source,
			specId,
		}: {
			site: { URL: string };
			siteId: number | string;
			siteSlug: string;
			prompt: string;
			source: string | null;
			specId: string | null;
		} ): Promise< string > {
			try {
				const existingPages = await wpcom.req.get(
					{ path: '/sites/' + siteId + '/pages', apiNamespace: 'wp/v2' },
					{ slug: 'home', status: 'publish', _fields: 'id' }
				);
				let homePageId = existingPages?.[ 0 ]?.id as number | undefined;

				if ( ! homePageId ) {
					const homePage = await wpcom.req.post(
						{ path: '/sites/' + siteId + '/pages', apiNamespace: 'wp/v2' },
						{},
						{
							title: 'Home',
							status: 'publish',
							content: '<!-- wp:paragraph -->\n<p>Hello world!</p>\n<!-- /wp:paragraph -->',
						}
					);
					homePageId = homePage?.id;
				}

				await setIntentOnSite( siteSlug, SiteIntent.AIAssembler );
				if ( homePageId ) {
					await setStaticHomepageOnSite( siteId, homePageId );
				}
			} catch ( error ) {
				// Fail silently — Big Sky can still launch without the prepared page.
			}

			return addQueryArgs( `${ site.URL }/wp-admin/site-editor.php`, {
				canvas: 'edit',
				'ai-step': 'spec',
				referrer: AI_SITE_BUILDER_ONBOARDING_FLOW,
				...( prompt && { prompt } ),
				...( source && { source } ),
				...( specId && { spec_id: specId } ),
				checkout: 'success',
			} );
		}

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						throw new Error( 'Navigation to use my domain is not supported for this flow' );
					}

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...extraProducts ] = cartItems ?? [];

					if ( ! pickedPlan ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( pickedPlan );
					setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );
					setSignupCompleteFlowName( flowName );

					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug );

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult === ProcessingResult.FAILURE ) {
						return navigate( STEPS.ERROR.slug );
					}

					if ( providedDependencies.processingResult !== ProcessingResult.SUCCESS ) {
						return;
					}

					if ( ! providedDependencies.goToCheckout ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
					const siteSlug = ( providedDependencies.siteSlug || getSignupCompleteSlug() ) as string;

					if ( ! siteId || ! siteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}

					const site = await resolveSelect( SITE_STORE ).getSite( siteId );

					if ( ! site || ! site.URL ) {
						return navigate( STEPS.ERROR.slug );
					}

					// Checkout lands on the build-wow theme generation flow, the same
					// destination the post-checkout "Create a custom design" card uses. The
					// build-wow endpoint prepares the site itself, so the Big Sky editor
					// preparation is only for the legacy site editor destination. The build-wow
					// destination lives in the ai-site-builder-spec flow, which bounces to plain
					// onboarding without the site-spec feature, and needs an Atomic-capable plan.
					const useBuildWow =
						config.isEnabled( 'site-spec' ) && planSupportsBuildWow( planCartItem?.product_slug );

					const prompt =
						query.get( 'prompt' ) || window.sessionStorage.getItem( 'stored_ai_prompt' ) || '';
					const source = query.get( 'source' );
					const ref = query.get( 'ref' );
					const specId = query.get( 'spec_id' );
					window.sessionStorage.removeItem( 'stored_ai_prompt' );

					const destination = useBuildWow
						? getBuildWowDestination( { siteSlug, siteId, ref, source, prompt, specId } )
						: await prepareSiteEditorDestination( {
								site,
								siteId,
								siteSlug,
								prompt,
								source,
								specId,
						  } );

					// On checkout exit we must not drop the user into the AI builder (the
					// success destination) before they've paid. Send them back into
					// the flow instead: keeping the cart returns to the plan step,
					// while emptying the cart returns to the domain step (handled by
					// the leave-checkout modal via checkoutBackUrlDomains).
					const backStepQueryArgs = {
						siteSlug,
						...( prompt && { prompt } ),
						...( source && { source } ),
						...( ref && { ref } ),
						...( specId && { spec_id: specId } ),
					};
					const checkoutBackUrl = pathToUrl(
						addQueryArgs(
							`/setup/${ AI_SITE_BUILDER_ONBOARDING_FLOW }/${ STEPS.UNIFIED_PLANS.slug }`,
							backStepQueryArgs
						)
					);
					const checkoutBackUrlDomains = pathToUrl(
						addQueryArgs(
							`/setup/${ AI_SITE_BUILDER_ONBOARDING_FLOW }/${ STEPS.DOMAIN_SEARCH.slug }`,
							backStepQueryArgs
						)
					);

					persistSignupDestination( destination );
					setSignupCompleteSlug( siteSlug );
					setSignupCompleteFlowName( flowName );
					setSignupCompleteSiteID( siteId );

					return window.location.assign(
						addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
							redirect_to: destination,
							checkoutBackUrl,
							checkoutBackUrlDomains,
							signup: 1,
							'big-sky-checkout': 1,
						} )
					);
				}
			}
		};

		return { submit };
	},
};

export default aiSiteBuilderOnboarding;
