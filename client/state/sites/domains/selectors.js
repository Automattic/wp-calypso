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

export const getAllDomains = ( state ) => {
	return state.sites.domains.items;
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
	return Boolean( state?.sites?.domains?.items?.[ siteId ] );
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

export const getAllRequestingSiteDomains = ( state ) => {
	return state.sites.domains.requesting;
};

export const isUpdatingDomainPrivacy = ( state, siteId, domain ) => {
	return state?.sites?.domains?.updatingPrivacy?.[ siteId ]?.[ domain ];
};
