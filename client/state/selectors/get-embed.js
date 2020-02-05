/**
 * Returns the details to render an embed, identified by an embeddable URL.
 *
 * @param   {object} state   Global state tree
 * @param   {number} siteId  Site ID
 * @param   {string} url     Embeddable URL
 * @returns {object}         Embed data
 */
export default ( state, siteId, url ) => state.embeds.urlItems?.[ siteId ]?.[ url ] ?? null;
