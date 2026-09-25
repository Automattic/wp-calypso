import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { GA_PRODUCT_BRAND_JETPACK, GA_PRODUCT_BRAND_WPCOM } from '../ad-tracking/constants';
import costToUSD from './cost-to-usd';
import {
	getReceiptItemCost,
	getReceiptItemName,
	getReceiptItemSlugObject,
} from './receipt-item-details';
import type { ReceiptItem } from '@automattic/api-core';

export type GaItem = {
	item_id: string;
	item_name: string;
	item_brand: string;
	quantity: number;
	price: number;
};

export function receiptItemToGaItem( item: ReceiptItem, currency: string ): GaItem {
	const slugObject = getReceiptItemSlugObject( item );
	const item_brand =
		isJetpackPlan( slugObject ) || isJetpackProduct( slugObject )
			? GA_PRODUCT_BRAND_JETPACK
			: GA_PRODUCT_BRAND_WPCOM;
	return {
		item_id: item.product_id.toString(),
		item_name: getReceiptItemName( item ),
		quantity: item.volume,
		price: Number( costToUSD( getReceiptItemCost( item, currency ), currency ) ),
		item_brand,
	};
}
