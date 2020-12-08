/**
 * Internal dependencies
 */
import { isMappedDomainWithWpcomNameservers, isRegisteredDomain } from 'calypso/lib/domains';
import { canDomainAddGSuite } from './can-domain-add-gsuite';
import { hasGSuiteWithUs } from './has-gsuite-with-us';
import { hasGSuiteWithAnotherProvider } from './has-gsuite-with-another-provider';

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
 * Given a list of domains does one of them support G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {boolean} - Does list of domains contain a G Suited supported domain
 */
export function hasGSuiteSupportedDomain( domains ) {
	return getGSuiteSupportedDomains( domains ).length > 0;
}
