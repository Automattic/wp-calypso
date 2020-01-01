/**
 * Internal dependencies
 */
import getSitesItems from 'state/selectors/get-sites-items';

/**
 * Returns a raw site object by its ID.
 *
 * @param  {object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site object
 */
export default ( state, siteId ) => {
	return getSitesItems( state )[ siteId ] || null;
};
