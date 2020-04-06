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
import {
	conciergeSessionItem,
	domainMapping,
	planItem,
	themeItem,
	jetpackProductItem,
	getRenewalItemFromCartItem,
} from 'lib/cart-values/cart-items';
import { requestPlans } from 'state/plans/actions';
import { getPlanBySlug, getPlans, isRequestingPlans } from 'state/plans/selectors';
import {
	getProductBySlug,
	getProductsList,
	isProductsListFetching,
} from 'state/products-list/selectors';
import { requestProductsList } from 'state/products-list/actions';
import getUpgradePlanSlugFromPath from 'state/selectors/get-upgrade-plan-slug-from-path';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-product-for-cart' );

export default function usePrepareProductsForCart( {
	siteId,
	product: productAlias,
	purchaseId: originalPurchaseId,
	isJetpackNotAtomic,
} ) {
	const planSlug = useSelector( state =>
		getUpgradePlanSlugFromPath( state, siteId, productAlias )
	);
	const [ { canInitializeCart, productsForCart }, setState ] = useState( {
		canInitializeCart: ! planSlug && ! productAlias,
		productsForCart: [],
	} );

	useFetchProductsIfNotLoaded();
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
	const selectedSiteSlug = useSelector( state => getSelectedSiteSlug( state ) );
	const isFetchingProducts = useSelector( state => isProductsListFetching( state ) );
	const products = useSelector( state => getProductsList( state ) );

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
	const isFetchingPlans = useSelector( state => isRequestingPlans( state ) );
	const plan = useSelector( state => getPlanBySlug( state, planSlug ) );
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
	const isFetchingPlans = useSelector( state => isRequestingPlans( state ) );
	const isFetchingProducts = useSelector( state => isProductsListFetching( state ) );
	const product = useSelector( state =>
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

function useFetchProductsIfNotLoaded() {
	const reduxDispatch = useDispatch();
	const isFetchingProducts = useSelector( state => isProductsListFetching( state ) );
	const products = useSelector( state => getProductsList( state ) );
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
	const isFetchingPlans = useSelector( state => isRequestingPlans( state ) );
	const plans = useSelector( state => getPlans( state ) );
	useEffect( () => {
		if ( ! isFetchingPlans && plans?.length < 1 ) {
			debug( 'fetching plans list' );
			reduxDispatch( requestPlans() );
			return;
		}
	}, [ isFetchingPlans, plans, reduxDispatch ] );
}

function getProductSlugFromAlias( productAlias ) {
	if ( productAlias?.startsWith?.( 'domain-mapping:' ) ) {
		return 'domain_map';
	}
	return null;
}

/**
 * Create and return an object to be added to the cart
 *
 * @returns ResponseCartProduct | null
 */
function createItemToAddToCart( {
	planSlug = null,
	productAlias = '',
	product_id = null,
	isJetpackNotAtomic = false,
} ) {
	let cartItem, cartMeta;

	if ( planSlug && product_id ) {
		debug( 'creating plan product' );
		cartItem = planItem( planSlug );
		cartItem.product_id = product_id;
	}

	if ( productAlias.startsWith( 'theme:' ) ) {
		debug( 'creating theme product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = themeItem( cartMeta );
	}

	if ( productAlias.startsWith( 'domain-mapping:' ) && product_id ) {
		debug( 'creating domain mapping product' );
		cartMeta = productAlias.split( ':' )[ 1 ];
		cartItem = domainMapping( { domain: cartMeta } );
		cartItem.product_id = product_id;
	}

	if ( productAlias.startsWith( 'concierge-session' ) ) {
		// TODO: prevent adding a conciergeSessionItem if one already exists
		debug( 'creating concierge product' );
		cartItem = conciergeSessionItem();
	}

	if (
		( productAlias.startsWith( 'jetpack_backup' ) ||
			productAlias.startsWith( 'jetpack_search' ) ) &&
		isJetpackNotAtomic
	) {
		debug( 'creating jetpack product' );
		cartItem = jetpackProductItem( productAlias );
	}

	if ( ! cartItem ) {
		debug( 'no product created' );
		return null;
	}

	cartItem.extra = { ...cartItem.extra, context: 'calypstore' };

	cartItem.uuid = 'unknown'; // This must be filled-in later

	return cartItem;
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
