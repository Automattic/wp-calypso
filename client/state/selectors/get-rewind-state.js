const uninitialized = {
	state: 'uninitialized',
};

/**
 * Get the entire Rewind state object.
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {object} Rewind state object
 */
export default function getRewindState( state, siteId ) {
	return state.rewind?.[ siteId ]?.state ?? uninitialized;
}
