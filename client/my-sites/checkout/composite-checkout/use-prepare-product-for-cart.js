/**
 * External dependencies
 */
import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { getRenewalItemFromCartItem } from 'lib/cart-values/cart-items';
import {
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from 'lib/products-values/constants';
import { requestPlans } from 'state/plans/actions';
import { getPlanBySlug, getPlans, isRequestingPlans } from 'state/plans/selectors';
import { getProductsList, isProductsListFetching } from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { createItemToAddToCart } from './add-items';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-product-for-cart' );

export default function usePrepareProductsForCart( {
	siteId,
	product: productAlias,
	purchaseId: originalPurchaseId,
	isJetpackNotAtomic,
	isPrivate,
} ) {
	const planSlug = useSelector( ( state ) =>
		getUpgradePlanSlugFromPath( state, siteId, productAlias )
	);
	const [ { canInitializeCart, productsForCart }, setState ] = useState( {
		canInitializeCart: ! planSlug && ! productAlias,
		productsForCart: [],
	} );

	useFetchPlansIfNotLoaded();

	useAddPlanFromSlug( { planSlug, setState, isJetpackNotAtomic, originalPurchaseId } );
	useAddProductFromSlug( {
		productAlias,
		planSlug,
		setState,
		isJetpackNotAtomic,
		isPrivate,
		originalPurchaseId,
	} );
	useAddRenewalItems( { originalPurchaseId, productAlias, setState } );

	return { productsForCart, canInitializeCart };
}

function useAddRenewalItems( { originalPurchaseId, productAlias, setState } ) {
	const selectedSiteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );

	useEffect( () => {
		if ( ! originalPurchaseId ) {
			return;
		}
		if ( isFetchingProducts ) {
			debug( 'waiting on products fetch for renewal' );
			return;
		}
		const productSlugs = productAlias.split( ',' );
		const purchaseIds = originalPurchaseId.split( ',' );

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
					debug( 'no product found with slug', productSlug );
					return null;
				}
				return createRenewalItemToAddToCart(
					productSlug,
					product.product_id,
					subscriptionId,
					selectedSiteSlug
				);
			} )
			.filter( Boolean );
		debug( 'preparing renewals requested in url', productsForCart );
		setState( { productsForCart, canInitializeCart: true } );
	}, [
		isFetchingProducts,
		products,
		originalPurchaseId,
		productAlias,
		setState,
		selectedSiteSlug,
	] );
}

function useAddPlanFromSlug( { planSlug, setState, isJetpackNotAtomic, originalPurchaseId } ) {
	const isFetchingPlans = useSelector( ( state ) => isRequestingPlans( state ) );
	const plans = useSelector( ( state ) => getPlans( state ) );
	const plan = useSelector( ( state ) => getPlanBySlug( state, planSlug ) );
	useEffect( () => {
		if ( ! planSlug ) {
			return;
		}
		if ( isFetchingPlans || plans?.length < 1 ) {
			debug( 'waiting on plans fetch' );
			return;
		}
		if ( originalPurchaseId ) {
			// If this is a renewal, another hook will handle this
			return;
		}
		if ( ! plan ) {
			debug( 'there is a request to add a plan but no plan was found', planSlug );
			setState( { canInitializeCart: true } );
			return;
		}
		const cartProduct = createItemToAddToCart( {
			planSlug,
			product_id: plan.product_id,
			isJetpackNotAtomic,
		} );
		if ( ! cartProduct ) {
			debug( 'there is a request to add a plan but creating an item failed', planSlug );
			setState( { canInitializeCart: true } );
			return;
		}
		debug(
			'preparing plan that was requested in url',
			{ planSlug, plan, isJetpackNotAtomic },
			cartProduct
		);
		setState( { productsForCart: [ cartProduct ], canInitializeCart: true } );
	}, [ plans, originalPurchaseId, isFetchingPlans, planSlug, plan, isJetpackNotAtomic, setState ] );
}

function useAddProductFromSlug( {
	productAlias: productAliasFromUrl,
	planSlug,
	setState,
	isJetpackNotAtomic,
	isPrivate,
	originalPurchaseId,
} ) {
	const isFetchingPlans = useSelector( ( state ) => isRequestingPlans( state ) );
	const plans = useSelector( ( state ) => getPlans( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );

	// If `productAliasFromUrl` has a comma ',' in it, we will assume it's because it's
	// referencing more than one product. Because of this, the rest of this function will
	// work with an array of products even if `productAliasFromUrl` includes only one.
	const validProducts = useMemo(
		() =>
			productAliasFromUrl &&
			productAliasFromUrl
				.split( ',' )
				// Special treatment for Jetpack Search products
				.map( ( productAlias ) => getJetpackSearchForSite( productAlias, isJetpackNotAtomic ) )
				// Get the product information if it exists, and keep a reference to its product alias
				.map( ( productAlias ) => {
					const validProduct = products[ getProductSlugFromAlias( productAlias ) ];
					return validProduct ? { ...validProduct, product_alias: productAlias } : validProduct;
				} )
				// Remove plans since they are handled in another hook and there is no need to support
				// combinations of plans and products in the cart
				.filter(
					( product ) =>
						product && ! plans.find( ( plan ) => plan.product_slug === product.product_slug )
				),
		[ isJetpackNotAtomic, plans, productAliasFromUrl, products ]
	);

	useEffect( () => {
		if ( ! productAliasFromUrl ) {
			return;
		}
		if ( planSlug ) {
			// If we already found a matching plan, another hook will handle this
			return;
		}
		if ( originalPurchaseId ) {
			// If this is a renewal, another hook will handle this
			return;
		}
		if (
			isFetchingPlans ||
			isFetchingProducts ||
			plans?.length < 1 ||
			Object.keys( products || {} ).length < 1
		) {
			debug( 'waiting on products/plans fetch' );
			return;
		}
		if ( ! validProducts || validProducts.length < 1 ) {
			debug(
				'there is a request to add one ore more products but no product was found',
				productAliasFromUrl,
				validProducts
			);
			setState( { canInitializeCart: true } );
			return;
		}

		const cartProducts = validProducts.map( ( product ) =>
			createItemToAddToCart( {
				productAlias: product.product_alias,
				product_id: product.product_id,
				isJetpackNotAtomic,
				isPrivate,
			} )
		);

		if ( ! cartProducts || cartProducts.length < 1 ) {
			debug(
				'there is a request to add a one or more products but creating them failed',
				productAliasFromUrl
			);
			setState( { canInitializeCart: true } );
			return;
		}
		debug(
			'preparing products that were requested in url',
			{ productAliasFromUrl, isJetpackNotAtomic },
			cartProducts
		);
		setState( { productsForCart: cartProducts, canInitializeCart: true } );
	}, [
		isPrivate,
		plans,
		products,
		originalPurchaseId,
		isFetchingPlans,
		planSlug,
		isJetpackNotAtomic,
		productAliasFromUrl,
		validProducts,
		isFetchingProducts,
		setState,
	] );
}

export function useFetchProductsIfNotLoaded() {
	const reduxDispatch = useDispatch();
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );
	useEffect( () => {
		if ( ! isFetchingProducts && Object.keys( products || {} ).length < 1 ) {
			debug( 'fetching products list' );
			reduxDispatch( requestProductsList() );
			return;
		}
	}, [ isFetchingProducts, products, reduxDispatch ] );
}

function useFetchPlansIfNotLoaded() {
	const reduxDispatch = useDispatch();
	const isFetchingPlans = useSelector( ( state ) => isRequestingPlans( state ) );
	const plans = useSelector( ( state ) => getPlans( state ) );
	useEffect( () => {
		if ( ! isFetchingPlans && plans?.length < 1 ) {
			debug( 'fetching plans list' );
			reduxDispatch( requestPlans() );
			return;
		}
	}, [ isFetchingPlans, plans, reduxDispatch ] );
}

/**
 * @param {string | null} productAlias - A fake slug like 'theme:ovation'
 * @returns {string | null} A real slug like 'premium_theme'
 */
function getProductSlugFromAlias( productAlias ) {
	if ( productAlias?.startsWith?.( 'domain-mapping:' ) ) {
		return 'domain_map';
	}
	if ( productAlias?.startsWith?.( 'theme:' ) ) {
		return 'premium_theme';
	}
	if ( productAlias === 'concierge-session' ) {
		return 'concierge-session';
	}
	return productAlias;
}

function createRenewalItemToAddToCart( productAlias, productId, purchaseId, selectedSiteSlug ) {
	const [ slug, meta ] = productAlias.split( ':' );
	// See https://github.com/Automattic/wp-calypso/pull/15043 for explanation of
	// the no-ads alias (seems a little strange to me that the product slug is a
	// php file).
	const productSlug = slug === 'no-ads' ? 'no-adverts/no-adverts.php' : slug;

	if ( ! purchaseId ) {
		return null;
	}

	return getRenewalItemFromCartItem(
		{
			meta,
			product_slug: productSlug,
			product_id: productId,
		},
		{
			id: purchaseId,
			domain: selectedSiteSlug,
		}
	);
}

/*
 * Provides an special handling for search products: Always add Jetpack Search to
 * Jetpack sites and WPCOM Search to WordPress.com sites, regardless of
 * which slug was provided. This allows e.g. code on jetpack.com to
 * redirect to a valid checkout URL for a search purchase without worrying
 * about which type of site the user has.
 */
function getJetpackSearchForSite( productAlias, isJetpackNotAtomic ) {
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
