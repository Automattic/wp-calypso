/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getSites from 'calypso/state/selectors/get-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { userCan } from 'calypso/lib/site/utils';

/**
 * Get all the sites which are deleted after account closure
 * (WordPress.com sites which the user is the owner of)
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Array of site objects
 */
export default createSelector( ( state ) =>
	getSites( state ).filter(
		( site ) => ! isJetpackSite( state, site.ID ) && userCan( 'own_site', site )
	)
);
