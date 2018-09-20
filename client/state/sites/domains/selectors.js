/** @format */

/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import treeSelect from 'lib/tree-select';

// static empty array to ensure that empty return values from selectors are
// identical to each other ( rv1 === rv2 )
const EMPTY_SITE_DOMAINS = Object.freeze( [] );

/**
 * Return site domains getting from state object and
 * the given siteId
 *
 * @param {Object} state - current state object
 * @param {Number} siteId - site identificator
 * @return {Array} site domains
 */
export const getDomainsBySiteId = ( state, siteId ) => {
	if ( ! siteId ) {
		return EMPTY_SITE_DOMAINS;
	}

	return state.sites.domains.items[ siteId ] || EMPTY_SITE_DOMAINS;
};

/**
 * Return site domains getting from state object and
 * the given site object
 *
 * @param {Object} state - current state object
 * @param {Object} site - site object
 * @return {Array} site domains
 */
export const getDomainsBySite = ( state, site ) => {
	if ( ! site ) {
		return EMPTY_SITE_DOMAINS;
	}

	return getDomainsBySiteId( state, site.ID );
};

/**
 * Return requesting state for the given site
 *
 * @param {Object} state - current state object
 * @param {Number} siteId - site identifier
 * @return {Boolean} is site-domains requesting?
 */
export const isRequestingSiteDomains = ( state, siteId ) => {
	return state.sites.domains.requesting[ siteId ] || false;
};

/**
 * Returns decorated site domains with objects we don't want to store in Redux state tree.
 *
 * @param  {Object}  state  global state
 * @param  {Number}  siteId the site id
 * @return {?Object}        decorated site domains
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
			transferEndDateMoment: domain.transferStartDate
				? moment( domain.transferStartDate ).add( 7, 'days' )
				: null,
		} ) );
	}
);
