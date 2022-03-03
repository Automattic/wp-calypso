import {
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
	TERM_MONTHLY,
	isJetpackSearch,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
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

const useItemPrice = (
	siteId: number | null,
	item: SelectorProduct | null,
	monthlyItemSlug = ''
): ItemPrices => {
	const listPrices = useProductListItemPrices( item, monthlyItemSlug );
	const sitePrices = useSiteAvailableProductPrices( siteId, item, monthlyItemSlug );
	const introductoryOfferPrices = useIntroductoryOfferPrices( siteId, item );

	const isFetching = siteId
		? sitePrices.isFetching
		: listPrices.isFetching || introductoryOfferPrices.isFetching;
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
		if ( item.term !== TERM_MONTHLY ) {
			originalPrice = monthlyItemCost ?? itemCost / 12;
			discountedPrice = introductoryOfferPrices.introOfferCost
				? introductoryOfferPrices.introOfferCost / 12
				: undefined;
		}
	}

	// Introductory offer pricing is not yet supported for tiered plans, so we need to hard-code it for now.
	if ( item && item.term !== TERM_MONTHLY && isJetpackSearch( item ) ) {
		discountedPrice = originalPrice * ( 1 - INTRO_PRICING_DISCOUNT_PERCENTAGE / 100 );
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
