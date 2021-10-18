import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';

/**
 * Retrieves the first domain that is eligible for Titan in this order:
 *
 *   - The domain from the site currently selected, if eligible
 *   - The primary domain of the site, if eligible
 *   - The first non-primary domain eligible found
 *
 * Note this method doesn't check if a domain is eligible for the 3-month free trial.
 *
 * @param {string} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {?object} - the first eligible domain found, null otherwise
 */
export function getEligibleTitanDomain( selectedDomainName, domains ) {
	if ( ! domains ) {
		return null;
	}

	const eligibleDomains = domains.filter( ( domain ) => {
		if ( domain.expired || domain.isWpcomStagingDomain ) {
			return false;
		}

		if ( hasPaidEmailWithUs( domain ) ) {
			return false;
		}

		return canCurrentUserAddEmail( domain );
	} );

	if ( eligibleDomains.length === 0 ) {
		return null;
	}

	const selectedDomain = eligibleDomains.find( ( domain ) => domain.name === selectedDomainName );

	if ( selectedDomain ) {
		return selectedDomain;
	}

	// Orders domains with the primary domain in first position, if any, and returns the first domain
	return eligibleDomains.sort(
		( a, b ) => Number( b.isPrimary ?? false ) - Number( a.isPrimary ?? false )
	)[ 0 ];
}
