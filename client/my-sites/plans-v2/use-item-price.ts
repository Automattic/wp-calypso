/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'state/products-list/selectors/get-product-cost';
import { TERM_MONTHLY } from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { SelectorProduct } from './types';

interface ItemPrices {
	isFetching: boolean;
	originalPrice: number;
	discountedPrice?: number;
}

const useItemPrice = ( item: SelectorProduct | null, monthlyItemSlug = '' ): ItemPrices => {
	const isFetching = useSelector( ( state ) => !! isProductsListFetching( state ) );
	const itemCost = useSelector(
		( state ) => item && getProductCost( state, item.costProductSlug || item.productSlug )
	);
	const monthlyItemCost = useSelector( ( state ) => getProductCost( state, monthlyItemSlug ) );

	if ( isFetching ) {
		return {
			isFetching,
			originalPrice: 0,
		};
	}

	let originalPrice = 0;
	let discountedPrice = undefined;
	if ( item && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost;
			discountedPrice = itemCost / 12;
		}
	}

	return {
		isFetching,
		originalPrice,
		discountedPrice,
	};
};

export default useItemPrice;
