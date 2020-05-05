/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

/**
 * Whether the user currently has any Atomic sites
 *
 * @param {object} state  Global state tree
 * @returns {boolean}
 */
export default createSelector(
	( state ) => some( getSitesItems( state ), ( site ) => isAtomicSite( state, site.ID ) ),
	( state ) => [ getSitesItems( state ) ]
);
