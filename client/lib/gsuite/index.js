/**
 * External dependencies
 */
import { get, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { canDomainAddGSuite } from './can-domain-add-gsuite';
import { getGSuiteSupportedDomains } from './gsuite-supported-domain';

export { getAnnualPrice } from './get-annual-price';
export { getMonthlyPrice } from './get-monthly-price';
export {
	isGSuiteExtraLicenseProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteProductSlug,
} from './gsuite-product-slug';
export { getLoginUrlWithTOSRedirect } from './get-login-url-with-tos-redirect';
export { canUserPurchaseGSuite } from './can-user-purchase-gsuite';
export { canDomainAddGSuite } from './can-domain-add-gsuite';
export { getGSuiteMailboxCount } from './get-gsuite-mailbox-count';
export { hasGSuiteWithUs } from './has-gsuite-with-us';
export { hasGSuiteWithAnotherProvider } from './has-gsuite-with-another-provider';
export { hasPendingGSuiteUsers } from './has-pending-gsuite-users';
export { getGSuiteSupportedDomains, hasGSuiteSupportedDomain } from './gsuite-supported-domain';

/**
 * Retrieves the first domain that is eligible to G Suite in this order:
 *
 *   - The domain from the site currently selected, if eligible
 *   - The primary domain of the site, if eligible
 *   - The first non-primary domain eligible found
 *
 * @param {string} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {string} - the name of the first eligible domain found
 */
export function getEligibleGSuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGSuite( selectedDomainName ) ) {
		return selectedDomainName;
	}

	// Orders domains with the primary domain in first position, if any
	const supportedDomains = sortBy(
		getGSuiteSupportedDomains( domains ),
		( domain ) => ! domain.isPrimary
	);

	return get( supportedDomains, '[0].name', '' );
}
