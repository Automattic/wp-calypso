/**
 * External dependencies
 */
import { map, pickBy } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import 'state/reader/init';

/**
 * Returns a list of site IDs blocked by the user
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}        Blocked site IDs
 */
export default createSelector(
	( state ) => map( Object.keys( pickBy( state.reader.siteBlocks.items ) ), Number ),
	( state ) => [ state.reader.siteBlocks.items ]
);
