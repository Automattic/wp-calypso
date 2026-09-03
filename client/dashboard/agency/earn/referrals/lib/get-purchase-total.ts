import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

/**
 * Falls back to the catalog price while a referral is unpaid and has no
 * subscription. Unlike the name lookup, this matches on `product_id` alone: the
 * monthly and yearly variants are separate catalog entries with different
 * amounts, so matching a variant ID would report the wrong price.
 */
export function getPurchaseTotal(
	purchase: ReferralPurchase,
	products?: AgencyProduct[]
): string | null {
	const product = products?.find( ( item ) => item.product_id === purchase.product_id );

	let amount = Number( product?.amount );
	let currency = product?.currency ?? 'USD';
	let interval = product?.price_interval ?? 'month';

	if ( purchase.subscription?.purchase_price ) {
		amount = Number( purchase.subscription.purchase_price );
		currency = purchase.subscription.purchase_currency ?? '';
		interval = purchase.subscription.billing_interval_unit ?? '';
	}

	if ( ! amount ) {
		return null;
	}

	const formatted = formatCurrency( amount, currency );

	return interval === 'year'
		? sprintf(
				/* translators: %s is the price of the subscription per year, e.g. "US$25.00" */
				__( '%s/yr' ),
				formatted
		  )
		: sprintf(
				/* translators: %s is the price of the subscription per month, e.g. "US$25.00" */
				__( '%s/mo' ),
				formatted
		  );
}
