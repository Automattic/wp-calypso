import { canDomainAddGSuite } from './can-domain-add-gsuite';
import { getGSuiteSupportedDomains } from './gsuite-supported-domain';

/**
 * Retrieves the first domain that is eligible for G Suite in this order:
 *
 * - The domain from the site currently selected, if eligible
 * - The primary domain of the site, if eligible
 * - The first non-primary domain eligible found
 * @param {string} selectedDomainName - domain name of the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {string} - the name of the first eligible domain found
 */
export function getEligibleGSuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGSuite( selectedDomainName ) ) {
		return selectedDomainName;
	}

	// Orders domains with the primary domain in first position, if any
	const supportedDomains = getGSuiteSupportedDomains( domains ).sort(
		( domainA, domainB ) => ( domainB.isPrimary ?? false ) - ( domainA.isPrimary ?? false )
	);

	if ( ! supportedDomains.length ) {
		return '';
	}

	return supportedDomains[ 0 ].name;
}
