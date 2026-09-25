import type { Receipt, ReceiptItem } from '@automattic/api-core';

/**
 * Converts an integer amount in a currency's smallest unit (eg: cents) into
 * the currency's main unit (eg: dollars).
 */
export function smallestUnitToAmount( amountInteger: number, currency: string ): number {
	let precision = 2;
	try {
		precision =
			new Intl.NumberFormat( 'en-US', { style: 'currency', currency } ).resolvedOptions()
				.maximumFractionDigits ?? 2;
	} catch {
		// Unknown currency codes throw; assume a currency like USD.
	}
	return amountInteger / 10 ** precision;
}

export function getReceiptTotal( receipt: Receipt ): number {
	return smallestUnitToAmount( receipt.amount_integer, receipt.currency );
}

export function getReceiptItemCost( item: ReceiptItem, currency: string ): number {
	return smallestUnitToAmount( item.subtotal_integer, currency );
}

export function getReceiptItemName( item: ReceiptItem ): string {
	return item.variation || item.product;
}

export function isSaleCouponAppliedToReceiptItem( item: ReceiptItem ): boolean {
	return item.cost_overrides.some( ( override ) =>
		override.override_code.startsWith( 'sale-coupon-discount' )
	);
}

/**
 * Returns the coupon code used for the purchase, if any.
 *
 * A purchase can only use one coupon, but it may apply to several items.
 */
export function getReceiptCouponCode( receipt: Receipt ): string {
	for ( const item of receipt.items ) {
		const couponCode = item.cost_overrides.find(
			( override ) => override.coupon_code
		)?.coupon_code;
		if ( couponCode ) {
			return couponCode;
		}
	}
	return '';
}

/**
 * Converts a billing interval in months into the number of days used by the
 * shopping cart's `bill_period` (eg: '31' for monthly, '365' for yearly).
 */
export function getReceiptItemBillPeriod( item: ReceiptItem ): string {
	const months = item.months_per_renewal_interval;
	if ( ! months ) {
		return '-1';
	}
	if ( months % 12 === 0 ) {
		return String( ( months / 12 ) * 365 );
	}
	return String( months * 31 );
}

export function getReceiptItemSlugObject( item: ReceiptItem ): { product_slug: string } {
	return { product_slug: item.wpcom_product_slug };
}
