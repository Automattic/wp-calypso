export const purchasesRoot = '/me/purchases';

export const addCreditCard = purchasesRoot + '/add-credit-card';

export const billingHistory = purchasesRoot + '/billing';

export const upcomingCharges = purchasesRoot + '/upcoming';

export const pendingPayments = purchasesRoot + '/pending';

export const myMemberships = purchasesRoot + '/other';

export function billingHistoryReceipt( receiptId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof receiptId ) {
			throw new Error( 'receiptId must be provided' );
		}
	}
	return billingHistory + `/${ receiptId }`;
}

export function managePurchase( siteName, purchaseId, queryString ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof siteName || 'undefined' === typeof purchaseId ) {
			throw new Error( 'siteName and purchaseId must be provided' );
		}
	}
	if ( queryString ) {
		return purchasesRoot + `/${ siteName }/${ purchaseId }?${ queryString }`;
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
