/**
 * Returns the supported embed patterns of the specified site.
 *
 * @param   {object} state   Global state tree
 * @param   {number} siteId  Site ID
 * @returns {object}         Site embeds
 */
export default ( state, siteId ) => state.embeds.siteItems?.[ siteId ] ?? null;
