/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { clone } from 'lodash';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'calypso/state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import {
	getProductPriceTiers,
	getProductPriceTierList,
} from 'calypso/state/products-list/selectors/get-product-price-tiers';
import type {
	PriceTiers,
	PriceTierEntry,
} from 'calypso/state/products-list/selectors/get-product-price-tiers';
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
	/**
	 * @deprecated use priceTierList
	 **/
	priceTiers: PriceTiers | null;
	priceTierList: PriceTierEntry[];
}

interface ItemRawPrices {
	isFetching: boolean | null;
	itemCost: number | null;
	monthlyItemCost: number | null;
	/**
	 * @deprecated use priceTierList
	 **/
	priceTiers: PriceTiers | null;
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
	const priceTiers = useSelector( ( state ) => getProductPriceTiers( state, productSlug ) );
	const priceTierList = useSelector( ( state ) =>
		productSlug ? getProductPriceTierList( state, productSlug ) : []
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTiers,
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
	const priceTiers = useSelector( ( state ) => getProductPriceTiers( state, productSlug ) );
	const priceTierList = useSelector( ( state ) =>
		productSlug ? getProductPriceTierList( state, productSlug ) : []
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTiers,
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
	const rawPriceTiers = siteId ? sitePrices.priceTiers : listPrices.priceTiers;

	const priceTierList = useMemo(
		() => ( siteId ? sitePrices.priceTierList : listPrices.priceTierList ),
		[ siteId, sitePrices.priceTierList, listPrices.priceTierList ]
	);

	if ( isFetching ) {
		return {
			isFetching,
			originalPrice: 0,
			priceTiers: null,
			priceTierList: [],
		};
	}

	let originalPrice = 0;
	let discountedPrice = undefined;
	let priceTiers: PriceTiers | null = rawPriceTiers;
	if ( item && itemCost ) {
		originalPrice = itemCost;
		if ( monthlyItemCost && item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost;
			discountedPrice = itemCost / 12;

			if ( rawPriceTiers ) {
				priceTiers = {};
				for ( const tierKey in rawPriceTiers ) {
					const tier = clone( rawPriceTiers[ tierKey ] );
					if ( 'flat_price' in tier ) {
						tier.flat_price = tier.flat_price / 12;
					} else if ( 'variable_price_per_unit' in tier ) {
						tier.variable_price_per_unit = tier.variable_price_per_unit / 12;
					}
					priceTiers[ tierKey ] = tier;
				}
			}
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
		priceTiers,
		priceTierList,
	};
};

export default useItemPrice;
