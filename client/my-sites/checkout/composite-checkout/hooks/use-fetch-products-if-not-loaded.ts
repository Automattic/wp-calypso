import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-product-for-cart' );

export default function useFetchProductsIfNotLoaded() {
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
