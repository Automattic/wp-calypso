// @ts-check

import { flatten } from 'lodash';

/**
 * Converts raw receipt data into receipt data
 *
 * @param {import('./types').RawReceiptData} data The raw data returned from the server after a transaction
 * @returns {import('./types').ReceiptData} The formatted receipt data
 */
export function createReceiptObject( data ) {
	return {
		receiptId: data.receipt_id,
		displayPrice: data.display_price,
		currency: data.currency,
		priceInteger: data.price_integer,
		priceFloat: data.price_float,
		purchases: flattenPurchases( data.purchases || {} ).map( ( purchase ) => {
			return {
				delayedProvisioning: Boolean( purchase.delayed_provisioning ),
				freeTrial: Boolean( purchase.free_trial ),
				isDomainRegistration: Boolean( purchase.is_domain_registration ),
				meta: purchase.meta,
				productId: purchase.product_id,
				productSlug: purchase.product_slug,
				productType: purchase.product_type,
				productName: purchase.product_name,
				productNameShort: purchase.product_name_short,
				newQuantity: purchase.new_quantity,
				registrarSupportUrl: purchase.registrar_support_url ?? '',
				isEmailVerified: Boolean( purchase.is_email_verified ),
				isRootDomainWithUs: Boolean( purchase.is_root_domain_with_us ),
				isRenewal: Boolean( purchase.is_renewal ),
				willAutoRenew: Boolean( purchase.will_auto_renew ),
			};
		} ),
		failedPurchases: flattenFailedPurchases( data.failed_purchases || {} ).map( ( purchase ) => {
			return {
				meta: purchase.product_meta,
				productId: purchase.product_id,
				productCost: purchase.product_cost,
				productSlug: purchase.product_slug,
				productName: purchase.product_name,
			};
		} ),
	};
}

/**
 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
 * so we need to flatten them to get a list of purchases
 *
 * @param {import('./types').RawReceiptPurchases} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
 * @returns {Array<import('./types').RawReceiptPurchase>} of product objects [ { productId: ... }, ... ]
 */
function flattenPurchases( purchases ) {
	return flatten( Object.values( purchases ) );
}

/**
 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
 * so we need to flatten them to get a list of purchases
 *
 * @param {import('./types').RawFailedReceiptPurchases} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
 * @returns {Array<import('./types').RawFailedReceiptPurchase>} of product objects [ { productId: ... }, ... ]
 */
function flattenFailedPurchases( purchases ) {
	return flatten( Object.values( purchases ) );
}
