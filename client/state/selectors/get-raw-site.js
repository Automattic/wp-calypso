/**
 * Internal dependencies
 */
import getSitesItems from 'calypso/state/selectors/get-sites-items';

/**
 * Returns a raw site object by its ID.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?object}        Site object
 */
export default ( state, siteId ) => {
	return getSitesItems( state )[ siteId ] || null;
};
