/** @format */

/**
 * @typedef {object} RewindSiteAlerts
 * @property {Array} threats
 */

/** @type RewindSiteAlerts */
const emptyState = {
	threats: [],
};

/**
 * Gets list of loaded site alerts from the
 * Rewind system: plugin updates, threats, and suggestions
 *
 * @param {object} state Rewind state
 * @param {number} siteId site for which to get alerts
 * @return {RewindSiteAlerts} known alerts for site
 */
export const getRewindAlerts = ( state, siteId ) => {
	try {
		return state.rewindAlerts[ siteId ] || emptyState;
	} catch ( e ) {
		return emptyState;
	}
};

export default getRewindAlerts;
