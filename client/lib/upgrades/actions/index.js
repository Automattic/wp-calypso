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
	getRememberedCoupon,
	removeCoupon,
	disableCart,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains,
	replaceCartWithItems,
	replaceItem,
} from './cart';

export { submitTransaction } from './checkout';

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
	requestTransferCode,
	resendIcannVerification,
	setPrimaryDomain,
	updateNameservers,
	updateSiteRedirect,
	requestGdprConsentManagementLink,
} from './domain-management';

export { goToDomainCheckout } from './domain-search';

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	submitSurvey,
	disableAutoRenew,
	enableAutoRenew,
} from './purchases';
