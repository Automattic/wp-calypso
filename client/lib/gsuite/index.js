/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { get, includes, some, endsWith } from 'lodash';
import { type as domainTypes } from 'lib/domains/constants';
import userFactory from 'lib/user';

/**
 * Constants
 */
const GOOGLE_APPS_LINK_PREFIX = 'https://mail.google.com/a/';

/**
 * Can a domain add G Suite
 *
 * @param {String} domainName - domainname
 * @returns {Boolean} -Can a domain add G Suite
 */
function canDomainAddGSuite( domainName ) {
	const GOOGLE_APPS_INVALID_SUFFIXES = [ '.in', '.wpcomstaging.com' ];
	const GOOGLE_APPS_BANNED_PHRASES = [ 'google' ];
	const includesBannedPhrase = some( GOOGLE_APPS_BANNED_PHRASES, bannedPhrase =>
		includes( domainName, bannedPhrase )
	);
	const hasInvalidSuffix = some( GOOGLE_APPS_INVALID_SUFFIXES, invalidSuffix =>
		endsWith( domainName, invalidSuffix )
	);

	return ! ( hasInvalidSuffix || includesBannedPhrase || isGSuiteRestricted() );
}

/**
 * Retrieves the first domain that is eligible to G Suite either from the current selected site or the list of domains.
 *
 * @param {String} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {String} - Eligible domain name
 */
function getEligibleGSuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGSuite( selectedDomainName ) ) {
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
		const wpcomHosted =
			includes( [ domainTypes.REGISTERED ], domain.type ) &&
			( domain.hasWpcomNameservers || hasGSuite( domain ) );
		const mapped = includes( [ domainTypes.MAPPED ], domain.type );
		return ( wpcomHosted || mapped ) && canDomainAddGSuite( domain.name );
	} );
}

/**
 * Given a domain object, does that domain have G Suite
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - Does a domain have G Suite
 */
function hasGSuite( domain ) {
	return 'no_subscription' !== get( domain, 'googleAppsSubscription.status', '' );
}

/**
 * Given a list of domains does one of them support G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {Boolean} - Does list of domains contain a G Suited supported domain
 */
function hasGSuiteSupportedDomain( domains ) {
	return getGSuiteSupportedDomains( domains ).length > 0;
}

/**
 * Does a domain have pending G Suite Users
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - Does domain have pending G Suite users
 */
function hasPendingGSuiteUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
}

/**
 * Is the user G Suite restricted
 *
 * @returns {Boolean} - Is the user G Suite restricted
 */
function isGSuiteRestricted() {
	const user = userFactory();
	return ! get( user.get(), 'is_valid_google_apps_country', false );
}

function getAnnualPrice( cost, currencyCode ) {
	return formatPrice( cost, currencyCode );
}

function getMonthlyPrice( cost, currencyCode ) {
	return formatPrice( cost / 12, currencyCode );
}

function googleAppsSettingsUrl( domainName ) {
	return GOOGLE_APPS_LINK_PREFIX + domainName;
}

function formatPrice( cost, currencyCode, options = {} ) {
	if ( undefined !== options.precision ) {
		cost = applyPrecision( cost, options.precision );
	}

	return formatCurrency( cost, currencyCode, cost % 1 > 0 ? {} : { precision: 0 } );
}

function applyPrecision( cost, precision ) {
	const exponent = Math.pow( 10, precision );
	return Math.ceil( cost * exponent ) / exponent;
}

function getLoginUrlWithTOSRedirect( email, domain ) {
	return (
		'https://accounts.google.com/AccountChooser?' +
		`Email=${ encodeURIComponent( email ) }` +
		`&service=CPanel` +
		`&continue=${ encodeURIComponent(
			`https://admin.google.com/${ domain }/AcceptTermsOfService?continue=https://mail.google.com/mail/u/${ email }`
		) }`
	);
}

export {
	canDomainAddGSuite,
	formatPrice,
	getAnnualPrice,
	getEligibleGSuiteDomain,
	getGSuiteSupportedDomains,
	getLoginUrlWithTOSRedirect,
	getMonthlyPrice,
	googleAppsSettingsUrl,
	hasGSuite,
	hasGSuiteSupportedDomain,
	hasPendingGSuiteUsers,
	isGSuiteRestricted,
};
