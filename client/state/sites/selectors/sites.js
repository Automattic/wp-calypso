/** @ssr-ready **/

export const getSites = ( state ) => {
	return state.sites.items;
};

/**
 * Returns true if we are requesting all sites.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export function isRequestingSites( state ) {
	return !! state.sites.requestingAll;
}

export const getJetpackSites = ( state ) => {
	return getSites( state ).filter( function( site ) {
		return site.jetpack;
	} );
};

export const getPublicSites = ( state ) => {
	return getSites( state ).filter( function( site ) {
		return ! site.is_private;
	} );
};

/**
 * Get sites that are marked as visible
 *
 * @api public
 **/
export const getVisibleSites = ( state ) => {
	return getSites( state ).filter( function( site ) {
		return site.visible === true;
	} );
};

export const getUpgradeableSites = ( state ) => {
	return getSites( state ).filter( function( site ) {
		return site.is_upgradable;
	} );
};
