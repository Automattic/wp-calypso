function list() {
	return '/me/purchases';
}

function addCreditCard() {
	return list() + '/add-credit-card';
}

function billingHistory() {
	return list() + '/billing';
}

function billingHistoryReceipt( transactionId = ':transaction_id' ) {
	return billingHistory() + `/${ transactionId }`;
}

function managePurchase( siteName = ':site', purchaseId = ':purchaseId' ) {
	return list() + `/${ siteName }/${ purchaseId }`;
}

function cancelPurchase( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel';
}

function confirmCancelDomain( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/confirm-cancel-domain';
}

function cancelPrivateRegistration( siteName, purchaseId ) {
	return managePurchase( siteName, purchaseId ) + '/cancel-private-registration';
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
	cancelPrivateRegistration,
	cancelPurchase,
	confirmCancelDomain,
	editCardDetails,
	list,
	managePurchase
};
