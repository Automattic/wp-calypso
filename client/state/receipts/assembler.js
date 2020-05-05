export function createReceiptObject( data ) {
	return {
		receiptId: data.receipt_id,
		displayPrice: data.display_price,
		purchases: data.purchases.map( ( purchase ) => {
			return {
				delayedProvisioning: Boolean( purchase.delayed_provisioning ),
				freeTrial: purchase.free_trial,
				isDomainRegistration: Boolean( purchase.is_domain_registration ),
				meta: purchase.meta,
				productId: purchase.product_id,
				productSlug: purchase.product_slug,
				productType: purchase.product_type,
				productName: purchase.product_name,
				productNameShort: purchase.product_name_short,
				registrarSupportUrl: purchase.registrar_support_url,
				isEmailVerified: Boolean( purchase.is_email_verified ),
				isRootDomainWithUs: Boolean( purchase.is_root_domain_with_us ),
			};
		} ),
		failedPurchases: ( data.failedPurchases || [] ).map( ( purchase ) => {
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
