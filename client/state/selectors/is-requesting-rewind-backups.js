/**
 * Returns true if we are requesting the rewind backups for the specified site ID, false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @returns {boolean}        Whether site's rewind backups are being requested
 */
export default ( state, siteId ) => state.rewind?.[ siteId ]?.backups?.requesting ?? false;
