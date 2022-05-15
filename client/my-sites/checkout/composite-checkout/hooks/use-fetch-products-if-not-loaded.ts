import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { fetchSiteProducts } from 'calypso/state/sites/products/actions';
import {
	isRequestingSiteProducts,
	hasLoadedSiteProductsFromServer,
} from 'calypso/state/sites/products/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:composite-checkout:use-prepare-product-for-cart' );

export default function useFetchProductsIfNotLoaded() {
	const reduxDispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const isFetchingProductsList = useSelector( ( state ) => isProductsListFetching( state ) );
	const productsList = useSelector( ( state ) => getProductsList( state ) );

	const isFetchingSiteProducts = useSelector( ( state ) =>
		isRequestingSiteProducts( state, siteId )
	);
	const hasLoadedSiteProducts = useSelector( ( state ) =>
		hasLoadedSiteProductsFromServer( state, siteId )
	);

	useEffect( () => {
		if ( ! isFetchingProductsList && Object.keys( productsList || {} ).length < 1 ) {
			debug( 'fetching products list' );
			reduxDispatch( requestProductsList() );
			return;
		}
	}, [ isFetchingProductsList, productsList, reduxDispatch ] );

	useEffect( () => {
		if ( siteId && ! isFetchingSiteProducts && ! hasLoadedSiteProducts ) {
			debug( 'fetching site products' );
			reduxDispatch( fetchSiteProducts( siteId ) );
			return;
		}
	}, [ siteId, isFetchingSiteProducts, hasLoadedSiteProducts, reduxDispatch ] );
}
