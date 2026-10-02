import { getReceiptCouponCode } from './receipt-item-details';
import { GaItem, receiptItemToGaItem } from './receipt-item-to-ga-item';
import { WpcomJetpackReceiptInfo } from './split-receipt-items';
import type { Receipt } from '@automattic/api-core';

export type GaPurchase = {
	value: number;
	currency: string;
	tax?: number;
	transaction_id: string;
	coupon: string;
	items: GaItem[];
	contains_yearly_or_higher_wpcom_plan?: boolean;
};

const parseReceiptInfo = ( receiptInfo: WpcomJetpackReceiptInfo ) => ( {
	wpcom: {
		value: receiptInfo.wpcomCostUSD + receiptInfo.jetpackCostUSD,
		items: [ ...receiptInfo.wpcomItems, ...receiptInfo.jetpackItems ],
	},
	jetpack: {
		value: receiptInfo.jetpackCostUSD,
		items: receiptInfo.jetpackItems,
	},
	akismet: {
		value: receiptInfo.akismetCostUSD,
		items: receiptInfo.akismetItems,
	},
} );

const getReceiptInfoType = ( receiptInfo: WpcomJetpackReceiptInfo ) => {
	if ( receiptInfo.containsWpcomItems ) {
		return 'wpcom';
	} else if ( receiptInfo.containsJetpackItems ) {
		return 'jetpack';
	} else if ( receiptInfo.containsAkismetItems ) {
		return 'akismet';
	}

	return 'wpcom';
};

export function receiptToGaPurchase(
	receipt: Receipt,
	receiptInfo: WpcomJetpackReceiptInfo
): GaPurchase {
	const receiptInfoType = getReceiptInfoType( receiptInfo );

	// When using gtag.js, we can't access the `items` array to make custom events in GA4.
	// To get around this limitation, we need to set this property on the top level purcahse object.
	const containsYearlyOrHigherWPcomPlan = receiptInfo.wpcomItems.some( ( item ) => {
		if ( ! item.months_per_renewal_interval ) {
			return false;
		}
		return item.months_per_renewal_interval >= 12;
	} );

	const { value, items } = parseReceiptInfo( receiptInfo )[ receiptInfoType ];
	return {
		transaction_id: String( receipt.id ),
		coupon: getReceiptCouponCode( receipt ),
		currency: 'USD', // we track all prices in USD
		value,
		items: items.map( ( item ) => receiptItemToGaItem( item, receipt.currency ) ),
		...( 'wpcom' === receiptInfoType
			? { contains_yearly_or_higher_wpcom_plan: containsYearlyOrHigherWPcomPlan }
			: {} ),
	};
}
