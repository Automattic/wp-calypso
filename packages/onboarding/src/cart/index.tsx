import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { DomainSuggestion, NewSiteSuccessResponse, Site } from '@automattic/data-stores';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { getLocaleSlug } from 'i18n-calypso';
import { startsWith, isEmpty } from 'lodash';
import wpcomRequest from 'wpcom-proxy-request';
import {
	setupSiteAfterCreation,
	isTailoredSignupFlow,
	isImportFocusedFlow,
	HUNDRED_YEAR_PLAN_FLOW,
	isAnyHostingFlow,
} from '../';
import cartManagerClient from './create-cart-manager-client';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const debug = debugFactory( 'calypso:signup:step-actions' );

interface GetNewSiteParams {
	flowToCheck: string;
	isPurchasingDomainItem: boolean;
	themeSlugWithRepo: string;
	siteUrl?: string;
	siteTitle: string;
	siteAccentColor: string;
	useThemeHeadstart: boolean;
	siteVisibility: Site.Visibility;
	username: string;
	sourceSlug?: string;
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
	};
	validate: boolean;
};

const getBlogNameGenerationParams = ( {
	siteUrl,
	siteTitle,
	flowToCheck,
	username,
	isPurchasingDomainItem,
}: GetNewSiteParams ) => {
	if ( siteUrl ) {
		const blog_name = siteUrl.replace( '.wordpress.com', '' );

		if ( isImportFocusedFlow( flowToCheck ) ) {
			return {
				blog_name,
				find_available_url: true,
			};
		}

		return {
			blog_name,
			find_available_url: !! isPurchasingDomainItem,
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
		},
		validate: false,
	};

	return newSiteParams;
};

export const createSiteWithCart = async (
	flowName: string,
	userIsLoggedIn: boolean,
	isPurchasingDomainItem: boolean,
	themeSlugWithRepo: string,
	siteVisibility: Site.Visibility,
	siteTitle: string,
	siteAccentColor: string,
	useThemeHeadstart: boolean,
	username: string,
	domainItem?: DomainSuggestion,
	domainCartItem?: MinimalRequestCartProduct,
	sourceSlug?: string
) => {
	const siteUrl = domainItem?.domain_name;
	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' );

	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		isPurchasingDomainItem,
		themeSlugWithRepo,
		siteUrl,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart,
		siteVisibility,
		username,
		sourceSlug,
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
			options: {
				...newSiteParams.options,
				has_segmentation_survey: hasSegmentationSurvey,
				...( hasSegmentationSurvey && segmentationSurveyAnswersAnonId
					? { segmentation_survey_answers_anon_id: segmentationSurveyAnswersAnonId }
					: {} ),
			},
		},
	} );

	if ( ! siteCreationResponse.success ) {
		// TODO ebuccelli: Manage siteCreationResponse.errors
		return;
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

	await processItemCart(
		siteSlug,
		isFreeThemePreselected,
		themeSlugWithRepo,
		flowName,
		userIsLoggedIn,
		domainCartItem
	);

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

async function processItemCart(
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
