import 'calypso/state/jetpack/init';

/**
 * Returns true if the module key is currently valid. False otherwise.
 * Returns null if the validity for the queried site and module is unknown.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  moduleSlug  Slug of the module
 * @returns {?boolean}            Whether the module is active
 */
export const isJetpackModuleKeyValid = ( state, siteId, moduleSlug ) =>
	state?.jetpack?.modules?.keys?.[ siteId ]?.[ moduleSlug ];
