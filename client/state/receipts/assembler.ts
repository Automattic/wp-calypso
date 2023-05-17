import type { RawReceiptData, ReceiptData } from './types';

/**
 * Converts raw receipt data into receipt data
 *
 * @param {RawReceiptData} data The raw data returned from the server after a transaction
 * @returns {ReceiptData} The formatted receipt data
 */
export function createReceiptObject( data: RawReceiptData ): ReceiptData {
	const purchases = Array.isArray( data.purchases ) ? data.purchases : [];

	return {
		receiptId: data.receipt_id,
		displayPrice: data.display_price,
		currency: data.currency,
		priceInteger: data.price_integer,
		priceFloat: data.price_float,
		purchases: purchases.map( ( purchase ) => {
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
				saasRedirectUrl: purchase.saas_redirect_url ?? '',
			};
		} ),
	};
}
