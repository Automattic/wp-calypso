import {
	TERM_MONTHLY,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getProductPriceTierList } from 'calypso/state/products-list/selectors/get-product-price-tiers';
import { isProductsListFetching } from 'calypso/state/products-list/selectors/is-products-list-fetching';
import {
	getSiteAvailableProductCost,
	isRequestingSiteProducts,
} from 'calypso/state/sites/products/selectors';
import type { SelectorProduct } from './types';
import type { PriceTierEntry } from '@automattic/calypso-products';

interface ItemPrices {
	isFetching: boolean | null;
	originalPrice: number;
	discountedPrice?: number;
	priceTierList: PriceTierEntry[];
}

interface ItemRawPrices {
	isFetching: boolean | null;
	itemCost: number | null;
	monthlyItemCost: number | null;
	priceTierList: PriceTierEntry[];
}

const useProductListItemPrices = (
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemRawPrices => {
	const isFetching = useSelector( ( state ) => !! isProductsListFetching( state ) );
	const productSlug = item?.costProductSlug || item?.productSlug;
	const itemCost =
		useSelector( ( state ) => productSlug && getProductCost( state, productSlug ) ) || null;
	const monthlyItemCost =
		useSelector( ( state ) => getProductCost( state, monthlyItemSlug ) ) || null;
	const priceTierList = useSelector( ( state ) =>
		productSlug ? getProductPriceTierList( state, productSlug ) : []
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTierList,
	};
};

const useSiteAvailableProductPrices = (
	siteId: number | null,
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemRawPrices => {
	const isFetching =
		useSelector( ( state ) => siteId && !! isRequestingSiteProducts( state, siteId ) ) || null;
	const productSlug = item?.costProductSlug || item?.productSlug;
	const itemCost =
		useSelector(
			( state ) =>
				siteId && productSlug && getSiteAvailableProductCost( state, siteId, productSlug )
		) || null;
	const monthlyItemCost =
		useSelector(
			( state ) => siteId && getSiteAvailableProductCost( state, siteId, monthlyItemSlug )
		) || null;
	const priceTierList = useSelector( ( state ) =>
		productSlug ? getProductPriceTierList( state, productSlug ) : []
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTierList,
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

	const priceTierList = useMemo(
		() => ( siteId ? sitePrices.priceTierList : listPrices.priceTierList ),
		[ siteId, sitePrices.priceTierList, listPrices.priceTierList ]
	);

	if ( isFetching ) {
		return {
			isFetching,
			originalPrice: 0,
			priceTierList: [],
		};
	}

	let originalPrice = 0;
	let discountedPrice = undefined;
	if ( item && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost;
			// we are now displaying the discount WITHOUT the additionally monthly changes
			discountedPrice = monthlyItemCost;
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
		priceTierList,
	};
};

export default useItemPrice;
