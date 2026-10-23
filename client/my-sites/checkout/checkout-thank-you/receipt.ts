import { receiptQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { Receipt } from '@automattic/api-core';

export interface ReceiptPurchase {
	delayedProvisioning: boolean;
	isDomainRegistration: boolean;
	meta: string;
	productId: string | number;
	productSlug: string;
	productType: string;
	productName: string;
	isHundredYearDomain: boolean;
	saasRedirectUrl: string;
	newQuantity: number | undefined;
	blogId: number;
	priceInteger: number;
}

export interface FailedReceiptPurchase {
	meta: string;
	productId: string | number;
	productSlug: string;
	productCost: string | number;
	productName: string;
}

export interface ReceiptData {
	receiptId: string;
	currency: string;
	checkoutType: string | undefined;
	purchases: ReceiptPurchase[];
}

export function createReceiptObject( receipt: Receipt ): ReceiptData {
	return {
		receiptId: String( receipt.id ),
		currency: receipt.currency,
		checkoutType: receipt.checkout_type,
		purchases: receipt.items.map( ( item ) => ( {
			delayedProvisioning: Boolean( item.delayed_provisioning ),
			isHundredYearDomain: Boolean( item.is_hundred_year_domain ),
			isDomainRegistration: item.is_domain_registration,
			meta: item.meta ?? '',
			productId: item.product_id,
			productSlug: item.wpcom_product_slug,
			productType: item.product_type,
			productName: item.variation || item.product,
			newQuantity: item.new_quantity ?? undefined,
			saasRedirectUrl: item.saas_redirect_url ?? '',
			blogId: item.site_id,
			priceInteger: item.subtotal_integer,
		} ) ),
	};
}

/**
 * Reads a receipt for the thank-you pages. Uses the same query as the pending
 * page, which fetches the receipt before redirecting here.
 */
export function useCheckoutReceipt( receiptId: number | undefined ) {
	return useQuery( {
		...receiptQuery( receiptId ?? 0, { includeFailedPurchases: true } ),
		enabled: !! receiptId,
		select: createReceiptObject,
	} );
}
