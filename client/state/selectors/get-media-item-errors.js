/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Retrieves all media validation errors for a certain media item of a specified site.
 *
 * @param {object}   state   global state tree
 * @param {number}   siteId  ID of the site
 * @param {number}   mediaId ID of the media item
 * @returns {Array}          Media validation errors for that media item of that site.
 */
export default ( state, siteId, mediaId ) => state.media.errors?.[ siteId ]?.[ mediaId ] ?? [];
