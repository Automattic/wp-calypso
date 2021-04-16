export { canDomainAddGSuite } from './can-domain-add-gsuite';
export { canUserPurchaseGSuite } from './can-user-purchase-gsuite';
export { getAnnualPrice } from './get-annual-price';
export { getEligibleGSuiteDomain } from './get-eligible-gsuite-domain';
export {
	getGmailUrl,
	getGoogleAdminUrl,
	getGoogleCalendarUrl,
	getGoogleDocsUrl,
	getGoogleDriveUrl,
	getGoogleSheetsUrl,
	getGoogleSlidesUrl,
} from './get-services-urls';
export { getGSuiteMailboxCount } from './get-gsuite-mailbox-count';
export { getLoginUrlWithTOSRedirect } from './get-login-url-with-tos-redirect';
export { getMonthlyPrice } from './get-monthly-price';
export {
	isGoogleWorkspaceProductSlug,
	isGSuiteExtraLicenseProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
} from '@automattic/calypso-products';
export { getGSuiteSupportedDomains, hasGSuiteSupportedDomain } from './gsuite-supported-domain';
export { hasGSuiteWithAnotherProvider } from './has-gsuite-with-another-provider';
export { hasGSuiteWithUs } from './has-gsuite-with-us';
export { hasPendingGSuiteUsers } from './has-pending-gsuite-users';
export { getGoogleMailServiceFamily } from './get-google-mail-service-family';
export { getProductSlug, getProductType } from './gsuite-product-type';
