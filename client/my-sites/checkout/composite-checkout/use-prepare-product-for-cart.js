/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { getRenewalItemFromCartItem } from 'lib/cart-values/cart-items';
import { requestPlans } from 'state/plans/actions';
import { getPlanBySlug, getPlans, isRequestingPlans } from 'state/plans/selectors';
import {
	getProductBySlug,
	getProductsList,
	isProductsListFetching,
} from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';
import { createItemToAddToCart } from './add-items';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-product-for-cart' );

export default function usePrepareProductsForCart( {
	siteId,
	product: productAlias,
	purchaseId: originalPurchaseId,
	isJetpackNotAtomic,
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
				const [ slug ] = productSlug.split( ':' );
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
	const plan = useSelector( ( state ) => getPlanBySlug( state, planSlug ) );
	useEffect( () => {
		if ( ! planSlug || isFetchingPlans ) {
			return;
		}
		if ( isFetchingPlans ) {
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
	}, [ originalPurchaseId, isFetchingPlans, planSlug, plan, isJetpackNotAtomic, setState ] );
}

function useAddProductFromSlug( {
	productAlias,
	planSlug,
	setState,
	isJetpackNotAtomic,
	originalPurchaseId,
} ) {
	const isFetchingPlans = useSelector( ( state ) => isRequestingPlans( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const product = useSelector( ( state ) =>
		getProductBySlug( state, getProductSlugFromAlias( productAlias ) )
	);

	useEffect( () => {
		if ( ! productAlias ) {
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
		if ( isFetchingPlans || isFetchingProducts ) {
			debug( 'waiting on products/plans fetch' );
			return;
		}
		if ( ! product ) {
			debug( 'there is a request to add a product but no product was found', productAlias );
			setState( { canInitializeCart: true } );
			return;
		}
		const cartProduct = createItemToAddToCart( {
			productAlias,
			product_id: product.product_id,
			isJetpackNotAtomic,
		} );
		if ( ! cartProduct ) {
			debug( 'there is a request to add a product but creating an item failed', productAlias );
			setState( { canInitializeCart: true } );
			return;
		}
		debug(
			'preparing product that was requested in url',
			{ productAlias, isJetpackNotAtomic },
			cartProduct
		);
		setState( { productsForCart: [ cartProduct ], canInitializeCart: true } );
	}, [
		originalPurchaseId,
		isFetchingPlans,
		planSlug,
		isJetpackNotAtomic,
		productAlias,
		product,
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
	return null;
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
