/** @format */

export const purchasesRoot = '/me/purchases';

export const addCreditCard = purchasesRoot + '/add-credit-card';

export const billingHistory = purchasesRoot + '/billing';

export function billingHistoryReceipt( receiptId ) {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'undefined' === typeof receiptId ) {
			throw new Error( 'purchaseId must be provided' );
		}
	}
	return billingHistory + `/${ receiptId }`;
}

export function managePurchase( siteName = ':site', purchaseId = ':purchaseId' ) {
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
	return managePurchase( siteName, purchaseId ) + '/confirm-cancel-domain';
}

export function cancelPrivacyProtection( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel-privacy-protection';
}

export function addCardDetails( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/payment/add';
}

export function editCardDetails( siteName, purchaseId, cardId = ':cardId' ) {
	return managePurchase( siteName, purchaseId ) + `/payment/edit/${ cardId }`;
}
