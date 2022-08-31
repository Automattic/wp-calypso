import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import { isDomainEligibleForTitanIntroductoryOffer } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines whether the specified domain is eligible for Titan.
 */
function isEligibleTitanDomain(
	domain: ResponseDomain,
	mustBeEligibleForIntroductoryOffer = false
) {
	if ( domain.expired || domain.isWpcomStagingDomain ) {
		return false;
	}

	if ( hasPaidEmailWithUs( domain ) ) {
		return false;
	}

	if ( ! canCurrentUserAddEmail( domain ) ) {
		return false;
	}

	if ( mustBeEligibleForIntroductoryOffer ) {
		return isDomainEligibleForTitanIntroductoryOffer( domain );
	}

	return true;
}

/**
 * Retrieves the first domain that is eligible for Titan in this order:
 *
 *   - The domain from the site currently selected, if eligible
 *   - The primary domain of the site, if eligible
 *   - The most recent non-primary domain eligible found
 */
export function getEligibleTitanDomain(
	selectedDomainName: string,
	domains: ResponseDomain[],
	mustBeEligibleForIntroductoryOffer = false
) {
	if ( ! domains ) {
		return null;
	}

	const eligibleDomains = domains.filter( ( domain ) =>
		isEligibleTitanDomain( domain, mustBeEligibleForIntroductoryOffer )
	);

	if ( eligibleDomains.length === 0 ) {
		return null;
	}

	const selectedDomain = eligibleDomains.find( ( domain ) => domain.name === selectedDomainName );

	if ( selectedDomain ) {
		return selectedDomain;
	}

	return eligibleDomains
		.sort(
			// Orders domains by most recent registration date
			( a, b ) =>
				new Date( b.registrationDate ).valueOf() - new Date( a.registrationDate ).valueOf()
		)
		.sort(
			// Moves the primary domain in first position of this list of domains
			( a, b ) => Number( b.isPrimary ?? false ) - Number( a.isPrimary ?? false )
		)[ 0 ];
}
