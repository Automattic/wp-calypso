/**
 * Internal dependencies
 */
import { canAddGoogleApps, getGoogleAppsSupportedDomains } from 'lib/domains';

export function getEligibleSelectedSite( selectedDomainName, domains ) {
	if ( selectedDomainName && canAddGoogleApps( selectedDomainName ) ) {
		return selectedDomainName;
	}
	const [ eligibleDomain ] = getGoogleAppsSupportedDomains( domains );
	return ( eligibleDomain && eligibleDomain.name ) || 'example.com';
}
