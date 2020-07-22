/**
 * External dependencies
 */
import { get, sortBy, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { isMappedDomainWithWpcomNameservers, isRegisteredDomain } from 'lib/domains';
import { canDomainAddGSuite } from './can-domain-add-gsuite';

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

/**
 * Filters a list of domains by the domains that eligible for G Suite.
 *
 * @param {Array} domains - list of domain objects
 * @returns {Array} - the list of domains that are eligible for G Suite
 */
export function getGSuiteSupportedDomains( domains ) {
	return domains.filter( function ( domain ) {
		if ( hasGSuiteWithAnotherProvider( domain ) ) {
			return false;
		}

		const isHostedOnWpcom =
			isRegisteredDomain( domain ) && ( domain.hasWpcomNameservers || hasGSuiteWithUs( domain ) );

		if ( ! isHostedOnWpcom && ! isMappedDomainWithWpcomNameservers( domain ) ) {
			return false;
		}

		return canDomainAddGSuite( domain.name );
	} );
}

/**
 * Given a domain object, does that domain have G Suite with us.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
export function hasGSuiteWithUs( domain ) {
	const defaultValue = '';
	const domainStatus = get( domain, 'googleAppsSubscription.status', defaultValue );
	return ! includes( [ defaultValue, 'no_subscription', 'other_provider' ], domainStatus );
}

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is with another provider, false otherwise
 */
export function hasGSuiteWithAnotherProvider( domain ) {
	const domainStatus = get( domain, 'googleAppsSubscription.status', '' );

	return 'other_provider' === domainStatus;
}

/**
 * Given a list of domains does one of them support G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {boolean} - Does list of domains contain a G Suited supported domain
 */
export function hasGSuiteSupportedDomain( domains ) {
	return getGSuiteSupportedDomains( domains ).length > 0;
}

/**
 * Does a domain have pending G Suite Users
 *
 * @param {object} domain - domain object
 * @returns {boolean} - Does domain have pending G Suite users
 */
export function hasPendingGSuiteUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
}
