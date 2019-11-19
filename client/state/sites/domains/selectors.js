/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import { get, has } from 'lodash';

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

		return domains.map( domain => ( {
			...domain,
			autoRenewalMoment: domain.autoRenewalDate ? moment( domain.autoRenewalDate ) : null,
			registrationMoment: domain.registrationDate ? moment( domain.registrationDate ) : null,
			expirationMoment: domain.expiry ? moment( domain.expiry ) : null,
			transferAwayEligibleAtMoment: domain.transferAwayEligibleAt
				? moment( domain.transferAwayEligibleAt )
				: null,
			transferEndDateMoment: domain.transferStartDate
				? moment( domain.transferStartDate ).add( 7, 'days' )
				: null,
		} ) );
	}
);
