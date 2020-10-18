/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { isProductsListFetching, getProductsList } from 'calypso/state/products-list/selectors';
import {
	isRequestingSiteProducts,
	getAvailableProductsBySiteId,
} from 'calypso/state/sites/products/selectors';

type RawData = {
	isFetching: boolean | null;
	products: object[] | null;
};

const useProductListData = (): RawData => {
	const isFetching = useSelector( ( state ) => !! isProductsListFetching( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );

	return {
		isFetching,
		products,
	};
};

const useSiteAvailableProductData = ( siteId: number | null ): RawData => {
	const isFetching =
		useSelector( ( state ) => siteId && !! isRequestingSiteProducts( state, siteId ) ) || null;
	const products =
		useSelector( ( state ) => siteId && getAvailableProductsBySiteId( state, siteId )?.data ) ||
		null;

	return {
		isFetching,
		products,
	};
};

const useIsLoading = ( siteId: number | null ): boolean => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const listData = useProductListData();
	const siteData = useSiteAvailableProductData( siteId );
	const isFetching = siteId ? siteData.isFetching : listData.isFetching;
	const products = siteId ? siteData.products : listData.products;

	return !! ( ! currencyCode || ( isFetching && ! products ) );
};

export default useIsLoading;
