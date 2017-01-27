function purchasesRoot() {
	return '/me/purchases';
}

function addCreditCard() {
	return purchasesRoot() + '/add-credit-card';
}

function billingHistory() {
	return purchasesRoot() + '/billing';
}

function billingHistoryReceipt( receiptId = ':receiptId' ) {
	return billingHistory() + `/${ receiptId }`;
}

function managePurchase( siteName = ':site', purchaseId = ':purchaseId' ) {
	return purchasesRoot() + `/${ siteName }/${ purchaseId }`;
}

function cancelPurchase( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel';
}

function confirmCancelDomain( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/confirm-cancel-domain';
}

function cancelPrivacyProtection( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel-privacy-protection';
}

function addCardDetails( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/payment/add';
}

function editCardDetails( siteName, purchaseId, cardId = ':cardId' ) {
	return managePurchase( siteName, purchaseId ) + `/payment/edit/${ cardId }`;
}

export default {
	addCardDetails,
	addCreditCard,
	billingHistory,
	billingHistoryReceipt,
	cancelPrivacyProtection,
	cancelPurchase,
	confirmCancelDomain,
	editCardDetails,
	managePurchase,
	purchasesRoot
};
