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
const GSUITE_LINK_PREFIX = 'https://mail.google.com/a/';

/**
 * Applies a precision to the cost
 *
 * @param {Number} cost - cost
 * @param {Object} precision - precision to apply to cost
 * @returns {Boolean} - Returns price with applied precision
 */
function applyPrecision( cost, precision ) {
	const exponent = Math.pow( 10, precision );
	return Math.ceil( cost * exponent ) / exponent;
}

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
 * Formats price gievn cost and currency
 *
 * @param {Number} cost - cost
 * @param {String} currencyCode - currency code to format with
 * @param {Object} options - options containing precision
 * @returns {Boolean} - Returns a formatted price
 */
function formatPrice( cost, currencyCode, options = {} ) {
	if ( undefined !== options.precision ) {
		cost = applyPrecision( cost, options.precision );
	}

	return formatCurrency( cost, currencyCode, cost % 1 > 0 ? {} : { precision: 0 } );
}

/**
 * Gets the formatted annual cost
 *
 * @param {Number} cost - cost
 * @param {String} currencyCode - currency code to format with
 * @returns {String} - Formatted Annual price
 */
function getAnnualPrice( cost, currencyCode ) {
	return formatPrice( cost, currencyCode );
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
 * Creates the Google ToS redirect url given email and domain
 *
 * @param {String} email - email
 * @param {String} domain - domain name
 * @returns {String} - ToS url redirect
 */
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

/**
 * Gets the formatted monthly cost
 *
 * @param {Number} cost - cost
 * @param {String} currencyCode - currency code to format with
 * @returns {String} - Formatted Monthly price
 */
function getMonthlyPrice( cost, currencyCode ) {
	return formatPrice( cost / 12, currencyCode );
}

/**
 * Returns G Suite management url
 *
 * @param {String} domainName - domain name
 * @returns {String} - Returns G Suite settings url
 */
function getGSuiteSettingsUrl( domainName ) {
	return GSUITE_LINK_PREFIX + domainName;
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

export {
	canDomainAddGSuite,
	formatPrice,
	getAnnualPrice,
	getEligibleGSuiteDomain,
	getGSuiteSettingsUrl,
	getGSuiteSupportedDomains,
	getLoginUrlWithTOSRedirect,
	getMonthlyPrice,
	hasGSuite,
	hasGSuiteSupportedDomain,
	hasPendingGSuiteUsers,
	isGSuiteRestricted,
};
