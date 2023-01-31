import {
	JETPACK_BACKUP_T1_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_SOCIAL_ADVANCED_PRODUCTS,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	getProductBySlug,
	getProductSaleCouponDiscount,
} from 'calypso/state/products-list/selectors';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getProductPriceTierList } from 'calypso/state/products-list/selectors/get-product-price-tiers';
import { isProductsListFetching } from 'calypso/state/products-list/selectors/is-products-list-fetching';
import getIntroOfferPrice from 'calypso/state/selectors/get-intro-offer-price';
import isRequestingIntroOffers from 'calypso/state/selectors/get-is-requesting-into-offers';
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
	discountedPriceDuration?: number;
	priceTierList: PriceTierEntry[];
}

interface ItemRawPrices {
	isFetching: boolean | null;
	itemCost: number | null;
	monthlyItemCost: number | null;
	priceTierList: PriceTierEntry[];
}

interface ItemIntroOffer {
	isFetching: boolean | null;
	introOfferCost: number | null;
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

const useIntroductoryOfferPrices = (
	siteId: number | null,
	item: SelectorProduct | null
): ItemIntroOffer => {
	const product = useSelector( ( state ) =>
		item?.costProductSlug || item?.productSlug
			? getProductBySlug( state, item?.costProductSlug || item?.productSlug )
			: null
	);

	const isFetching =
		useSelector( ( state ) => !! isRequestingIntroOffers( state, siteId ?? undefined ) ) || null;
	const introOfferCost =
		useSelector(
			( state ) => product && getIntroOfferPrice( state, product.product_id, siteId ?? 'none' )
		) || null;

	return {
		isFetching,
		introOfferCost,
	};
};

const getMonthlyPrice = ( yearlyPrice: number ): number => ( yearlyPrice * 100 ) / 12 / 100;

const useItemPrice = (
	siteId: number | null,
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemPrices => {
	const listPrices = useProductListItemPrices( item, monthlyItemSlug );
	const sitePrices = useSiteAvailableProductPrices( siteId, item, monthlyItemSlug );
	const introductoryOfferPrices = useIntroductoryOfferPrices( siteId, item );
	const saleCouponDiscount = useSelector( ( state ) =>
		item?.productSlug ? getProductSaleCouponDiscount( state, item.productSlug ) : null
	);

	const isFetching = siteId
		? sitePrices.isFetching
		: listPrices.isFetching || introductoryOfferPrices.isFetching;
	const itemCost = siteId ? sitePrices.itemCost : listPrices.itemCost;
	/**
	 * At one point we needed to use `monthlyItemCost` instead of calculating the monthly price
	 * with getMonthlyPrice() because yearly prices were slightly incorrect in the pricing table.
	 * See https://github.com/Automattic/wp-calypso/pull/60636.
	 * I'm leaving `monthlyItemCost` here for now in case we need it again sometime.
	 */
	// const monthlyItemCost = siteId ? sitePrices.monthlyItemCost : listPrices.monthlyItemCost;

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
	let discountedPriceDuration = undefined;

	if ( item && itemCost ) {
		originalPrice = itemCost;
		if ( item.term !== TERM_MONTHLY ) {
			originalPrice = getMonthlyPrice( itemCost ); // monthlyItemCost - See comment above.
			discountedPrice = introductoryOfferPrices.introOfferCost
				? getMonthlyPrice( introductoryOfferPrices.introOfferCost )
				: undefined;

			// Override Jetpack Social and Jetpack Backup Tier 1 price by hard-coding it for now
			if (
				[
					...JETPACK_SOCIAL_PRODUCTS,
					...JETPACK_SOCIAL_ADVANCED_PRODUCTS,
					...JETPACK_BACKUP_T1_PRODUCTS,
				].includes(
					item?.productSlug as
						| typeof JETPACK_SOCIAL_PRODUCTS[ number ]
						| typeof JETPACK_SOCIAL_ADVANCED_PRODUCTS[ number ]
						| typeof JETPACK_BACKUP_T1_PRODUCTS[ number ]
				)
			) {
				discountedPrice = introductoryOfferPrices.introOfferCost || undefined;

				if ( discountedPrice ) {
					discountedPriceDuration = 1;
				}
			}
		}
	}

	if ( item && saleCouponDiscount !== null ) {
		discountedPrice = ( discountedPrice ?? originalPrice ) * ( 1 - saleCouponDiscount );
	}

	// Jetpack CRM price won't come from the API, so we need to hard-code it for now.
	if (
		item &&
		JETPACK_CRM_PRODUCTS.includes( item.productSlug as typeof JETPACK_CRM_PRODUCTS[ number ] )
	) {
		discountedPrice = item.displayPrice || -1;
		originalPrice = item.displayPrice || -1;
	}

	return {
		isFetching,
		originalPrice,
		discountedPrice,
		discountedPriceDuration,
		priceTierList,
	};
};

export default useItemPrice;
