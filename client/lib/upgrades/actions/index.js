/** @format */
/**
 * Internal dependencies
 */
// @TODO update when no longer compiling to CommonJS
// export * from './cart';
// export * from './checkout';
// etc…

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

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	submitSurvey,
	disableAutoRenew,
	enableAutoRenew,
} from './purchases';
