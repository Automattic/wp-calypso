/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { NewSiteSuccessResponse, Site, CartItem } from '@automattic/data-stores';
import { guessTimezone, getLanguage } from '@automattic/i18n-utils';
import { setupSiteAfterCreation, isTailoredSignupFlow } from '@automattic/onboarding';
import debugFactory from 'debug';
import { getLocaleSlug } from 'i18n-calypso';
import { startsWith, isEmpty } from 'lodash';
import {
	updatePrivacyForDomain,
	supportsPrivacyProtectionPurchase,
} from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const Visibility = Site.Visibility;
const debug = debugFactory( 'calypso:signup:step-actions' );

interface GetNewSiteParams {
	flowToCheck: string;
	isPurchasingDomainItem: boolean;
	themeSlugWithRepo: string;
	siteUrl?: string;
	siteTitle: string;
	siteAccentColor: string;
	useThemeHeadstart: boolean;
	comingSoon: 0 | 1;
}

type NewSiteParams = {
	blog_title: string;
	public: Site.Visibility;
	blog_name: string;
	find_available_url: boolean;
	options: {
		designType: string;
		theme: string;
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

export const getNewSiteParams = ( {
	flowToCheck,
	isPurchasingDomainItem,
	themeSlugWithRepo,
	siteUrl,
	siteTitle,
	siteAccentColor,
	useThemeHeadstart = false,
	comingSoon,
}: GetNewSiteParams ) => {
	const useAutoGeneratedBlogName = ! siteUrl;

	// We will use the default annotation instead of theme annotation as fallback,
	// when segment and vertical values are not sent. Check pbAok1-p2#comment-834.
	const newSiteParams: NewSiteParams = {
		blog_name: useAutoGeneratedBlogName ? siteTitle : siteUrl.replace( '.wordpress.com', '' ),
		find_available_url: useAutoGeneratedBlogName ? true : !! isPurchasingDomainItem,
		blog_title: siteTitle,
		public: comingSoon ? Visibility.PublicNotIndexed : Visibility.PublicIndexed,
		options: {
			designType: '',
			theme: themeSlugWithRepo,
			use_theme_annotation: useThemeHeadstart,
			default_annotation_as_primary_fallback: true,
			site_segment: undefined,
			site_information: {
				title: siteTitle,
			},
			site_creation_flow: flowToCheck,
			timezone_string: guessTimezone(),
			wpcom_public_coming_soon: comingSoon,
			...( siteAccentColor && { site_accent_color: siteAccentColor } ),
		},
		validate: false,
	};

	return newSiteParams;
};

export const createSiteWithCart = async (
	flowName: string,
	isManageSiteFlow: boolean,
	userIsLoggedIn: boolean,
	isPurchasingDomainItem: boolean,
	themeSlugWithRepo: string,
	comingSoon: 1 | 0,
	siteTitle: string,
	siteAccentColor: string,
	useThemeHeadstart: boolean,
	productsList: Record< string, ProductListItem >,
	domainItem?: CartItem
) => {
	const siteUrl = domainItem?.meta;

	const newCartItems = [ domainItem ].filter( ( item ) => item );
	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' );
	// x	const bearerToken = get( getSignupDependencyStore( state ), 'bearer_token', null );

	if ( isManageSiteFlow ) {
		const siteSlugManaged = getSignupCompleteSlug();
		const newCartItems = [ domainItem ].filter( ( item ) => item );

		await processItemCart(
			newCartItems,
			siteSlugManaged,
			isFreeThemePreselected,
			themeSlugWithRepo,
			flowName,
			userIsLoggedIn,
			productsList
		);
		return;
	}

	const newSiteParams = getNewSiteParams( {
		flowToCheck: flowName,
		isPurchasingDomainItem,
		themeSlugWithRepo,
		siteUrl,
		siteTitle,
		siteAccentColor,
		useThemeHeadstart,
		comingSoon,
	} );

	// if ( isEmpty( bearerToken ) && 'onboarding-registrationless' === flowToCheck ) {
	// 	saveToLocalStorageAndProceed( state, domainItem, themeItem, newSiteParams, callback );
	// 	return;
	// }

	const locale = getLocaleSlug();

	const siteCreationResponse: NewSiteSuccessResponse = await wpcom.req.post( '/sites/new', {
		...newSiteParams,
		locale,
		lang_id: getLanguage( locale as string )?.value,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
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

	if ( isTailoredSignupFlow( flowName ) ) {
		await setupSiteAfterCreation( { siteId, flowName: flowName } );
	}

	await processItemCart(
		newCartItems,
		siteSlug,
		isFreeThemePreselected,
		themeSlugWithRepo,
		flowName,
		userIsLoggedIn,
		productsList
	);

	return providedDependencies;
};

function prepareItemForAddingToCart( item: CartItem, lastKnownFlow?: string ) {
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
	productsList: Record< string, ProductListItem >,
	cartItem: CartItem
) {
	if ( isEmpty( cartItem ) ) {
		// the user selected the free plan
		return;
	}

	const isFreeThemePreselected = startsWith( themeSlugWithRepo, 'pub' );
	const newCartItems = [ cartItem ].filter( ( item ) => item );

	await processItemCart(
		newCartItems,
		siteSlug,
		isFreeThemePreselected,
		themeSlugWithRepo,
		flowName,
		userIsLoggedIn,
		productsList
	);
}

const addPrivacyProtectionIfSupported = (
	item: CartItem,
	productsList: Record< string, ProductListItem >
) => {
	const { product_slug: productSlug } = item;
	const productListArray = Object.entries( productsList ).map(
		( [ , { product_slug, is_privacy_protection_product_purchase_allowed } ] ) => ( {
			product_slug,
			is_privacy_protection_product_purchase_allowed,
		} )
	);

	if (
		productSlug &&
		productsList &&
		supportsPrivacyProtectionPurchase( productSlug, productListArray )
	) {
		return updatePrivacyForDomain( item, true );
	}

	return item;
};

const addToCartAndProceed = async (
	newCartItems: CartItem[],
	siteSlug: string,
	flowName: string,
	productsList: Record< string, ProductListItem >
) => {
	const newCartItemsToAdd = newCartItems
		.map( ( item ) => addPrivacyProtectionIfSupported( item, productsList ) )
		.map( ( item ) => prepareItemForAddingToCart( item, flowName ) );

	if ( newCartItemsToAdd.length ) {
		debug( 'adding products to cart', newCartItemsToAdd );
		const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug );

		try {
			const updatedCart = await cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( newCartItemsToAdd );

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

export async function setThemeOnSite( siteSlug: string, themeSlugWithRepo: string ) {
	if ( isEmpty( themeSlugWithRepo ) ) {
		return;
	}

	const theme = themeSlugWithRepo.split( '/' )[ 1 ];

	try {
		await wpcom.req.post( `/sites/${ siteSlug }/themes/mine`, { theme } );
	} catch ( error ) {
		//TODO: Manage error
	}
}

async function processItemCart(
	newCartItems: CartItem[],
	siteSlug: string,
	isFreeThemePreselected: boolean,
	themeSlugWithRepo: string,
	lastKnownFlow: string,
	userIsLoggedIn: boolean,
	productsList: Record< string, ProductListItem >
) {
	if ( ! userIsLoggedIn && isFreeThemePreselected ) {
		await setThemeOnSite( siteSlug, themeSlugWithRepo );
		await addToCartAndProceed( newCartItems, siteSlug, lastKnownFlow, productsList );
	} else if ( userIsLoggedIn && isFreeThemePreselected ) {
		// fetchSitesAndUser(
		// 	siteSlug,
		// 	setThemeOnSite.bind( null, addToCartAndProceed, { siteSlug, themeSlugWithRepo } ),
		// 	reduxStore
		// );
		await setThemeOnSite( siteSlug, themeSlugWithRepo );
		await addToCartAndProceed( newCartItems, siteSlug, lastKnownFlow, productsList );
	} else if ( userIsLoggedIn && siteSlug ) {
		//fetchSitesAndUser( siteSlug, addToCartAndProceed, window.reduxStore );
		await addToCartAndProceed( newCartItems, siteSlug, lastKnownFlow, productsList );
	} else {
		await addToCartAndProceed( newCartItems, siteSlug, lastKnownFlow, productsList );
	}
}
