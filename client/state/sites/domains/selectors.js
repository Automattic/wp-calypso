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
