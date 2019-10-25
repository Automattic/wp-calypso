/**
 * External dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';
import { get, has } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import treeSelect from '@automattic/tree-select';

// static empty array to ensure that empty return values from selectors are
// identical to each other ( rv1 === rv2 )
const EMPTY_SITE_DOMAINS = Object.freeze( [] );

/**
 * Returns the list of site domains for the specified site identifier.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {Array} the list of domains
 */
export const getDomainsBySiteId = ( state, siteId ) => {
	if ( ! siteId ) {
		return EMPTY_SITE_DOMAINS;
	}

	return state.sites.domains.items[ siteId ] || EMPTY_SITE_DOMAINS;
};

/**
 * Returns the list of site domains for the specified site.
 *
 * @param {object} state - global state tree
 * @param {object} site - site object
 * @returns {Array} the list of domains
 */
export const getDomainsBySite = ( state, site ) => {
	if ( ! site ) {
		return EMPTY_SITE_DOMAINS;
	}

	return getDomainsBySiteId( state, site.ID );
};

/**
 * Determines whether the list of domains for the specified site has loaded.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {boolean} true if the list of domains has loaded, false otherwise
 */
export const hasLoadedSiteDomains = ( state, siteId ) => {
	return has( state, [ 'sites', 'domains', 'items', siteId ] );
};

/**
 * Determines whether the list of domains is being requested via the API.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {boolean} true if the list of domains is being requested, false otherwise
 */
export const isRequestingSiteDomains = ( state, siteId ) => {
	return state.sites.domains.requesting[ siteId ] || false;
};

export const isUpdatingDomainPrivacy = ( state, siteId, domain ) => {
	return get( state, [ 'sites', 'domains', 'updatingPrivacy', siteId, domain ] );
};

/**
 * Returns the list of domains for the specified site with additional properties. This approach is used to avoid storing
 * those extra objects in the Redux state tree.
 *
 * @param  {object} state - global state tree
 * @param  {number} siteId - identifier of the site
 * @returns {?object} the list of site domains decorated
 */
export const getDecoratedSiteDomains = treeSelect(
	( state, siteId ) => [ getDomainsBySiteId( state, siteId ) ],
	( [ domains ] ) => {
		if ( ! domains ) {
			return null;
		}

		const localeSlug = getLocaleSlug();

		return domains.map( domain => ( {
			...domain,
			// TODO: Remove moment dependency.
			// For now, since it's unclear whether locales are needed by any subscribers to this selector,
			// return moment instances with current locale information from `i18n-calypso` applied.
			autoRenewalMoment: domain.autoRenewalDate
				? moment( domain.autoRenewalDate ).locale( localeSlug )
				: null,
			registrationMoment: domain.registrationDate
				? moment( domain.registrationDate ).locale( localeSlug )
				: null,
			expirationMoment: domain.expiry ? moment( domain.expiry ).locale( localeSlug ) : null,
			transferAwayEligibleAtMoment: domain.transferAwayEligibleAt
				? moment( domain.transferAwayEligibleAt ).locale( localeSlug )
				: null,
			transferEndDateMoment: domain.transferStartDate
				? moment( domain.transferStartDate )
						.locale( localeSlug )
						.add( 7, 'days' )
				: null,
		} ) );
	}
);
