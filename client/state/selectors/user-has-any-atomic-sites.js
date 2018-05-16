/** @format */

/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSitesItems, isSiteAutomatedTransfer as isAtomicSite } from 'state/selectors';

/**
 * Whether the user currently has any Atomic sites
 *
 * @param {Object} state  Global state tree
 * @return {Boolean}
 */
export default createSelector(
	state => some( getSitesItems( state ), site => isAtomicSite( state, site.ID ) ),
	state => [ getSitesItems( state ) ]
);
