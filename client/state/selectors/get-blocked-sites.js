/** @format */

/**
 * External dependencies
 */

import { map, pickBy } from 'lodash';
import createSelector from 'client/lib/create-selector';

/**
 * Returns a list of site IDs blocked by the user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}        Blocked site IDs
 */
export default createSelector(
	state => map( Object.keys( pickBy( state.reader.siteBlocks.items ) ), Number ),
	state => [ state.reader.siteBlocks.items ]
);
