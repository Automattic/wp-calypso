/**
 * Internal dependencies
 */
import { get, includes, some } from 'lodash';
import { type as domainTypes } from 'lib/domains/constants';
import userFactory from 'lib/user';

/**
 * Can a domain add G Suite
 *
 * @param {String} domainName - domainname
 * @returns {Boolean} -Can a domain add G Suite
 */
function canDomainAddGsuite( domainName ) {
	const GOOGLE_APPS_INVALID_TLDS = [ 'in' ];
	const GOOGLE_APPS_BANNED_PHRASES = [ 'google' ];
	const tld = domainName.split( '.' )[ 1 ],
		includesBannedPhrase = some( GOOGLE_APPS_BANNED_PHRASES, function( phrase ) {
			return includes( domainName, phrase );
		} );

	return ! (
		includes( GOOGLE_APPS_INVALID_TLDS, tld ) ||
		includesBannedPhrase ||
		isGsuiteRestricted()
	);
}

/**
 * Retrieves the first domain that is eligible to G Suite either from the current selected site or the list of domains.
 *
 * @param {String} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {String} - Eligible domain name
 */
function getEligibleGsuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGsuite( selectedDomainName ) ) {
		return selectedDomainName;
	}
	const [ eligibleDomain ] = getGSuiteSupportedDomains( domains );
	return ( eligibleDomain && eligibleDomain.name ) || '';
}

/**
 * Filters a list of domains by the domains that eligible for G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {Array} - Array of G Suite supported domans
 */
function getGSuiteSupportedDomains( domains ) {
	return domains.filter( function( domain ) {
		return (
			includes( [ domainTypes.REGISTERED, domainTypes.MAPPED ], domain.type ) &&
			canDomainAddGsuite( domain.name )
		);
	} );
}

/**
 * Given a domain object, does that domain have G Suite
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - Does a domain have G Suite
 */
function hasGsuite( domain ) {
	return 'no_subscription' !== get( domain, 'googleAppsSubscription.status', '' );
}

/**
 * Given a list of domains does one of them support G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {Boolean} - Does list of domains contain a G Suited supported domain
 */
function hasGsuiteSupportedDomain( domains ) {
	return getGSuiteSupportedDomains( domains ).length > 0;
}

/**
 * Does a domain have pending G Suite Users
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - Does domain have pending G Suite users
 */
function hasPendingGsuiteUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
}

/**
 * Is the user G Suite restricted
 *
 * @returns {Boolean} - Is the user G Suite restricted
 */
function isGsuiteRestricted() {
	const user = userFactory();
	return ! get( user.get(), 'is_valid_google_apps_country', false );
}

export {
	canDomainAddGsuite,
	getEligibleGsuiteDomain,
	getGSuiteSupportedDomains,
	hasGsuite,
	hasGsuiteSupportedDomain,
	hasPendingGsuiteUsers,
	isGsuiteRestricted,
};
