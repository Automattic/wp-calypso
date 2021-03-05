export const purchasesRoot = '/me/purchases';

export const addCreditCard = purchasesRoot + '/add-credit-card';

export const addNewPaymentMethod = purchasesRoot + '/add-payment-method';

export const billingHistory = purchasesRoot + '/billing';

export const paymentMethods = purchasesRoot + '/payment-methods';

export const pendingPayments = purchasesRoot + '/pending';

export function billingHistoryReceipt( receiptId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof receiptId ) {
			throw new Error( 'receiptId must be provided' );
		}
	}
	return billingHistory + `/${ receiptId }`;
}

export function managePurchase( siteName, purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return purchasesRoot + `/${ siteName }/${ purchaseId }`;
}

export function cancelPurchase( siteName, purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + '/cancel';
}

export function confirmCancelDomain( siteName, purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + '/confirm-cancel-domain';
}

export function addCardDetails( siteName, purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + '/payment/add';
}

export function editCardDetails( siteName, purchaseId, cardId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if (
			'undefined' === typeof siteName ||
			'undefined' === typeof purchaseId ||
			'undefined' === typeof cardId
		) {
			throw new Error( 'siteName, purchaseId, and cardId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + `/payment/edit/${ cardId }`;
}

export function addPaymentMethod( siteName, purchaseId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + '/payment-method/add';
}

export function changePaymentMethod( siteName, purchaseId, cardId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if (
			'undefined' === typeof siteName ||
			'undefined' === typeof purchaseId ||
			'undefined' === typeof cardId
		) {
			throw new Error( 'siteName, purchaseId, and cardId must be provided' );
		}
	}
	return managePurchase( siteName, purchaseId ) + `/payment-method/change/${ cardId }`;
}

export const deprecated = {
	upcomingCharges: purchasesRoot + '/upcoming',
	otherPurchases: purchasesRoot + '/other',
};
