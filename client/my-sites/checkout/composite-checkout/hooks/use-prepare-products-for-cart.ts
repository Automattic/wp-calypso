/**
 * External dependencies
 */
import { useEffect, useMemo, useReducer } from 'react';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import type { RequestCartProduct } from '@automattic/shopping-cart';
import { createRequestCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from 'calypso/lib/products-values/constants';
import { getPlanByPathSlug } from 'calypso/lib/plans';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';
import useFetchProductsIfNotLoaded from './use-fetch-products-if-not-loaded';
import doesValueExist from '../lib/does-value-exist';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-products-for-cart' );

interface PreparedProductsForCart {
	productsForCart: RequestCartProduct[];
	isLoading: boolean;
	error: string | null;
}

const initialPreparedProductsState = {
	isLoading: true,
	productsForCart: [],
	error: null,
};

export default function usePrepareProductsForCart( {
	productAliasFromUrl,
	purchaseId: originalPurchaseId,
	isJetpackNotAtomic,
	isPrivate,
}: {
	productAliasFromUrl: string | null | undefined;
	purchaseId: string | number | null | undefined;
	isJetpackNotAtomic: boolean;
	isPrivate: boolean;
} ): PreparedProductsForCart {
	const initializePreparedProductsState = (
		initialState: PreparedProductsForCart
	): PreparedProductsForCart => ( {
		...initialState,
		isLoading: !! productAliasFromUrl,
	} );
	const [ state, dispatch ] = useReducer(
		preparedProductsReducer,
		initialPreparedProductsState,
		initializePreparedProductsState
	);
	debug(
		'preparing products for cart from url string',
		productAliasFromUrl,
		'and purchase id',
		originalPurchaseId
	);

	useFetchProductsIfNotLoaded();

	const addHandler = chooseAddHandler( {
		isLoading: state.isLoading,
		originalPurchaseId,
		productAliasFromUrl,
	} );

	// Only one of these should ever operate. The others should bail if they
	// think another hook will handle the data.
	useAddProductFromSlug( {
		productAliasFromUrl,
		dispatch,
		isJetpackNotAtomic,
		isPrivate,
		addHandler,
	} );
	useAddRenewalItems( {
		originalPurchaseId,
		productAlias: productAliasFromUrl,
		dispatch,
		addHandler,
	} );

	return state;
}

type PreparedProductsAction =
	| { type: 'PRODUCTS_ADD'; products: RequestCartProduct[] }
	| { type: 'RENEWALS_ADD'; products: RequestCartProduct[] }
	| { type: 'PRODUCTS_ADD_ERROR'; message: string };

function preparedProductsReducer(
	state: PreparedProductsForCart,
	action: PreparedProductsAction
): PreparedProductsForCart {
	switch ( action.type ) {
		case 'RENEWALS_ADD':
		// fall through
		case 'PRODUCTS_ADD':
			if ( ! state.isLoading ) {
				return state;
			}
			return { ...state, productsForCart: action.products, isLoading: false };
		case 'PRODUCTS_ADD_ERROR':
			if ( ! state.isLoading ) {
				return state;
			}
			return { ...state, isLoading: false, error: action.message };
		default:
			return state;
	}
}

type AddHandler = 'addProductFromSlug' | 'addRenewalItems' | 'doNotAdd';

function chooseAddHandler( {
	isLoading,
	originalPurchaseId,
	productAliasFromUrl,
}: {
	isLoading: boolean;
	originalPurchaseId: string | number | null | undefined;
	productAliasFromUrl: string | null | undefined;
} ): AddHandler {
	if ( ! isLoading ) {
		return 'doNotAdd';
	}

	if ( isLoading && originalPurchaseId ) {
		return 'addRenewalItems';
	}

	if ( isLoading && ! originalPurchaseId && productAliasFromUrl ) {
		return 'addProductFromSlug';
	}

	return 'doNotAdd';
}

function useAddRenewalItems( {
	originalPurchaseId,
	productAlias,
	dispatch,
	addHandler,
}: {
	originalPurchaseId: string | number | null | undefined;
	productAlias: string | null | undefined;
	dispatch: ( action: PreparedProductsAction ) => void;
	addHandler: AddHandler;
} ) {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isFetchingProducts = useSelector( isProductsListFetching );
	const products = useSelector( getProductsList );
	const translate = useTranslate();

	useEffect( () => {
		if ( addHandler !== 'addRenewalItems' ) {
			return;
		}
		if ( isFetchingProducts || Object.keys( products || {} ).length < 1 ) {
			debug( 'waiting on products fetch for renewal' );
			return;
		}
		const productSlugs = productAlias?.split( ',' ) ?? [];
		const purchaseIds = originalPurchaseId ? String( originalPurchaseId ).split( ',' ) : [];

		const productsForCart = purchaseIds
			.map( ( subscriptionId, currentIndex ) => {
				const productSlug = productSlugs[ currentIndex ];
				if ( ! productSlug ) {
					return null;
				}
				let [ slug ] = productSlug.split( ':' );

				// See https://github.com/Automattic/wp-calypso/pull/15043 for explanation of
				// the no-ads alias (seems a little strange to me that the product slug is a
				// php file).
				slug = slug === 'no-ads' ? 'no-adverts/no-adverts.php' : slug;

				const product = products[ slug ];
				if ( ! product ) {
					debug( 'no renewal product found with slug', productSlug );
					dispatch( {
						type: 'PRODUCTS_ADD_ERROR',
						message: String(
							translate(
								"I tried and failed to create a renewal product matching the identifier '%(productSlug)s'",
								{
									args: { productSlug },
								}
							)
						),
					} );
					return null;
				}
				return createRenewalItemToAddToCart(
					productSlug,
					product.product_id,
					subscriptionId,
					selectedSiteSlug
				);
			} )
			.filter( doesValueExist );

		if ( productsForCart.length < 1 ) {
			debug( 'creating renewal products failed', productAlias );
			dispatch( {
				type: 'PRODUCTS_ADD_ERROR',
				message: String(
					translate(
						"I tried and failed to create products matching the identifier '%(productAlias)s'",
						{
							args: { productAlias },
						}
					)
				),
			} );
			return;
		}
		debug( 'preparing renewals requested in url', productsForCart );
		dispatch( { type: 'RENEWALS_ADD', products: productsForCart } );
	}, [
		addHandler,
		translate,
		isFetchingProducts,
		products,
		originalPurchaseId,
		productAlias,
		dispatch,
		selectedSiteSlug,
	] );
}

function useAddProductFromSlug( {
	productAliasFromUrl,
	dispatch,
	isJetpackNotAtomic,
	isPrivate,
	addHandler,
}: {
	productAliasFromUrl: string | undefined | null;
	dispatch: ( action: PreparedProductsAction ) => void;
	isJetpackNotAtomic: boolean;
	isPrivate: boolean;
	addHandler: AddHandler;
} ) {
	const products: Record<
		string,
		{
			product_id: number;
			product_slug: string;
		}
	> = useSelector( getProductsList );
	const translate = useTranslate();

	// If `productAliasFromUrl` has a comma ',' in it, we will assume it's because it's
	// referencing more than one product. Because of this, the rest of this function will
	// work with an array of products even if `productAliasFromUrl` includes only one.
	const validProducts = useMemo(
		() =>
			productAliasFromUrl
				?.split( ',' )
				// Special treatment for Jetpack Search products
				.map( ( productAlias ) => getJetpackSearchForSite( productAlias, isJetpackNotAtomic ) )
				// Get the product information if it exists, and keep a reference to
				// its product alias which we may need to get additional information like
				// the domain name or theme (eg: 'theme:ovation').
				.map( ( productAlias ) => {
					const validProduct = products[ getProductSlugFromAlias( productAlias ) ];
					return validProduct
						? { ...validProduct, internal_product_alias: productAlias }
						: undefined;
				} )
				.filter( doesValueExist ) ?? [],
		[ isJetpackNotAtomic, productAliasFromUrl, products ]
	);

	useEffect( () => {
		if ( addHandler !== 'addProductFromSlug' ) {
			return;
		}
		// There is a selector for isFetchingProducts, but it seems to be sometimes
		// inaccurate (possibly before the fetch has started) so instead we just
		// wait for there to be products.
		if ( Object.keys( products || {} ).length < 1 ) {
			debug( 'waiting on products fetch' );
			return;
		}

		const cartProducts = validProducts.map( ( product ) =>
			// Transform the product data into a RequestCartProduct
			createItemToAddToCart( {
				productSlug: product.product_slug,
				productAlias: product.internal_product_alias,
				productId: product.product_id,
			} )
		);

		if ( cartProducts.length < 1 ) {
			debug(
				'there is a request to add a one or more products but creating them failed',
				productAliasFromUrl
			);
			dispatch( {
				type: 'PRODUCTS_ADD_ERROR',
				message: String(
					translate(
						"I tried and failed to create products matching the identifier '%(productAlias)s'",
						{
							args: { productAlias: productAliasFromUrl },
						}
					)
				),
			} );
			return;
		}
		debug(
			'preparing products that were requested in url',
			{ productAliasFromUrl, isJetpackNotAtomic },
			cartProducts
		);
		dispatch( { type: 'PRODUCTS_ADD', products: cartProducts } );
	}, [
		addHandler,
		translate,
		isPrivate,
		products,
		isJetpackNotAtomic,
		productAliasFromUrl,
		validProducts,
		dispatch,
	] );
}

// Transform a fake slug like 'theme:ovation' into a real slug like 'premium_theme'
function getProductSlugFromAlias( productAlias: string ): string {
	if ( productAlias.startsWith( 'domain-mapping:' ) ) {
		return 'domain_map';
	}
	if ( productAlias.startsWith( 'theme:' ) ) {
		return 'premium_theme';
	}
	if ( productAlias === 'no-ads' ) {
		return 'no-adverts/no-adverts.php';
	}
	const plan = getPlanByPathSlug( productAlias );
	const planSlug = plan?.getStoreSlug();
	if ( planSlug ) {
		return planSlug;
	}
	return productAlias;
}

function createRenewalItemToAddToCart(
	productAlias: string,
	productId: string | number,
	purchaseId: string | number | undefined | null,
	selectedSiteSlug: string | null
): RequestCartProduct | null {
	const [ slug, meta ] = productAlias.split( ':' );
	// See https://github.com/Automattic/wp-calypso/pull/15043 for explanation of
	// the no-ads alias (seems a little strange to me that the product slug is a
	// php file).
	const productSlug = slug === 'no-ads' ? 'no-adverts/no-adverts.php' : slug;

	if ( ! purchaseId ) {
		return null;
	}

	const renewalItemExtra = {
		purchaseId: String( purchaseId ),
		purchaseDomain: selectedSiteSlug ? String( selectedSiteSlug ) : undefined,
		purchaseType: 'renewal',
	};
	return {
		meta,
		quantity: null,
		volume: 1,
		product_slug: productSlug,
		product_id: parseInt( String( productId ), 10 ),
		extra: renewalItemExtra,
	};
}

/*
 * Provides an special handling for search products: Always add Jetpack Search to
 * Jetpack sites and WPCOM Search to WordPress.com sites, regardless of
 * which slug was provided. This allows e.g. code on jetpack.com to
 * redirect to a valid checkout URL for a search purchase without worrying
 * about which type of site the user has.
 */
function getJetpackSearchForSite( productAlias: string, isJetpackNotAtomic: boolean ): string {
	if ( productAlias && JETPACK_SEARCH_PRODUCTS.includes( productAlias ) ) {
		if ( isJetpackNotAtomic ) {
			productAlias = productAlias.includes( 'monthly' )
				? PRODUCT_JETPACK_SEARCH_MONTHLY
				: PRODUCT_JETPACK_SEARCH;
		} else {
			productAlias = productAlias.includes( 'monthly' )
				? PRODUCT_WPCOM_SEARCH_MONTHLY
				: PRODUCT_WPCOM_SEARCH;
		}
	}
	return productAlias;
}

function createItemToAddToCart( {
	productSlug,
	productAlias,
	productId,
}: {
	productSlug: string;
	productId: number;
	productAlias: string;
} ): RequestCartProduct {
	debug( 'creating product with', productSlug, productAlias, productId );

	if ( productAlias.startsWith( 'theme:' ) ) {
		debug( 'creating theme product' );
		const cartMeta = productAlias.split( ':' )[ 1 ];
		return addContextToProduct(
			createRequestCartProduct( {
				product_id: productId,
				product_slug: productSlug,
				meta: cartMeta,
			} )
		);
	}

	if ( productAlias.startsWith( 'domain-mapping:' ) ) {
		debug( 'creating domain mapping product' );
		const cartMeta = productAlias.split( ':' )[ 1 ];
		return addContextToProduct(
			createRequestCartProduct( {
				product_id: productId,
				product_slug: productSlug,
				meta: cartMeta,
			} )
		);
	}

	return addContextToProduct(
		createRequestCartProduct( {
			product_id: productId,
			product_slug: productSlug,
		} )
	);
}

function addContextToProduct( product: RequestCartProduct ): RequestCartProduct {
	return {
		...product,
		extra: { ...product.extra, context: 'calypstore' },
	};
}
