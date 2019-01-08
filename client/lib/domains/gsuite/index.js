/**
 * Internal dependencies
 */
import { canAddGoogleApps, getGoogleAppsSupportedDomains } from 'lib/domains';

/**
 * Retrieves the first domain that is eligible to G Suite either from the current selected site or the list of domains.
 *
 * @param {String} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {String} - Eligible domain name
 */
export function getEligibleDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canAddGoogleApps( selectedDomainName ) ) {
		return selectedDomainName;
	}
	const [ eligibleDomain ] = getGoogleAppsSupportedDomains( domains );
	return ( eligibleDomain && eligibleDomain.name ) || '';
}
