export function createReceiptObject( data ) {
	return {
		receiptId: data.receipt_id,
		purchases: data.purchases.map( purchase => {
			return {
				freeTrial: purchase.free_trial,
				isDomainRegistration: Boolean( purchase.isDomainRegistration ),
				meta: purchase.meta,
				productId: purchase.product_id,
				productSlug: purchase.product_slug,
				productNameShort: purchase.product_name_short
			};
		} )
	};
};
