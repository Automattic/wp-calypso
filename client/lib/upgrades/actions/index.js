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
	removeCoupon,
	disableCart,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains,
	replaceCartWithItems,
	replaceItem,
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
	applyDnsTemplate,
	cancelTransferRequest,
	closeSiteRedirectNotice,
	declineTransfer,
	deleteDns,
	disablePrivacyProtection,
	enablePrivacyProtection,
	fetchDns,
	fetchNameservers,
	fetchSiteRedirect,
	fetchWapiDomainInfo,
	fetchWhois,
	requestTransferCode,
	resendIcannVerification,
	setPrimaryDomain,
	updateNameservers,
	updateSiteRedirect,
	updateWhois,
	requestGdprConsentManagementLink,
} from './domain-management';

export { goToDomainCheckout } from './domain-search';

export { startFreeTrial } from './free-trials';

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	submitSurvey,
	disableAutoRenew,
	enableAutoRenew,
} from './purchases';
