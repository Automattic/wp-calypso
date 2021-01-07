/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { clone } from 'lodash';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'calypso/state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import getProductPriceTiers, {
	PriceTiers,
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
	priceTiers: PriceTiers | null;
}

interface ItemRawPrices {
	isFetching: boolean | null;
	itemCost: number | null;
	monthlyItemCost: number | null;
	priceTiers: PriceTiers | null;
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
	const priceTiers = useSelector( ( state ) =>
		getProductPriceTiers( state, item?.costProductSlug || item?.productSlug )
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTiers,
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
	const priceTiers = useSelector( ( state ) =>
		getProductPriceTiers( state, item?.costProductSlug || item?.productSlug )
	);

	return {
		isFetching,
		itemCost,
		monthlyItemCost,
		priceTiers,
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

	if ( isFetching ) {
		return {
			isFetching,
			originalPrice: 0,
			priceTiers: null,
		};
	}

	let originalPrice = 0;
	let discountedPrice = undefined;
	let priceTiers: PriceTiers | null = null;
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
	};
};

export default useItemPrice;
