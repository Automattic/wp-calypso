/** @format */
/**
 * Internal dependencies
 */
// @TODO update when no longer compiling to CommonJS
// export * from './cart';
// export * from './checkout';
// etc…
export {
	addDomainToCart,
	addGoogleAppsRegistrationData,
	addItem,
	addItems,
	addPrivacyToAllDomains,
	applyCoupon,
	closeCartPopup,
	disableCart,
	openCartPopup,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains,
	showCartOnMobile,
} from './cart';

export {
	resetTransaction,
	setDomainDetails,
	setNewCreditCardDetails,
	setPayment,
	submitTransaction,
} from './checkout';

export {
	acceptTransfer,
	addDns,
	addEmailForwarding,
	applyDnsTemplate,
	cancelTransferRequest,
	closeSiteRedirectNotice,
	declineTransfer,
	deleteDns,
	deleteEmailForwarding,
	enablePrivacyProtection,
	fetchDns,
	fetchDomains,
	fetchEmailForwarding,
	fetchNameservers,
	fetchSiteRedirect,
	fetchWapiDomainInfo,
	fetchWhois,
	requestTransferCode,
	resendIcannVerification,
	resendVerificationEmailForwarding,
	setPrimaryDomain,
	updateNameservers,
	updateSiteRedirect,
	updateWhois,
} from './domain-management';

export { goToDomainCheckout } from './domain-search';

export { cancelAndRefundPurchase, cancelPurchase, submitSurvey } from './purchases';
