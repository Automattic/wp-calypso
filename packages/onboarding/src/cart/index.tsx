import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import { SiteGoal } from '@automattic/data-stores/src/onboard';
import { getTld } from '@automattic/domain-search';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { getLocaleSlug } from 'i18n-calypso';
import { startsWith, isEmpty } from 'lodash';
import wpcomRequest from 'wpcom-proxy-request';
import {
	setupSiteAfterCreation,
	isTailoredSignupFlow,
	HUNDRED_YEAR_PLAN_FLOW,
	isAnyHostingFlow,
	AI_SITE_BUILDER_FLOW,
} from '../';
import cartManagerClient from './create-cart-manager-client';
import type { DomainSuggestion } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:signup:step-actions' );

interface GetNewSiteParams {
	flowToCheck: string;
	themeSlugWithRepo: string;
	siteUrl?: string;
	siteTitle: string;
	siteAccentColor: string;
	useThemeHeadstart: boolean;
	siteVisibility: Site.Visibility;
	username: string;
	partnerBundle: string | null;
	sourceSlug?: string;
	siteIntent?: string;
	blueprint?: string | null;
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
		blueprint?: string;
	};
	validate: boolean;
};

const getBlogNameGenerationParams = ( {
	siteUrl,
	siteTitle,
	flowToCheck,
	username,
}: GetNewSiteParams ) => {
	if ( siteUrl ) {
		const blogName = siteUrl.replace( '.wordpress.com', '' );

		return {
			blog_name: blogName,
			// If there is a TLD we need to find an underlying free subdomain in case the user wants to skip checkout.
			find_available_url: !! getTld( blogName ),
		};
	}

	if ( siteTitle ) {
		return {
			blog_name: siteTitle,
			find_available_url: true,
		};
	}

	if ( isAnyHostingFlow( flowToCheck ) ) {
		return {
			blog_name: '',
			find_available_url: true,
		};
	}

	return {
		blog_name: username,
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
		blueprint,
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
			...( blueprint && { blueprint: blueprint } ),
		},
		validate: false,
	};

	return newSiteParams;
};

export const createSiteWithCart = async (
	flowName: string,
	userIsLoggedIn: boolean,
	themeSlugWithRepo: string,
	siteVisibility: Site.Visibility,
	siteTitle: string,
	siteAccentColor: string,
	useThemeHeadstart: boolean,
	username: string,
	domainCartItems: MinimalRequestCartProduct[],
	partnerBundle: string | null,
	storedSiteUrl?: string,
	domainItem?: DomainSuggestion,
	sourceSlug?: string,
	siteIntent?: string,
	siteGoals?: SiteGoal[],
	gardenName?: string | null,
	gardenPartnerName?: string | null,
	specId?: string | null,
	blueprint?: string | null
) => {
	const siteUrl = storedSiteUrl || domainItem?.domain_name;
	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' );

	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		themeSlugWithRepo,
		siteUrl,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart,
		siteVisibility,
		username,
		sourceSlug,
		siteIntent,
		partnerBundle,
		blueprint,
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

	const siteCreationResponse: NewSiteSuccessResponse = await wpcomRequest( {
		path: '/sites/new',
		apiVersion: '1.1',
		method: 'POST',
		body: {
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
				...( refParam && { ref: refParam } ),
				// Trigger backend build for ai-site-builder flow with commerce garden and spec_id
				...( flowName === AI_SITE_BUILDER_FLOW &&
					gardenName === 'commerce' &&
					specId && {
						trigger_backend_build: true,
					} ),
			},
		},
	} );

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

	if ( domainCartItems.length ) {
		for ( const domainCartItem of domainCartItems ) {
			await processItemCart(
				siteSlug,
				isFreeThemePreselected,
				themeSlugWithRepo,
				flowName,
				userIsLoggedIn,
				domainCartItem
			);
		}
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

export async function addPlanToCart(
	siteSlug: string,
	flowName: string,
	userIsLoggedIn: boolean,
	themeSlugWithRepo: string,
	cartItem: MinimalRequestCartProduct
) {
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		return;
	}

	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' );

	await processItemCart(
		siteSlug,
		isFreeThemePreselected,
		themeSlugWithRepo,
		flowName,
		userIsLoggedIn,
		cartItem
	);
}

export async function replaceProductsInCart(
	siteSlug: string,
	cartItems: MinimalRequestCartProduct[]
) {
	const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );

	try {
		const updatedCart = await cartManagerClient
			.forCartKey( cartKey )
			.actions.replaceProductsInCart( cartItems );

		debug( 'product replace request complete', updatedCart );
	} catch ( error ) {
		debug( 'product replace request had an error', error );
	}
}

const addToCartAndProceed = async (
	newCartItem: MinimalRequestCartProduct,
	siteSlug: string,
	flowName: string
) => {
	const cartItem = prepareItemForAddingToCart( newCartItem, flowName );

	if ( cartItem ) {
		debug( 'adding products to cart', cartItem );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );

		try {
			const updatedCart = await cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( [ cartItem ] );

			debug( 'product add request complete', updatedCart );
		} catch ( error ) {
			debug( 'product add request had an error', error );
			//TODO Manage error
			// reduxStore.dispatch( errorNotice( error.message ) );
		}
	} else {
		debug( 'no cart items to add' );
	}
};

export async function addProductsToCart(
	siteSlug: string,
	flowName: string,
	cartItems: MinimalRequestCartProduct[] | null
) {
	if ( Array.isArray( cartItems ) ) {
		const cartItemsToAdd = cartItems.map( ( cartItem ) =>
			prepareItemForAddingToCart( cartItem, flowName )
		);

		debug( 'adding products to cart', cartItems );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );

		try {
			const updatedCart = await cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( cartItemsToAdd );

			debug( 'product add request complete', updatedCart );
		} catch ( error ) {
			debug( 'product add request had an error', error );
		}
	}
}

export async function setThemeOnSite(
	siteSlug: string,
	themeSlugWithRepo: string,
	themeStyleVariation?: string
) {
	if ( isEmpty( themeSlugWithRepo ) ) {
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

export async function processItemCart(
	siteSlug: string,
	isFreeThemePreselected: boolean,
	themeSlugWithRepo: string,
	lastKnownFlow: string,
	userIsLoggedIn: boolean,
	newCartItem?: MinimalRequestCartProduct
) {
	if ( ! userIsLoggedIn && isFreeThemePreselected ) {
		await setThemeOnSite( siteSlug, themeSlugWithRepo );
		newCartItem && ( await addToCartAndProceed( newCartItem, siteSlug, lastKnownFlow ) );
	} else if ( userIsLoggedIn && isFreeThemePreselected ) {
		await setThemeOnSite( siteSlug, themeSlugWithRepo );
		newCartItem && ( await addToCartAndProceed( newCartItem, siteSlug, lastKnownFlow ) );
	} else {
		newCartItem && ( await addToCartAndProceed( newCartItem, siteSlug, lastKnownFlow ) );
	}
}
