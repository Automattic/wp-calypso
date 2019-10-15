/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';
import { get, includes, some, endsWith, find } from 'lodash';

/**
 * Internal dependencies
 */
import { isMappedDomainWithWpcomNameservers, isRegisteredDomain } from 'lib/domains';
import userFactory from 'lib/user';

/**
 * Constants
 */
const GSUITE_LINK_PREFIX = 'https://mail.google.com/a/';

/**
 * Applies a precision to the cost
 *
 * @param {Number} cost - cost
 * @param {Number} precision - precision to apply to cost
 * @returns {String} - Returns price with applied precision
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
 * Formats price given cost and currency
 *
 * @param {Number} cost - cost
 * @param {String} currencyCode - currency code to format with
 * @param {Object} options - options containing precision
 * @returns {String} - Returns a formatted price
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
 * Retrieves the first domain that is eligible to G Suite either from, and in that order:
 *
 *   - The domain from the site currently selected
 *   - The primary domain of the site
 *
 * @param {String} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {String} - Eligible domain name
 */
function getEligibleGSuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGSuite( selectedDomainName ) ) {
		return selectedDomainName;
	}

	const supportedDomains = getGSuiteSupportedDomains( domains );

	const primaryDomain = find( supportedDomains, 'isPrimary' );

	return get( primaryDomain, 'name', '' );
}

/**
 * Filters a list of domains by the domains that eligible for G Suite
 *
 * @param {Array} domains - list of domain objects
 * @returns {Array} - Array of G Suite supported domans
 */
function getGSuiteSupportedDomains( domains ) {
	return domains.filter( function( domain ) {
		if ( hasGSuiteWithAnotherProvider( domain ) ) {
			return false;
		}

		const isHostedOnWpcom =
			isRegisteredDomain( domain ) && ( domain.hasWpcomNameservers || hasGSuiteWithUs( domain ) );

		return (
			( isHostedOnWpcom || isMappedDomainWithWpcomNameservers( domain ) ) &&
			canDomainAddGSuite( domain.name )
		);
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
 * @returns {String} - Formatted Monthly price, rounded to the nearest tenth
 */
function getMonthlyPrice( cost, currencyCode ) {
	return formatPrice( cost / 12, currencyCode, { precision: 1 } );
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
 * Given a domain object, does that domain have G Suite with us.
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - true if the domain is under our management, false otherwise
 */
function hasGSuiteWithUs( domain ) {
	const domainStatus = get( domain, 'googleAppsSubscription.status', '' );

	return 'no_subscription' !== domainStatus && 'other_provider' !== domainStatus;
}

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @param {Object} domain - domain object
 * @returns {Boolean} - true if the domain is with another provider, false otherwise
 */
function hasGSuiteWithAnotherProvider( domain ) {
	const domainStatus = get( domain, 'googleAppsSubscription.status', '' );

	return 'other_provider' === domainStatus;
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
	hasGSuiteSupportedDomain,
	hasGSuiteWithAnotherProvider,
	hasGSuiteWithUs,
	hasPendingGSuiteUsers,
	isGSuiteRestricted,
};
