import { isMappedDomainWithWpcomNameservers, isRegisteredDomain } from 'calypso/lib/domains';
import { canDomainAddGSuite } from './can-domain-add-gsuite';
import { hasGSuiteWithAnotherProvider } from './has-gsuite-with-another-provider';
import { hasGSuiteWithUs } from './has-gsuite-with-us';

/**
 * Filters a list of domains by the domains that eligible for G Suite.
 *
 * @param {import('calypso/lib/domains/types').ResponseDomain[]} domains - list of domain objects
 * @returns {import('calypso/lib/domains/types').ResponseDomain[]} - the list of domains that are eligible for G Suite
 */
export function getGSuiteSupportedDomains( domains ) {
	return domains.filter( function ( domain ) {
		if ( hasGSuiteWithAnotherProvider( domain ) ) {
			return false;
		}

		// If the domain is registered through us, there is a provisioning period when
		// `hasWpcomNameservers` will be false. We still want to let users buy Google Workspace
		// during that period, even if we normally wouldn't let them under these conditions.
		// Therefore, we check those conditions and only return `gsuiteIsUnavailable` if the
		// registration happened less than 15 minutes ago. 15 minutes is an arbitrary number.
		if ( isRegisteredDomain( domain ) && ! domain.hasWpcomNameservers ) {
			const registeredTimestamp = Date.parse( domain.registrationDate );
			const timeSinceRegistration = Date.now() - registeredTimestamp;

			if ( timeSinceRegistration < 15 * 60 * 1000 ) {
				return true;
			}
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
 * Given a list of domains does one of them support G Suite
 *
 * @param {import('calypso/lib/domains/types').ResponseDomain[]} domains - list of domain objects
 * @returns {boolean} - Does list of domains contain a G Suited supported domain
 */
export function hasGSuiteSupportedDomain( domains ) {
	return getGSuiteSupportedDomains( domains ).length > 0;
}
