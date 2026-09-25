import { isDomainMapping, isDomainTransfer } from '@automattic/calypso-products';
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

/**
 * Returns the receipt without the domain mapping items for domains that were
 * registered or transferred in the same purchase.
 *
 * The shopping cart merges each such mapping into its domain, but the receipt
 * lists it as a separate (usually free) item. Removing it keeps the items we
 * report the same as the ones the customer saw in checkout.
 */
export function mergeDomainMappingsIntoDomains( receipt: Receipt ): Receipt {
	const purchasedDomains = new Set(
		receipt.items
			.filter(
				( item ) =>
					item.is_domain_registration || isDomainTransfer( getReceiptItemSlugObject( item ) )
			)
			.map( ( item ) => item.domain )
	);
	return {
		...receipt,
		items: receipt.items.filter(
			( item ) =>
				! (
					isDomainMapping( getReceiptItemSlugObject( item ) ) && purchasedDomains.has( item.domain )
				)
		),
	};
}

/**
 * Returns the receipt without the items that failed to provision, and with
 * their amounts taken off the receipt's totals.
 *
 * The receipt is created before provisioning, so a failed item stays in
 * `items` and is only listed in `failed_purchases` (when the receipt is
 * fetched with `include_failed_purchases`). Failed items are refunded on a
 * separate receipt. Nothing identifies which item failed, so they are matched
 * on site and product ID, and on the domain when that is ambiguous (eg:
 * several domains or email products for the same site).
 */
export function removeFailedPurchases( receipt: Receipt ): Receipt {
	const failedPurchases = Object.entries( receipt.failed_purchases ?? {} ).flatMap(
		( [ siteId, purchases ] ) => purchases.map( ( purchase ) => ( { siteId, ...purchase } ) )
	);
	if ( failedPurchases.length === 0 ) {
		return receipt;
	}

	const remainingItems = [ ...receipt.items ];
	const failedItems: ReceiptItem[] = [];
	for ( const failed of failedPurchases ) {
		const candidates = remainingItems.filter(
			( item ) =>
				String( item.site_id ) === failed.siteId &&
				String( item.product_id ) === String( failed.product_id )
		);
		const match =
			candidates.length > 1
				? ( candidates.find( ( item ) => item.domain === failed.product_meta ) ?? candidates[ 0 ] )
				: candidates[ 0 ];
		if ( match ) {
			remainingItems.splice( remainingItems.indexOf( match ), 1 );
			failedItems.push( match );
		}
	}

	const sumOf = ( key: 'amount_integer' | 'subtotal_integer' | 'tax_integer' ) =>
		failedItems.reduce( ( total, item ) => total + item[ key ], 0 );
	return {
		...receipt,
		items: remainingItems,
		amount_integer: receipt.amount_integer - sumOf( 'amount_integer' ),
		subtotal_integer: receipt.subtotal_integer - sumOf( 'subtotal_integer' ),
		tax_integer: receipt.tax_integer - sumOf( 'tax_integer' ),
	};
}
