/** @format */

export const purchasesRoot = '/me/purchases';

export const addCreditCard = purchasesRoot + '/add-credit-card';

export const billingHistory = purchasesRoot + '/billing';

export function billingHistoryReceipt( receiptId = ':receiptId' ) {
	return billingHistory + `/${ receiptId }`;
}

export function managePurchase( siteName = ':site', purchaseId = ':purchaseId' ) {
	return purchasesRoot + `/${ siteName }/${ purchaseId }`;
}

export function cancelPurchase( siteName, purchaseId ) {
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
