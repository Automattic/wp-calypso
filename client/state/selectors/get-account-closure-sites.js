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

// activate_wordads is the only capability that returns true exclusively for the site owner
// See here: https://github.com/Automattic/jetpack/blob/2e190a1ffe33df32f19a0632d5e6f34589e79035/sal/class.json-api-site-base.php#L424
export default createSelector( ( state ) =>
	getSites( state ).filter(
		( site ) => ! isJetpackSite( state, site.ID ) && userCan( 'activate_wordads', site )
	)
);
