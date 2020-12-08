/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'calypso/state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { TERM_MONTHLY } from 'calypso/lib/plans/constants';
import {
	getSiteAvailableProductCost,
	isRequestingSiteProducts,
} from 'calypso/state/sites/products/selectors';
import {
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from 'calypso/lib/products-values/constants';

/**
 * Type dependencies
 */
import type { SelectorProduct } from './types';

interface ItemPrices {
	isFetching: boolean | null;
	originalPrice: number;
	discountedPrice?: number;
}

interface ItemRawPrices {
	isFetching: boolean | null;
	itemCost: number | null;
	monthlyItemCost: number | null;
}

const useProductListItemPrices = (
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemRawPrices => {
	const isFetching = useSelector( ( state ) => !! isProductsListFetching( state ) );
	const itemCost =
		useSelector(
			( state ) => item && getProductCost( state, item.costProductSlug || item.productSlug )
		) || null;
	const monthlyItemCost =
		useSelector( ( state ) => getProductCost( state, monthlyItemSlug ) ) || null;

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
	};
};

const useSiteAvailableProductPrices = (
	siteId: number | null,
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemRawPrices => {
	const isFetching =
		useSelector( ( state ) => siteId && !! isRequestingSiteProducts( state, siteId ) ) || null;
	const itemCost =
		useSelector(
			( state ) =>
				siteId &&
				item &&
				getSiteAvailableProductCost( state, siteId, item.costProductSlug || item.productSlug )
		) || null;
	const monthlyItemCost =
		useSelector(
			( state ) => siteId && getSiteAvailableProductCost( state, siteId, monthlyItemSlug )
		) || null;

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
	};
};

const useItemPrice = (
	siteId: number | null,
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemPrices => {
	const listPrices = useProductListItemPrices( item, monthlyItemSlug );
	const sitePrices = useSiteAvailableProductPrices( siteId, item, monthlyItemSlug );

	const isFetching = siteId ? sitePrices.isFetching : listPrices.isFetching;
	const itemCost = siteId ? sitePrices.itemCost : listPrices.itemCost;
	const monthlyItemCost = siteId ? sitePrices.monthlyItemCost : listPrices.monthlyItemCost;

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

	// Jetpack CRM price won't come from the API, so we need to hard-code it for now.
	if ( item && [ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ].includes( item.productSlug ) ) {
		discountedPrice = item.displayPrice || -1;
		originalPrice = item.displayPrice || -1;
	}

	return {
		isFetching,
		originalPrice,
		discountedPrice,
	};
};

export default useItemPrice;
