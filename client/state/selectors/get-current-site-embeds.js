/**
 * Internal dependencies
 */
import getSiteEmbeds from 'calypso/state/selectors/get-site-embeds';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns the supported embed patterns of the currently selected site.
 *
 * @param   {object} state   Global state tree
 * @returns {object}         Site embeds
 */
export default ( state ) => getSiteEmbeds( state, getSelectedSiteId( state ) );
