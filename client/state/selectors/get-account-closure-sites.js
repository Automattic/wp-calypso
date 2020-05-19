/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSites from 'state/selectors/get-sites';
import { isJetpackSite } from 'state/sites/selectors';
import { userCan } from 'lib/site/utils';

/**
 * Get all the sites which are deleted after account closure
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Array of site objects
 */
export default createSelector( ( state ) =>
	getSites( state ).filter(
		( site ) => ! isJetpackSite( state, site.ID ) && userCan( 'manage_options', site )
	)
);
