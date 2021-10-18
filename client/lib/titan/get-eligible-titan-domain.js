import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';

/**
 * Determines whether the specified domain is eligible for Titan.
 *
 * @param {object} domain - domain object
 * @param {boolean} mustBeEligibleForFreeTrial - whether the domain should also be eligible for the 3-month free trial
 * @returns {boolean} - true if the domain is eligible, false otherwise
 */
function isEligibleTitanDomain( domain, mustBeEligibleForFreeTrial ) {
	if ( domain.expired || domain.isWpcomStagingDomain ) {
		return false;
	}

	if ( hasPaidEmailWithUs( domain ) ) {
		return false;
	}

	if ( ! canCurrentUserAddEmail( domain ) ) {
		return false;
	}

	if ( mustBeEligibleForFreeTrial ) {
		return isDomainEligibleForTitanFreeTrial( domain );
	}

	return true;
}

/**
 * Retrieves the first domain that is eligible for Titan in this order:
 *
 *   - The domain from the site currently selected, if eligible
 *   - The primary domain of the site, if eligible
 *   - The first non-primary domain eligible found
 *
 * @param {string} selectedDomainName - domain name of the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @param {boolean} mustBeEligibleForFreeTrial - whether the domain should also be eligible for the 3-month free trial
 * @returns {?object} - the first eligible domain found, null otherwise
 */
export function getEligibleTitanDomain( selectedDomainName, domains, mustBeEligibleForFreeTrial ) {
	if ( ! domains ) {
		return null;
	}

	const eligibleDomains = domains.filter( ( domain ) =>
		isEligibleTitanDomain( domain, mustBeEligibleForFreeTrial )
	);

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
