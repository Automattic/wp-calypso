/**
 * External dependencies
 */
import { endsWith, get, sortBy, includes } from 'lodash';

/**
 * Internal dependencies
 */
import {
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
	GSUITE_EXTRA_LICENSE_SLUG,
} from 'lib/gsuite/constants';
import { isMappedDomainWithWpcomNameservers, isRegisteredDomain } from 'lib/domains';
import userFactory from 'lib/user';

export { getAnnualPrice } from './get-annual-price';
export { getMonthlyPrice } from './get-monthly-price';

/**
 * Determines whether G Suite is allowed for the specified domain.
 *
 * @param {string} domainName - domain name
 * @returns {boolean} - true if G Suite is allowed, false otherwise
 */
export function canDomainAddGSuite( domainName ) {
	if ( endsWith( domainName, '.wpcomstaging.com' ) ) {
		return false;
	}

	return canUserPurchaseGSuite();
}

/**
 * Retrieves the first domain that is eligible to G Suite in this order:
 *
 *   - The domain from the site currently selected, if eligible
 *   - The primary domain of the site, if eligible
 *   - The first non-primary domain eligible found
 *
 * @param {string} selectedDomainName - domain name for the site currently selected by the user
 * @param {Array} domains - list of domain objects
 * @returns {string} - the name of the first eligible domain found
 */
export function getEligibleGSuiteDomain( selectedDomainName, domains ) {
	if ( selectedDomainName && canDomainAddGSuite( selectedDomainName ) ) {
		return selectedDomainName;
	}

	// Orders domains with the primary domain in first position, if any
	const supportedDomains = sortBy(
		getGSuiteSupportedDomains( domains ),
		( domain ) => ! domain.isPrimary
	);

	return get( supportedDomains, '[0].name', '' );
}

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

export function getGSuiteMailboxCount( domain ) {
	return get( domain, 'googleAppsSubscription.totalUserCount', 0 );
}

/**
 * Creates the Google ToS redirect url given email and domain
 *
 * @param {string} email - email
 * @param {string} domain - domain name
 * @returns {string} - ToS url redirect
 */
export function getLoginUrlWithTOSRedirect( email, domain ) {
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
 * Given a domain object, does that domain have G Suite with us.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
export function hasGSuiteWithUs( domain ) {
	const defaultValue = '';
	const domainStatus = get( domain, 'googleAppsSubscription.status', defaultValue );
	return ! includes( [ defaultValue, 'no_subscription', 'other_provider' ], domainStatus );
}

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is with another provider, false otherwise
 */
export function hasGSuiteWithAnotherProvider( domain ) {
	const domainStatus = get( domain, 'googleAppsSubscription.status', '' );

	return 'other_provider' === domainStatus;
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

/**
 * Does a domain have pending G Suite Users
 *
 * @param {object} domain - domain object
 * @returns {boolean} - Does domain have pending G Suite users
 */
export function hasPendingGSuiteUsers( domain ) {
	return get( domain, 'googleAppsSubscription.pendingUsers.length', 0 ) !== 0;
}

/**
 * Determines whether the specified product slug is for G Suite Basic or Business.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite Basic or Business, false otherwise
 */
export function isGSuiteProductSlug( productSlug ) {
	return [ GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG ].includes( productSlug );
}

/**
 * Determines whether the specified product slug is for a G Suite extra license.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to an extra license, false otherwise
 */
export function isGSuiteExtraLicenseProductSlug( productSlug ) {
	return productSlug === GSUITE_EXTRA_LICENSE_SLUG;
}

/**
 * Determines whether the specified product slug refers to any type of G Suite product.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any G Suite product, false otherwise
 */
export function isGSuiteOrExtraLicenseProductSlug( productSlug ) {
	return isGSuiteProductSlug( productSlug ) || isGSuiteExtraLicenseProductSlug( productSlug );
}

/**
 * Determines whether G Suite can be purchased by the user based on their country.
 *
 * @returns {boolean} true if the user is allowed to purchase G Suite, false otherwise
 */
export function canUserPurchaseGSuite() {
	const user = userFactory();

	return get( user.get(), 'is_valid_google_apps_country', false );
}
