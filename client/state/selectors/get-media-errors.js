import 'calypso/state/media/init';

/**
 * Retrieves all media validation errors for a specified site.
 *
 * @param {Object}   state  global state tree
 * @param {number}   siteId ID of the site
 * @returns {Object}        Media validation errors for that site.
 */
export default ( state, siteId ) => state.media.errors?.[ siteId ] ?? {};
