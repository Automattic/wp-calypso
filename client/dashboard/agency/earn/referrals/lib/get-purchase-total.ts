import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { findAgencyProduct } from './get-product-name';
import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

/**
 * The catalog lists each product once with both term prices, so the term a
 * referral was created on comes from which of the product's ids it points at.
 */
function getCatalogPrice( product: AgencyProduct, productId: number ) {
	const isMonthly = [ product.monthly_product_id, product.monthly_alternative_product_id ].includes(
		productId
	);
	if ( isMonthly && product.monthly_price ) {
		return { amount: product.monthly_price, interval: 'month' };
	}
	if ( product.yearly_price ) {
		return { amount: product.yearly_price, interval: 'year' };
	}
	return { amount: product.monthly_price ?? 0, interval: 'month' };
}

/**
 * Falls back to the catalog price while a referral is unpaid and has no
 * subscription.
 */
export function getPurchaseTotal(
	purchase: ReferralPurchase,
	products?: AgencyProduct[]
): string | null {
	let amount = 0;
	let currency = 'USD';
	let interval = 'month';

	const product = findAgencyProduct( purchase.product_id, products );
	if ( product ) {
		const catalogPrice = getCatalogPrice( product, purchase.product_id );
		amount = catalogPrice.amount;
		currency = product.currency;
		interval = catalogPrice.interval;
	}

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
