import type { RawReceiptData, ReceiptData } from './types';
import type {
	WPCOMTransactionEndpointResponseSuccess,
	Purchase,
	FailedPurchase,
} from '@automattic/wpcom-checkout';

/**
 * Convert raw receipt data into receipt data for the Redux store.
 */
export function createReceiptObject(
	data: RawReceiptData | WPCOMTransactionEndpointResponseSuccess
): ReceiptData {
	// purchases is a key-value store if the data is coming from the transactions
	// endpoint, but an array if it comes from the receipt endpoint.
	const purchases = ( (): Purchase[] => {
		if ( ! data.purchases ) {
			return [];
		}
		if ( Array.isArray( data.purchases ) && data.purchases.length === 0 ) {
			return [];
		}
		if ( Array.isArray( data.purchases ) ) {
			return data.purchases;
		}
		return flattenPurchases( data.purchases );
	} )();

	// failed_purchases only comes from the transactions endpont and is only an
	// array if it is empty (PHP converting an empty associative array into an
	// empty array instead of an object).
	const failedPurchases =
		'failed_purchases' in data && ! Array.isArray( data.failed_purchases )
			? flattenFailedPurchases( data.failed_purchases )
			: [];

	return {
		receiptId: String( data.receipt_id ),
		displayPrice: data.display_price,
		currency: data.currency,
		priceInteger: data.price_integer,
		priceFloat: data.price_float,
		isGravatarDomain: Boolean( data.is_gravatar_domain ),
		purchases: purchases.map( ( purchase ) => {
			return {
				delayedProvisioning: Boolean( purchase.delayed_provisioning ),
				isHundredYearDomain: Boolean( purchase.is_hundred_year_domain ),
				freeTrial: false,
				isDomainRegistration: Boolean( purchase.is_domain_registration ),
				meta: purchase.meta || '',
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
				blogId: purchase.blog_id,
				priceInteger: purchase.price_integer ?? 0,
			};
		} ),
		failedPurchases: failedPurchases.map( ( purchase ) => {
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
 * Purchases from the transactions endpoint are of the format:
 *
 * { [siteId]: [ { productId: ... } ] }
 *
 * ...so we need to flatten them to get an array of purchases.
 */
function flattenPurchases(
	purchases: WPCOMTransactionEndpointResponseSuccess[ 'purchases' ]
): Array< Purchase > {
	if ( Array.isArray( purchases ) ) {
		// If the data is an array, it is because PHP converted an empty
		// associative array into an empty array instead of an empty object.
		return [];
	}
	return Object.values( purchases ).flat();
}

/**
 * Failed purchases from the transactions endpoint are of the format:
 *
 * { [siteId]: [ { productId: ... } ] }
 *
 * ...so we need to flatten them to get an array of purchases.
 */
function flattenFailedPurchases(
	purchases: WPCOMTransactionEndpointResponseSuccess[ 'failed_purchases' ]
): Array< FailedPurchase > {
	if ( Array.isArray( purchases ) ) {
		// If the data is an array, it is because PHP converted an empty
		// associative array into an empty array instead of an empty object.
		return [];
	}
	return Object.values( purchases ).flat();
}
