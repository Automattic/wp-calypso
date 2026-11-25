import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import { SiteGoal } from '@automattic/data-stores/src/onboard';
import { getTld, isFreeSubdomainQuery } from '@automattic/domain-search';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { CartActionConnectionError, CartActionResponseError } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { getLocaleSlug } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp'; // eslint-disable-line no-restricted-imports
import {
	setupSiteAfterCreation,
	isTailoredSignupFlow,
	HUNDRED_YEAR_PLAN_FLOW,
	AI_SITE_BUILDER_FLOW,
} from '../';
import wpcomRequest from '../wpcom-request';
import cartManagerClient, { wpcomGetCart } from './create-cart-manager-client';
import type { DomainSuggestion } from '@automattic/api-core';
import type {
	CartKey,
	MinimalRequestCartProduct,
	ResponseCart,
	ResponseCartMessage,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:signup:step-actions' );

interface GetNewSiteParams {
	flowToCheck: string;
	themeSlugWithRepo: string;
	siteUrl?: string;
	siteTitle: string;
	siteAccentColor: string;
	useThemeHeadstart: boolean;
	siteVisibility: Site.Visibility;
	partnerBundle: string | null;
	sourceSlug?: string;
	siteIntent?: string;
	provisionTarget?: string | null;
	wowFunnel?: string;
	wowFunnelArgs?: Record< string, string >;
	wowFunnelFromWfm?: boolean;
}

type NewSiteParams = {
	blog_title: string;
	public: Site.Visibility;
	blog_name: string;
	find_available_url: boolean;
	options: {
		designType: string;
		theme?: string;
		use_theme_annotation: boolean;
		default_annotation_as_primary_fallback: boolean;
		site_segment: undefined;
		site_information: {
			title: string;
		};
		site_creation_flow: string;
		timezone_string?: string;
		wpcom_public_coming_soon: 0 | 1;
		site_accent_color?: string;
		site_intent?: string;
		early_provision_target?: string;
		wow_funnel?: string;
		wow_funnel_args?: Record< string, string >;
		from_wfm?: 1;
	};
	validate: boolean;
};

const getBlogNameGenerationParams = ( { siteUrl, siteTitle }: GetNewSiteParams ) => {
	if ( siteUrl ) {
		const blogName = siteUrl.replace( '.wordpress.com', '' );

		return {
			blog_name: blogName,
			// Free subdomains (.wordpress.com and .blog) should use the exact URL.
			// Only paid domains need find_available_url to generate a fallback free subdomain.
			find_available_url: ! isFreeSubdomainQuery( siteUrl ) && !! getTld( blogName ),
		};
	}

	if ( siteTitle ) {
		return {
			blog_name: siteTitle,
			find_available_url: true,
		};
	}

	// With no name to work from, the server generates the address.
	return {
		blog_name: '',
		find_available_url: true,
	};
};

export const getNewSiteParams = ( params: GetNewSiteParams ) => {
	const {
		flowToCheck,
		themeSlugWithRepo,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart = false,
		siteVisibility,
		sourceSlug,
		siteIntent,
		partnerBundle,
		provisionTarget,
		wowFunnel,
		wowFunnelArgs,
		wowFunnelFromWfm,
	} = params;

	// We will use the default annotation instead of theme annotation as fallback,
	// when segment and vertical values are not sent. Check pbAok1-p2#comment-834.
	const newSiteParams: NewSiteParams = {
		...getBlogNameGenerationParams( params ),
		blog_title: siteTitle,
		public: siteVisibility,
		options: {
			designType: '',
			use_theme_annotation: useThemeHeadstart,
			default_annotation_as_primary_fallback: true,
			site_segment: undefined,
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: flowToCheck,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: siteVisibility === 0 ? 1 : 0,
			...( sourceSlug && { site_source_slug: sourceSlug } ),
			...( siteAccentColor && { site_accent_color: siteAccentColor } ),
			...( themeSlugWithRepo && { theme: themeSlugWithRepo } ),
			...( siteIntent && { site_intent: siteIntent } ),
			...( partnerBundle && { site_partner_bundle: partnerBundle } ),
			...( provisionTarget && { early_provision_target: provisionTarget } ),
			// WoW funnel: build the site's Atomic host before checkout. The slug names a
			// registered funnel server-side (see wp-content/lib/atomic/funnels.php).
			...( wowFunnel && { wow_funnel: wowFunnel } ),
			// Input for the funnel's server-side follow-up (e.g. the blueprint archive to import).
			...( wowFunnelArgs &&
				Object.keys( wowFunnelArgs ).length > 0 && { wow_funnel_args: wowFunnelArgs } ),
			// CTA opt-in to claim a pre-provisioned site from the WoW fleet. The server falls
			// back to the ordinary funnel build when no fleet site can be claimed.
			...( wowFunnel && wowFunnelFromWfm && { from_wfm: 1 as const } ),
		},
		validate: false,
	};

	return newSiteParams;
};

export const createSite = async (
	flowName: string,
	themeSlugWithRepo: string,
	siteVisibility: Site.Visibility,
	siteTitle: string,
	siteAccentColor: string,
	useThemeHeadstart: boolean,
	partnerBundle: string | null,
	storedSiteUrl?: string,
	domainItem?: DomainSuggestion,
	sourceSlug?: string,
	siteIntent?: string,
	siteGoals?: SiteGoal[],
	gardenName?: string | null,
	gardenPartnerName?: string | null,
	specId?: string | null,
	ref?: string,
	provisionTarget?: string | null,
	aiLaunchpadEnabled?: boolean,
	wowFunnel?: string,
	wowFunnelArgs?: Record< string, string >,
	wowFunnelFromWfm?: boolean
) => {
	const siteUrl = storedSiteUrl || domainItem?.domain_name;

	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		themeSlugWithRepo,
		siteUrl,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart,
		siteVisibility,
		sourceSlug,
		siteIntent,
		partnerBundle,
		provisionTarget,
		wowFunnel,
		wowFunnelArgs,
		wowFunnelFromWfm,
	} );

	// if ( isEmpty( bearerToken ) && 'onboarding-registrationless' === flowToCheck ) {
	// 	saveToLocalStorageAndProceed( state, domainItem, themeItem, newSiteParams, callback );
	// 	return;
	// }

	const locale = getLocaleSlug();
	const hasSegmentationSurvey: boolean =
		newSiteParams[ 'options' ][ 'site_creation_flow' ] === 'entrepreneur';
	const segmentationSurveyAnswersAnonId = localStorage.getItem( 'ss-anon-id' );
	localStorage.removeItem( 'ss-anon-id' );

	// This is the parameter that will contain the internal referral, e.g. a landing page.
	const refParam = new URLSearchParams( document.location.search ).get( 'ref' );

	// Through the shared client, never the bare proxy request. An account created in this session
	// is signed in by a bearer token that only the shared client carries. A bare proxy request is
	// authenticated by a JWT bound to the browser's login cookie instead, and any login, logout or
	// second signup in the same browser invalidates that JWT while the token stays good. The gate
	// polls /me through the shared client, so it reports the account verified right up to the
	// moment this request answers authorization_required.
	const siteCreationResponse: NewSiteSuccessResponse = await wpcom.req.post(
		{
			path: '/sites/new',
			apiVersion: '1.1',
		},
		{},
		{
			...newSiteParams,
			locale,
			lang_id: getLanguage( locale as string )?.value,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			...( gardenName &&
				gardenPartnerName && {
					garden_name: gardenName,
					garden_partner_name: gardenPartnerName,
				} ),
			...( specId && {
				spec_id: specId,
			} ),
			options: {
				...newSiteParams.options,
				has_segmentation_survey: hasSegmentationSurvey,
				...( hasSegmentationSurvey && segmentationSurveyAnswersAnonId
					? { segmentation_survey_answers_anon_id: segmentationSurveyAnswersAnonId }
					: {} ),
				...( siteGoals && { site_goals: siteGoals } ),
				...( ( ref ?? refParam ) && { ref: ref ?? refParam } ),
				// Enables the wp-admin AI Launchpad from the moment the site exists, so every
				// post-checkout path (direct, chooser, Big Sky return) converges on it. The
				// option is in the WoA transfer allowlist, so it survives the Atomic transfer.
				...( aiLaunchpadEnabled && { wpcom_ai_launchpad_enabled: true } ),
				// Trigger backend build for ai-site-builder flow with commerce garden and spec_id
				...( flowName === AI_SITE_BUILDER_FLOW &&
					gardenName === 'commerce' &&
					specId && {
						trigger_backend_build: false,
					} ),
			},
		}
	);

	if ( ! siteCreationResponse.success ) {
		// TODO ebuccelli: Manage siteCreationResponse.errors
		return;
	}

	// TODO - This is a temporary fix to ensure garden site URLs use HTTPS.
	// Ensure garden site URLs use HTTPS
	if ( gardenName && siteCreationResponse?.blog_details?.url ) {
		siteCreationResponse.blog_details.url = siteCreationResponse.blog_details.url.replace(
			'http://',
			'https://'
		);
	}

	const parsedBlogURL = getUrlParts( siteCreationResponse?.blog_details.url );
	const siteSlug = parsedBlogURL.hostname;
	const siteId = siteCreationResponse?.blog_details.blogid;
	const providedDependencies = {
		siteId,
		siteSlug,
		domainItem,
	};

	if ( isTailoredSignupFlow( flowName ) || HUNDRED_YEAR_PLAN_FLOW === flowName ) {
		await setupSiteAfterCreation( { siteId, flowName } );
	}

	return providedDependencies;
};

function prepareItemForAddingToCart( item: MinimalRequestCartProduct, lastKnownFlow?: string ) {
	return {
		...item,
		extra: {
			...item.extra,
			context: 'signup',
			...( lastKnownFlow && { signup_flow: lastKnownFlow } ),
		},
	};
}

type CartHelperOptions = { throwOnError?: boolean; cartKey?: CartKey };

// The lookup of a cart key from a site slug can time out and return `no-site`, which sends the
// items to the cart of no site. A caller that knows the site ID passes it to skip the lookup.
async function getCartKey( siteSlug: string, cartKey: CartKey | undefined ): Promise< CartKey > {
	if ( typeof cartKey === 'number' && Number.isInteger( cartKey ) && cartKey > 0 ) {
		return cartKey;
	}
	return cartManagerClient.getCartKeyForSiteSlug( siteSlug );
}

// The server lower-cases the domain in a cart item's meta, so the comparison ignores case.
function isSameMeta( cartMeta: string | undefined, requestedMeta: string ): boolean {
	return ( cartMeta ?? '' ).toLowerCase() === requestedMeta.toLowerCase();
}

function isMatchingCartProduct(
	cartProduct: ResponseCartProduct,
	requestedItem: MinimalRequestCartProduct
): boolean {
	return (
		cartProduct.product_slug === requestedItem.product_slug &&
		( ! requestedItem.meta || isSameMeta( cartProduct.meta, requestedItem.meta ) )
	);
}

type CartCheck = {
	// Undefined when the cart state cannot be read.
	missingItems?: MinimalRequestCartProduct[];
	hasOtherItems: boolean;
	errorMessages: ResponseCartMessage[];
};

function getCartFromManager( cartKey: CartKey ): ResponseCart | undefined {
	try {
		return cartManagerClient.forCartKey( cartKey ).getState().responseCart;
	} catch {
		return undefined;
	}
}

function checkCartForRequestedItems(
	responseCart: ResponseCart | undefined,
	requestedItems: MinimalRequestCartProduct[]
): CartCheck {
	const cartProducts = responseCart?.products;
	if ( ! Array.isArray( cartProducts ) ) {
		return { hasOtherItems: false, errorMessages: [] };
	}

	return {
		missingItems: requestedItems.filter(
			( requestedItem ) =>
				! cartProducts.some( ( cartProduct ) =>
					isMatchingCartProduct( cartProduct, requestedItem )
				)
		),
		hasOtherItems: cartProducts.some(
			( cartProduct ) =>
				! requestedItems.some( ( requestedItem ) =>
					isMatchingCartProduct( cartProduct, requestedItem )
				)
		),
		errorMessages: responseCart?.messages?.errors ?? [],
	};
}

// A longer domain can contain the domain, as `myexample.com` and `example.com.au` contain
// `example.com`, so a match must not touch another character of a domain name.
function messageNamesDomain( message: string, domain: string ): boolean {
	const text = message.toLowerCase();
	const name = domain.toLowerCase();

	let index = text.indexOf( name );
	while ( index !== -1 ) {
		const isInsideLongerName =
			/[a-z0-9.-]$/.test( text.slice( 0, index ) ) ||
			/^\.?[a-z0-9-]/.test( text.slice( index + name.length ) );
		if ( ! isInsideLongerName ) {
			return true;
		}
		index = text.indexOf( name, index + 1 );
	}
	return false;
}

// A cart message has no reference to an item, and the cart manager rejects with the first message
// only. The first message can be about a stale product while the user's domain was the item that
// was dropped, so look for a message that names a missing item.
function findMessageForMissingItems(
	errorMessages: ResponseCartMessage[],
	missingItems: MinimalRequestCartProduct[]
): ResponseCartMessage | undefined {
	return errorMessages.find( ( errorMessage ) =>
		missingItems.some(
			( missingItem ) =>
				!! missingItem.meta && messageNamesDomain( errorMessage.message, missingItem.meta )
		)
	);
}

const CART_FETCH_TIME_LIMIT_MS = 10000;

// The cart endpoint can leave a request without an answer, and the fetch has no time limit of its
// own. Without this limit, a fetch that never answers keeps the processing step waiting forever.
//
// The fetch does not go through the cart manager. A manager reload that never answers leaves the
// manager waiting for its cart, and the manager queues every later action while it waits. The
// manager is shared, so the next add from the same page would never run.
function fetchServerCartWithTimeLimit( cartKey: CartKey ): Promise< ResponseCart > {
	let timeoutId: ReturnType< typeof setTimeout > | undefined;
	const timeLimit = new Promise< never >( ( _resolve, reject ) => {
		timeoutId = setTimeout(
			() => reject( new Error( 'The cart fetch did not answer in time.' ) ),
			CART_FETCH_TIME_LIMIT_MS
		);
	} );

	return Promise.race( [ wpcomGetCart( cartKey ), timeLimit ] ).finally( () =>
		clearTimeout( timeoutId )
	);
}

// A response error can be about another item in the cart, such as a stale invalid product. The
// server keeps the valid items, so the flow can continue when every requested item is present.
// A replace must also leave no other items, because a replace exists to remove them.
//
// A failed request does not tell whether the server applied the change. After that failure the
// manager state is the cart from before the request, so the helper fetches the server cart before
// it checks the items. Every other error that is not a response error stops the caller.
//
// Returns the error to throw, or undefined when the flow can continue.
async function getCartErrorToThrow(
	error: unknown,
	cartKey: CartKey,
	requestedItems: MinimalRequestCartProduct[],
	{ isReplace }: { isReplace: boolean }
): Promise< unknown > {
	let responseCart: ResponseCart | undefined;

	if ( error instanceof CartActionConnectionError ) {
		try {
			responseCart = await fetchServerCartWithTimeLimit( cartKey );
		} catch {
			return error;
		}
	} else if ( error instanceof CartActionResponseError ) {
		responseCart = getCartFromManager( cartKey );
	} else {
		return error;
	}

	const { missingItems, hasOtherItems, errorMessages } = checkCartForRequestedItems(
		responseCart,
		requestedItems
	);

	if ( ! missingItems ) {
		return error;
	}

	if ( missingItems.length > 0 ) {
		const message = findMessageForMissingItems( errorMessages, missingItems );
		return message ? new CartActionResponseError( message.message, message.code ) : error;
	}

	if ( isReplace && hasOtherItems ) {
		return error;
	}

	return undefined;
}

export async function replaceProductsInCart(
	siteSlug: string,
	cartItems: MinimalRequestCartProduct[],
	options: CartHelperOptions = {}
) {
	const cartKey = await getCartKey( siteSlug, options.cartKey );

	try {
		const updatedCart = await cartManagerClient
			.forCartKey( cartKey )
			.actions.replaceProductsInCart( cartItems );

		debug( 'product replace request complete', updatedCart );
	} catch ( error ) {
		debug( 'product replace request had an error', error );
		if ( options.throwOnError ) {
			const errorToThrow = await getCartErrorToThrow( error, cartKey, cartItems, {
				isReplace: true,
			} );
			if ( errorToThrow ) {
				throw errorToThrow;
			}
			debug( 'the cart holds only the requested items, so the cart error does not throw' );
		}
	}
}

export async function addProductsToCart(
	siteSlug: string,
	flowName: string,
	cartItems: MinimalRequestCartProduct[] | null,
	options: CartHelperOptions = {}
) {
	if ( Array.isArray( cartItems ) ) {
		const cartItemsToAdd = cartItems.map( ( cartItem ) =>
			prepareItemForAddingToCart( cartItem, flowName )
		);

		debug( 'adding products to cart', cartItems );
		const cartKey = await getCartKey( siteSlug, options.cartKey );

		try {
			const updatedCart = await cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( cartItemsToAdd );

			debug( 'product add request complete', updatedCart );
		} catch ( error ) {
			debug( 'product add request had an error', error );
			if ( options.throwOnError ) {
				const errorToThrow = await getCartErrorToThrow( error, cartKey, cartItemsToAdd, {
					isReplace: false,
				} );
				if ( errorToThrow ) {
					throw errorToThrow;
				}
				debug( 'the cart holds every requested item, so the cart error does not throw' );
			}
		}
	}
}

export async function setThemeOnSite(
	siteSlug: string,
	themeSlugWithRepo: string,
	themeStyleVariation?: string
) {
	if ( ! themeSlugWithRepo ) {
		return;
	}

	const theme = themeSlugWithRepo.split( '/' )[ 1 ];

	try {
		await wpcomRequest( {
			path: `/sites/${ siteSlug }/themes/mine`,
			method: 'POST',
			apiVersion: '1.1',
			body: {
				theme,
				...( themeStyleVariation && { style_variation_slug: themeStyleVariation } ),
			},
		} );
	} catch ( error ) {
		//TODO: Manage error
	}
}
