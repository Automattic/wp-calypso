/** @format */
/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

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
		return [];
	}

	const { items } = state.sites.domains;
	return items[ siteId ] || [];
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
		return [];
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
	const { requesting } = state.sites.domains;
	return requesting[ siteId ] || false;
};

/**
 * Returns decorated site domains with objects we don't want to store in Redux state tree.
 *
 * @param  {Object}  state  global state
 * @param  {Number}  siteId the site id
 * @return {?Object}        decorated site domains
 */
export function getDecoratedSiteDomains( state, siteId ) {
	const domains = getDomainsBySiteId( state, siteId );

	if ( ! domains ) {
		return null;
	}

	return domains.map( domain => {
		return {
			...domain,

			autoRenewalMoment: domain.autoRenewalDate ? moment( domain.autoRenewalDate ) : null,

			registrationMoment: domain.registrationDate ? moment( domain.registrationDate ) : null,

			expirationMoment: domain.expiry ? moment( domain.expiry ) : null,
		};
	} );
}
